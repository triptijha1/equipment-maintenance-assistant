const express = require("express");
const cors = require("cors");

const equipmentRoute = require("./routes/equipment.route");
const issueRoute = require("./routes/issue.route");
const aiRoute = require("./routes/ai.route");
const workOrderRoute = require("./routes/workOrder.route");


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/equipment", equipmentRoute);
app.use("/api/issues", issueRoute);
app.use("/api/ai", aiRoute);
app.use("/api/work-orders", workOrderRoute);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Equipment Maintenance Assistant API is running!"
  });
});


module.exports = app;