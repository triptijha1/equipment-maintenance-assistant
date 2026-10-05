const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    type: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Equipment = mongoose.model("Equipment", equipmentSchema);

module.exports = Equipment;