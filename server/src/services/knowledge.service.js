const Knowledge = require("../models/knowledge.model");

const retrieveKnowledge = async (equipmentType, issueDescription) => {
  const searchText = issueDescription.toLowerCase();

  const documents = await Knowledge.find({
    equipmentType
  });

  const scoredDocuments = documents.map((document) => {
    let score = 0;

    for (const keyword of document.keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        score++;
      }
    }

    return {
      document,
      score
    };
  });

  return scoredDocuments
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.document);
};

module.exports = {
  retrieveKnowledge
};