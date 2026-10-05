const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    operatingEvents: [
      {
        type: String,
        trim: true
      }
    ],

    sensorReadings: [
      {
        name: {
          type: String,
          required: true
        },

        value: {
          type: Number
        },

        unit: {
          type: String
        }
      }
    ],

    thresholdResults: [
      {
        sensor: String,
        value: Number,
        unit: String,
        status: String,
        message: String
      }
    ],

    // AI-generated analysis
    aiAnalysis: {
      type: mongoose.Schema.Types.Mixed
    },

    status: {
      type: String,
      enum: [
        "REPORTED",
        "ANALYZING",
        "DRAFT",
        "APPROVED",
        "REJECTED"
      ],
      default: "REPORTED"
    }
  },
  {
    timestamps: true
  }
);

const Issue = mongoose.model("Issue", issueSchema);

module.exports = Issue;