const express = require("express");

const {
  createEquipment
} = require("../controllers/equipment.controller");

const router = express.Router();

router.post("/", createEquipment);

module.exports = router;