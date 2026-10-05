const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const analyzeIssue = async ({
  equipment,
  issue,
  knowledge
}) => {
  const knowledgeText = knowledge
    .map(
      (doc) =>
        `${doc.title}\n${doc.content}`
    )
    .join("\n\n");

  const prompt = `
You are an equipment maintenance triage assistant.

Your job is to help a technician investigate an equipment issue.

IMPORTANT RULES:
- Do NOT claim a root cause is confirmed.
- Possible causes must be presented only as hypotheses.
- Only technician-confirmed findings can be called confirmed.
- Use sensor readings and operating events as observations.
- If sensor data is missing, say it is missing. Never assume zero.
- If readings conflict, explicitly mention the conflict.
- Recommend inspection steps, not automatic repairs.
- Never remotely control equipment.
- Never approve maintenance automatically.

Equipment:
Type: ${equipment.type}
Identifier: ${equipment.identifier}

Issue:
${issue.description}

Operating events:
${issue.operatingEvents.join(", ") || "None provided"}

Sensor readings:
${JSON.stringify(issue.sensorReadings)}

Deterministic threshold results:
${JSON.stringify(issue.thresholdResults)}

Relevant manual sections:
${knowledgeText || "No relevant manual sections found."}

Return ONLY valid JSON using this exact structure:

{
  "observations": [],
  "possibleCauses": [
    {
      "cause": "",
      "reason": "",
      "evidence": []
    }
  ],
  "followUpQuestions": [],
  "inspectionSteps": [],
  "priority": "LOW",
  "summary": "",
  "evidence": []
}

Priority must be one of:
LOW, MEDIUM, HIGH, CRITICAL

Evidence should reference the supplied sensor readings, operating events, or manual section titles.
`;

  const models = [
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.5-flash-lite"
  ];

  let response;
  let lastError;

  for (const model of models) {
    try {
      console.log(`Trying Gemini model: ${model}`);

      response = await ai.models.generateContent({
        model: model,
        contents: prompt
      });

      console.log(`Gemini model succeeded: ${model}`);

      break;
    } catch (error) {
      lastError = error;

      console.log(`Gemini model failed: ${model}`);
      console.log(error.message);

      // Try the next model only for temporary availability errors
      if (!error.message.includes("503")) {
        throw error;
      }
    }
  }

  if (!response) {
    throw lastError;
  }

  const text = response.text;

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  const cleanedText = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini returned invalid JSON:");
    console.error(cleanedText);

    throw new Error("Gemini returned invalid JSON");
  }
};

module.exports = {
  analyzeIssue
};