const mongoose = require("mongoose");

const knowledgeSchema = new mongoose.Schema(
  {
    equipmentType: {
      type: String,
      required: true
    },

    title: {
      type: String,
      required: true
    },

    content: {
      type: String,
      required: true
    },

    keywords: [
      {
        type: String
      }
    ]
  },
  {
    timestamps: true
  }
);

const Knowledge = mongoose.model("Knowledge", knowledgeSchema);

module.exports = Knowledge;