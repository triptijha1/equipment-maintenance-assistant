const Equipment = require("../models/equipment.model");

const createEquipment = async (req, res) => {
  try {
    const { identifier, type, description } = req.body;

    // Required fields check
    if (!identifier || !type) {
      return res.status(400).json({
        message: "Equipment identifier and type are required"
      });
    }

    // Check if equipment already exists
    const existingEquipment = await Equipment.findOne({
      identifier
    });

    if (existingEquipment) {
      return res.status(409).json({
        message: "Equipment with this identifier already exists"
      });
    }

    // Create equipment
    const equipment = await Equipment.create({
      identifier,
      type,
      description
    });

    res.status(201).json({
      message: "Equipment created successfully",
      equipment
    });

  } catch (error) {
    console.error("Create equipment error:", error);

    res.status(500).json({
      message: "Failed to create equipment"
    });
  }
};

module.exports = {
  createEquipment
};