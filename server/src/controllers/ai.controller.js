const Issue = require("../models/issue.model");
const Equipment = require("../models/equipment.model");

const { retrieveKnowledge } = require("../services/knowledge.service");
const { analyzeIssue } = require("../services/ai.service");

const analyzeIssueController = async (req, res) => {
  try {
    const { issueId } = req.params;

    // 1. Find issue
    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({
        message: "Issue not found"
      });
    }

    // 2. Find equipment
    const equipment = await Equipment.findById(issue.equipmentId);

    if (!equipment) {
      return res.status(404).json({
        message: "Equipment not found"
      });
    }

    // 3. Retrieve relevant knowledge
    const knowledge = await retrieveKnowledge(
      equipment.type,
      issue.description
    );

    // 4. Analyze using Gemini
    const analysis = await analyzeIssue({
      equipment,
      issue,
      knowledge
    });

    // 5. Explicitly save AI analysis
    const updatedIssue = await Issue.findByIdAndUpdate(
      issueId,
      {
        $set: {
          aiAnalysis: analysis,
          status: "DRAFT"
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedIssue) {
      return res.status(404).json({
        message: "Issue could not be updated"
      });
    }

    console.log("AI analysis saved successfully");
    console.log("Issue status:", updatedIssue.status);
    console.log("AI analysis exists:", !!updatedIssue.aiAnalysis);

    res.status(200).json({
      message: "Issue analyzed successfully",
      analysis,
      evidence: knowledge.map((doc) => ({
        title: doc.title,
        content: doc.content
      }))
    });

  } catch (error) {
    console.error("AI analysis error:", error);

    res.status(500).json({
      message: "AI analysis failed",
      error: error.message
    });
  }
};

module.exports = {
  analyzeIssueController
};