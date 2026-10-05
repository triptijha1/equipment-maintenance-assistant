const express = require("express");

const {
  analyzeIssueController
} = require("../controllers/ai.controller");

const router = express.Router();

router.post("/:issueId/analyze", analyzeIssueController);

module.exports = router;