const assert = require("assert");

const {
  checkThresholds
} = require("../src/services/rule.service");

console.log("Running rule service tests...\n");

// ------------------------------------------
// Test 1: Normal readings
// ------------------------------------------

const normalResult = checkThresholds([
  {
    name: "Temperature",
    value: 70,
    unit: "°C"
  },
  {
    name: "Vibration",
    value: 4,
    unit: "mm/s"
  },
  {
    name: "Pressure",
    value: 5,
    unit: "bar"
  }
]);

assert.strictEqual(
  normalResult[0].status,
  "NORMAL"
);

assert.strictEqual(
  normalResult[1].status,
  "NORMAL"
);

assert.strictEqual(
  normalResult[2].status,
  "NORMAL"
);

console.log("✓ Normal sensor readings");


// ------------------------------------------
// Test 2: Threshold violation
// ------------------------------------------

const warningResult = checkThresholds([
  {
    name: "Temperature",
    value: 85,
    unit: "°C"
  },
  {
    name: "Vibration",
    value: 8.5,
    unit: "mm/s"
  },
  {
    name: "Pressure",
    value: 2,
    unit: "bar"
  }
]);

assert.strictEqual(
  warningResult[0].status,
  "WARNING"
);

assert.strictEqual(
  warningResult[1].status,
  "HIGH"
);

assert.strictEqual(
  warningResult[2].status,
  "LOW"
);

console.log("✓ Threshold violations");


// ------------------------------------------
// Test 3: Missing sensor
// ------------------------------------------

const missingResult = checkThresholds([
  {
    name: "Temperature",
    value: null,
    unit: "°C"
  }
]);

assert.strictEqual(
  missingResult[0].status,
  "MISSING"
);

console.log("✓ Missing sensor data");


// ------------------------------------------
// Test 4: Conflicting sensor readings
// ------------------------------------------

const conflictResult = checkThresholds([
  {
    name: "Temperature",
    value: 80,
    unit: "°C"
  },
  {
    name: "Temperature",
    value: 95,
    unit: "°C"
  }
]);

assert.strictEqual(
  conflictResult[0].status,
  "CONFLICT"
);

console.log("✓ Conflicting sensor data");


// ------------------------------------------
// Final result
// ------------------------------------------

console.log("\nAll rule service tests passed ✓");