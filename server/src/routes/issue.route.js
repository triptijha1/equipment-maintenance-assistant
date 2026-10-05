const express = require("express");

const {
  createIssue,
  getIssueHistory
} = require("../controllers/issue.controller");

const router = express.Router();

router.post("/", createIssue);
router.get("/history/:equipmentId", getIssueHistory);

module.exports = router;