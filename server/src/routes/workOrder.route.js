const express = require("express");

const {
  createWorkOrder,
  reviewWorkOrder
} = require("../controllers/workOrder.controller");

const router = express.Router();

router.post("/:issueId", createWorkOrder);
router.patch("/:workOrderId/review", reviewWorkOrder);

module.exports = router;