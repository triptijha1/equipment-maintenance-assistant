const checkThresholds = (sensorReadings = []) => {
  const results = [];

  // --------------------------------
  // Check duplicate/conflicting data
  // --------------------------------

  const readingsByName = {};

  for (const reading of sensorReadings) {
    if (!reading?.name) {
      continue;
    }

    const key = reading.name.toLowerCase();

    if (!readingsByName[key]) {
      readingsByName[key] = [];
    }

    readingsByName[key].push(reading);
  }

  const conflictingSensors = new Set();

  for (const [sensorName, readings] of Object.entries(
    readingsByName
  )) {
    const validReadings = readings.filter(
      (reading) =>
        reading.value !== undefined &&
        reading.value !== null
    );

    if (validReadings.length > 1) {
      const values = validReadings.map(
        (reading) => reading.value
      );

      const firstValue = values[0];

      const hasConflict = values.some(
        (value) => value !== firstValue
      );

      if (hasConflict) {
        conflictingSensors.add(sensorName);

        results.push({
          sensor: sensorName,
          value: null,
          unit: validReadings[0].unit,
          status: "CONFLICT",
          message: `Conflicting ${sensorName} readings were provided: ${values.join(
            ", "
          )}`
        });
      }
    }
  }

  // --------------------------------
  // Deterministic threshold checks
  // --------------------------------

  for (const reading of sensorReadings) {
    const { name, value, unit } = reading;

    if (!name) {
      continue;
    }

    const lowerName = name.toLowerCase();

    // Don't run threshold logic for
    // conflicting sensor data.
    if (conflictingSensors.has(lowerName)) {
      continue;
    }

    // Missing reading
    if (value === undefined || value === null) {
      results.push({
        sensor: name,
        value: null,
        unit,
        status: "MISSING",
        message: `${name} reading is missing`
      });

      continue;
    }

    // Temperature
    if (lowerName === "temperature") {
      if (value > 80) {
        results.push({
          sensor: name,
          value,
          unit,
          status: "WARNING",
          message:
            "Temperature is above the safe threshold"
        });
      } else {
        results.push({
          sensor: name,
          value,
          unit,
          status: "NORMAL",
          message:
            "Temperature is within the expected range"
        });
      }
    }

    // Vibration
    else if (lowerName === "vibration") {
      if (value > 7) {
        results.push({
          sensor: name,
          value,
          unit,
          status: "HIGH",
          message:
            "Vibration exceeds the defined threshold"
        });
      } else {
        results.push({
          sensor: name,
          value,
          unit,
          status: "NORMAL",
          message:
            "Vibration is within the expected range"
        });
      }
    }

    // Pressure
    else if (lowerName === "pressure") {
      if (value < 3) {
        results.push({
          sensor: name,
          value,
          unit,
          status: "LOW",
          message:
            "Pressure is below the defined threshold"
        });
      } else {
        results.push({
          sensor: name,
          value,
          unit,
          status: "NORMAL",
          message:
            "Pressure is within the expected range"
        });
      }
    }
  }

  return results;
};

module.exports = {
  checkThresholds
};