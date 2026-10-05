require("dotenv").config();

const connectDB = require("./src/config/db");
const Knowledge = require("./src/models/knowledge.model");

const seedKnowledge = async () => {
  try {
    await connectDB();

    await Knowledge.deleteMany({});

    await Knowledge.insertMany([
      {
        equipmentType: "Industrial Pump",
        title: "Section 4.2 - Excessive Vibration",
        content:
          "Excessive pump vibration may be associated with bearing wear, shaft misalignment, loose mounting, or imbalance. Inspect mounting bolts, coupling alignment, and bearing condition before confirming the root cause.",
        keywords: [
          "vibration",
          "bearing",
          "alignment",
          "mounting",
          "imbalance"
        ]
      },

      {
        equipmentType: "Industrial Pump",
        title: "Section 4.3 - Unusual Noise",
        content:
          "Unusual mechanical noise can indicate bearing deterioration, loose components, cavitation, or misalignment. Check for abnormal bearing sounds, loose components, and operating conditions.",
        keywords: [
          "noise",
          "bearing",
          "loose",
          "cavitation",
          "misalignment"
        ]
      },

      {
        equipmentType: "Industrial Pump",
        title: "Section 5.1 - High Temperature",
        content:
          "Pump temperature above the defined operating threshold requires inspection. Possible contributors include excessive friction, bearing problems, inadequate lubrication, or abnormal operating conditions.",
        keywords: [
          "temperature",
          "heat",
          "bearing",
          "friction",
          "lubrication"
        ]
      },

      {
        equipmentType: "Industrial Pump",
        title: "Section 6.1 - Inspection Procedure",
        content:
          "Before maintenance, inspect the pump mounting, coupling alignment, bearings, lubrication condition, and signs of leakage. Record findings before replacing components.",
        keywords: [
          "inspection",
          "maintenance",
          "alignment",
          "bearings",
          "lubrication",
          "leakage"
        ]
      }
    ]);

    console.log("Knowledge base seeded successfully");

    process.exit(0);
  } catch (error) {
    console.error("Knowledge seed error:", error);
    process.exit(1);
  }
};

seedKnowledge();