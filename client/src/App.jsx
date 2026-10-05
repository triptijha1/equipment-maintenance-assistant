import { useState } from "react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const EQUIPMENT_ID = "6ac1122e9e20a63921fa8b83";

function App() {
  // -----------------------------
  // Issue form
  // -----------------------------

  const [description, setDescription] = useState(
    "Pump is producing excessive vibration and unusual noise"
  );

  const [events, setEvents] = useState(
    "Pump restarted twice in the last hour\nNoise started after restart"
  );

  const [temperature, setTemperature] = useState("82");
  const [vibration, setVibration] = useState("8.2");
  const [pressure, setPressure] = useState("5.1");

  // -----------------------------
  // Application state
  // -----------------------------

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [issue, setIssue] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [workOrder, setWorkOrder] = useState(null);

  // -----------------------------
  // Technician review state
  // -----------------------------

  const [technicianNotes, setTechnicianNotes] = useState("");
  const [editedPriority, setEditedPriority] = useState("");
  const [editedSummary, setEditedSummary] = useState("");
  const [editedActions, setEditedActions] = useState([]);

  // -----------------------------
  // Maintenance history
  // -----------------------------

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // -----------------------------
  // Fetch maintenance history
  // -----------------------------

  const fetchHistory = async () => {
    setHistoryLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/issues/history/${EQUIPMENT_ID}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch maintenance history"
        );
      }

      setHistory(data.history || []);
    } catch (err) {
      console.error("History error:", err);

      // History should not break the main workflow.
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // -----------------------------
  // Analyze issue
  // -----------------------------

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");

    // Basic frontend validation
    if (!description.trim()) {
      setError("Please enter an issue description.");
      setLoading(false);
      return;
    }

    try {
      // --------------------------------
      // Build sensor readings
      // --------------------------------

      const sensorReadings = [
        {
          name: "Temperature",
          value:
            temperature === "" || temperature === null
              ? null
              : Number(temperature),
          unit: "°C"
        },
        {
          name: "Vibration",
          value:
            vibration === "" || vibration === null
              ? null
              : Number(vibration),
          unit: "mm/s"
        },
        {
          name: "Pressure",
          value:
            pressure === "" || pressure === null
              ? null
              : Number(pressure),
          unit: "bar"
        }
      ];

      // --------------------------------
      // Operating events
      // --------------------------------

      const operatingEvents = events
        .split("\n")
        .map((event) => event.trim())
        .filter(Boolean);

      // --------------------------------
      // 1. Create issue
      // --------------------------------

      const issueResponse = await fetch(
        `${API_URL}/api/issues`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            equipmentId: EQUIPMENT_ID,
            description: description.trim(),
            operatingEvents,
            sensorReadings
          })
        }
      );

      const issueData = await issueResponse.json();

      if (!issueResponse.ok) {
        throw new Error(
          issueData.message || "Failed to create issue"
        );
      }

      const createdIssue = issueData.issue;

      setIssue(createdIssue);

      // --------------------------------
      // 2. Run AI analysis
      // --------------------------------

      const aiResponse = await fetch(
        `${API_URL}/api/ai/${createdIssue._id}/analyze`,
        {
          method: "POST"
        }
      );

      const aiData = await aiResponse.json();

      if (!aiResponse.ok) {
        throw new Error(
          aiData.message || "AI analysis failed"
        );
      }

      setAnalysis(aiData.analysis || null);
      setEvidence(aiData.evidence || []);

      // Update issue locally with the generated AI analysis.
      setIssue((previousIssue) => ({
        ...previousIssue,
        aiAnalysis: aiData.analysis,
        status: "DRAFT"
      }));

      // --------------------------------
      // 3. Create draft work order
      // --------------------------------

      const workOrderResponse = await fetch(
        `${API_URL}/api/work-orders/${createdIssue._id}`,
        {
          method: "POST"
        }
      );

      const workOrderData =
        await workOrderResponse.json();

      if (!workOrderResponse.ok) {
        throw new Error(
          workOrderData.message ||
            "Failed to create work order"
        );
      }

      const createdWorkOrder =
        workOrderData.workOrder;

      setWorkOrder(createdWorkOrder);

      // Initialize editable fields
      setTechnicianNotes("");

      setEditedPriority(
        createdWorkOrder.priority || "MEDIUM"
      );

      setEditedSummary(
        createdWorkOrder.summary || ""
      );

      setEditedActions(
        Array.isArray(
          createdWorkOrder.recommendedActions
        )
          ? createdWorkOrder.recommendedActions
          : []
      );

      // --------------------------------
      // Refresh history
      // --------------------------------

      await fetchHistory();

      // --------------------------------
      // Scroll to results
      // --------------------------------

      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
      });
    } catch (err) {
      console.error("Analyze issue error:", err);

      setError(
        err.message ||
          "Something went wrong while analyzing the issue."
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Review work order
  // -----------------------------

  const reviewWorkOrder = async (decision) => {
    if (!workOrder) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Remove empty actions before sending to backend.
      const cleanedActions = editedActions
        .map((action) => action.trim())
        .filter(Boolean);

      if (!editedSummary.trim()) {
        throw new Error(
          "Work order summary cannot be empty."
        );
      }

      if (!editedPriority) {
        throw new Error(
          "Please select a work order priority."
        );
      }

      const response = await fetch(
        `${API_URL}/api/work-orders/${workOrder._id}/review`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            decision,
            priority: editedPriority,
            summary: editedSummary.trim(),
            recommendedActions: cleanedActions,
            technicianNotes: technicianNotes.trim()
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to review work order"
        );
      }

      setWorkOrder(data.workOrder);

      // Keep issue status in sync locally.
      setIssue((previousIssue) => {
        if (!previousIssue) {
          return previousIssue;
        }

        return {
          ...previousIssue,
          status:
            decision === "APPROVE"
              ? "APPROVED"
              : "REJECTED"
        };
      });

      // Refresh history
      await fetchHistory();
    } catch (err) {
      console.error("Review work order error:", err);

      setError(
        err.message || "Review failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Render
  // -----------------------------

  return (
    <div className="app">

      {/* =========================
          HEADER
      ========================== */}

      <header className="hero">
        <div>
          <p className="eyebrow">
            MAINTENANCE INTELLIGENCE
          </p>

          <h1>
            Equipment Maintenance Assistant
          </h1>

          <p className="hero-subtitle">
            AI-assisted triage with deterministic
            safety checks and technician review.
          </p>
        </div>

        <div className="equipment-badge">
          <span>●</span>
          PUMP-102
        </div>
      </header>

      <main className="container">

        {/* =========================
            EQUIPMENT
        ========================== */}

        <section className="equipment-card">
          <div>
            <p className="card-label">
              EQUIPMENT
            </p>

            <h2>Industrial Pump</h2>

            <p>
              PUMP-102 · Main cooling pump
            </p>
          </div>

          <div className="triage-status">
            <span>AI TRIAGE</span>

            <strong>
              Human Review Required
            </strong>
          </div>
        </section>

        {/* =========================
            ERROR
        ========================== */}

        {error && (
          <div className="error-box">
            <strong>
              Something went wrong
            </strong>

            <p>{error}</p>
          </div>
        )}

        {/* =========================
            STEP 01 - ISSUE
        ========================== */}

        <section className="card">

          <div className="section-heading">
            <div className="step-number">
              01
            </div>

            <div>
              <h2>
                Report an Issue
              </h2>

              <p>
                Provide the observed problem
                and recent operating events.
              </p>
            </div>
          </div>

          <label>
            Issue Description
          </label>

          <textarea
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            placeholder="Describe the equipment problem..."
          />

          <label>
            Recent Operating Events
          </label>

          <textarea
            value={events}
            onChange={(e) =>
              setEvents(e.target.value)
            }
            placeholder="Enter one event per line..."
          />

          <h3 className="sensor-title">
            Sensor Readings
          </h3>

          <div className="sensor-grid">

            {/* Temperature */}

            <div className="input-with-unit">
              <label>
                Temperature
              </label>

              <div>
                <input
                  type="number"
                  value={temperature}
                  onChange={(e) =>
                    setTemperature(
                      e.target.value
                    )
                  }
                  placeholder="Optional"
                />

                <span>°C</span>
              </div>
            </div>

            {/* Vibration */}

            <div className="input-with-unit">
              <label>
                Vibration
              </label>

              <div>
                <input
                  type="number"
                  step="0.1"
                  value={vibration}
                  onChange={(e) =>
                    setVibration(
                      e.target.value
                    )
                  }
                  placeholder="Optional"
                />

                <span>mm/s</span>
              </div>
            </div>

            {/* Pressure */}

            <div className="input-with-unit">
              <label>
                Pressure
              </label>

              <div>
                <input
                  type="number"
                  step="0.1"
                  value={pressure}
                  onChange={(e) =>
                    setPressure(
                      e.target.value
                    )
                  }
                  placeholder="Optional"
                />

                <span>bar</span>
              </div>
            </div>

          </div>

          <button
            className="primary-button"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading
              ? "Analyzing..."
              : "Analyze Issue →"}
          </button>

        </section>

        {/* =========================
            RESULTS
        ========================== */}

        {analysis && issue && (
          <>

            {/* =========================
                STEP 02 - SAFETY CHECKS
            ========================== */}

            <section className="card">

              <div className="section-heading">
                <div className="step-number">
                  02
                </div>

                <div>
                  <h2>
                    Safety Checks
                  </h2>

                  <p>
                    Deterministic threshold checks
                    run before AI recommendations.
                  </p>
                </div>
              </div>

              <div className="checks-list">

                {issue.thresholdResults?.length > 0 ? (
                  issue.thresholdResults.map(
                    (result, index) => (
                      <div
                        className="check-row"
                        key={index}
                      >
                        <div>
                          <strong>
                            {result.sensor}
                          </strong>

                          <span>
                            {result.value !== null &&
                            result.value !==
                              undefined
                              ? ` ${result.value} ${
                                  result.unit || ""
                                }`
                              : " Missing"}
                          </span>
                        </div>

                        <div
                          className={`status-badge ${
                            result.status?.toLowerCase() ||
                            ""
                          }`}
                        >
                          {result.status}
                        </div>

                        <p>
                          {result.message}
                        </p>
                      </div>
                    )
                  )
                ) : (
                  <div className="empty-box">
                    No sensor readings were provided.
                  </div>
                )}

              </div>
            </section>

            {/* =========================
                STEP 03 - AI ANALYSIS
            ========================== */}

            <section className="card">

              <div className="section-heading">
                <div className="step-number">
                  03
                </div>

                <div>
                  <h2>
                    AI Investigation
                  </h2>

                  <p>
                    AI suggestions are hypotheses
                    and require technician
                    verification.
                  </p>
                </div>
              </div>

              {/* Priority */}

              <div className="priority-banner">
                <span>
                  Suggested Priority
                </span>

                <strong
                  className={`priority ${
                    analysis.priority || ""
                  }`}
                >
                  {analysis.priority || "MEDIUM"}
                </strong>
              </div>

              {/* Observations */}

              <div className="analysis-section">
                <h3>
                  Observations
                </h3>

                {analysis.observations?.length >
                0 ? (
                  <ul>
                    {analysis.observations.map(
                      (item, index) => (
                        <li key={index}>
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="muted-text">
                    No observations were generated.
                  </p>
                )}
              </div>

              {/* Possible Causes */}

              <div className="analysis-section">
                <h3>
                  Possible Causes
                </h3>

                {analysis.possibleCauses
                  ?.length > 0 ? (
                  <div className="cause-list">

                    {analysis.possibleCauses.map(
                      (cause, index) => (
                        <div
                          className="cause-card"
                          key={index}
                        >
                          <strong>
                            {cause.cause}
                            {" "}
                            <span>
                              (Hypothesis)
                            </span>
                          </strong>

                          <p>
                            {cause.reason}
                          </p>

                          {cause.evidence
                            ?.length > 0 && (
                            <small>
                              Evidence:{" "}
                              {cause.evidence.join(
                                ", "
                              )}
                            </small>
                          )}
                        </div>
                      )
                    )}

                  </div>
                ) : (
                  <p className="muted-text">
                    No possible causes were generated.
                  </p>
                )}
              </div>

              {/* Confirmed Findings */}

              <div className="confirmed-box">
                <h3>
                  Confirmed Findings
                </h3>

                <p>
                  No root cause has been
                  confirmed yet. Technician
                  inspection is required before
                  confirming the cause.
                </p>
              </div>

              {/* Follow-up Questions */}

              <div className="analysis-section">
                <h3>
                  Follow-up Questions
                </h3>

                {analysis.followUpQuestions
                  ?.length > 0 ? (
                  <ul>
                    {analysis.followUpQuestions.map(
                      (question, index) => (
                        <li key={index}>
                          {question}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="muted-text">
                    No follow-up questions were generated.
                  </p>
                )}
              </div>

              {/* Inspection Steps */}

              <div className="analysis-section">
                <h3>
                  Inspection Steps
                </h3>

                {analysis.inspectionSteps
                  ?.length > 0 ? (
                  <ol>
                    {analysis.inspectionSteps.map(
                      (step, index) => (
                        <li key={index}>
                          {step}
                        </li>
                      )
                    )}
                  </ol>
                ) : (
                  <p className="muted-text">
                    No inspection steps were generated.
                  </p>
                )}
              </div>

              {/* Summary */}

              <div className="summary-box">
                <strong>
                  Summary
                </strong>

                <p>
                  {analysis.summary ||
                    "No summary available."}
                </p>
              </div>

            </section>

            {/* =========================
                STEP 04 - EVIDENCE
            ========================== */}

            <section className="card">

              <div className="section-heading">
                <div className="step-number">
                  04
                </div>

                <div>
                  <h2>
                    Evidence
                  </h2>

                  <p>
                    Manual sections used to support
                    the AI investigation.
                  </p>
                </div>
              </div>

              {evidence.length === 0 ? (
                <div className="empty-box">
                  No relevant manual sections
                  were retrieved.
                </div>
              ) : (
                <div className="evidence-list">

                  {evidence.map(
                    (item, index) => (
                      <div
                        className="evidence-card"
                        key={index}
                      >
                        <strong>
                          {item.title}
                        </strong>

                        <p>
                          {item.content}
                        </p>
                      </div>
                    )
                  )}

                </div>
              )}

            </section>

            {/* =========================
                STEP 05 - WORK ORDER
            ========================== */}

            {workOrder && (
              <section className="card work-order-card">

                <div className="section-heading">
                  <div className="step-number">
                    05
                  </div>

                  <div>
                    <h2>
                      Draft Work Order
                    </h2>

                    <p>
                      Review the AI-generated
                      draft before approving
                      maintenance.
                    </p>
                  </div>
                </div>

                {/* Meta */}

                <div className="work-order-meta">

                  <span>
                    Status:

                    <strong
                      className={`status-text ${
                        workOrder.status?.toLowerCase()
                      }`}
                    >
                      {workOrder.status}
                    </strong>
                  </span>

                  <span>
                    Priority:

                    <strong>
                      {workOrder.priority}
                    </strong>
                  </span>

                </div>

                {/* Summary */}

                <div className="summary-box">
                  <strong>
                    Work Order Summary
                  </strong>

                  <p>
                    {workOrder.summary}
                  </p>
                </div>

                {/* Recommended Actions */}

                <div className="analysis-section">
                  <h3>
                    Recommended Actions
                  </h3>

                  {workOrder.recommendedActions
                    ?.length > 0 ? (
                    <ul>
                      {workOrder.recommendedActions.map(
                        (action, index) => (
                          <li key={index}>
                            {action}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="muted-text">
                      No recommended actions.
                    </p>
                  )}
                </div>

                {/* =========================
                    EDIT DRAFT
                ========================== */}

                {workOrder.status ===
                  "DRAFT" && (
                  <>
                    <div className="edit-work-order">

                      <h3>
                        Edit Work Order
                      </h3>

                      <p className="edit-helper">
                        Review and modify the
                        AI-generated draft before
                        approving it.
                      </p>

                      {/* Priority */}

                      <label>
                        Priority
                      </label>

                      <select
                        value={editedPriority}
                        onChange={(e) =>
                          setEditedPriority(
                            e.target.value
                          )
                        }
                      >
                        <option value="LOW">
                          LOW
                        </option>

                        <option value="MEDIUM">
                          MEDIUM
                        </option>

                        <option value="HIGH">
                          HIGH
                        </option>

                        <option value="CRITICAL">
                          CRITICAL
                        </option>
                      </select>

                      {/* Summary */}

                      <label>
                        Work Order Summary
                      </label>

                      <textarea
                        value={editedSummary}
                        onChange={(e) =>
                          setEditedSummary(
                            e.target.value
                          )
                        }
                      />

                      {/* Actions */}

                      <label>
                        Recommended Actions
                      </label>

                      <div className="action-editor">

                        {editedActions.map(
                          (action, index) => (
                            <div
                              className="action-row"
                              key={index}
                            >
                              <input
                                type="text"
                                value={action}
                                onChange={(e) => {
                                  const updatedActions =
                                    [
                                      ...editedActions
                                    ];

                                  updatedActions[
                                    index
                                  ] =
                                    e.target.value;

                                  setEditedActions(
                                    updatedActions
                                  );
                                }}
                              />

                              <button
                                type="button"
                                className="remove-action"
                                onClick={() => {
                                  setEditedActions(
                                    editedActions.filter(
                                      (_, i) =>
                                        i !== index
                                    )
                                  );
                                }}
                              >
                                ×
                              </button>
                            </div>
                          )
                        )}

                      </div>

                      <button
                        type="button"
                        className="add-action"
                        onClick={() => {
                          setEditedActions([
                            ...editedActions,
                            ""
                          ]);
                        }}
                      >
                        + Add Inspection Step
                      </button>

                      {/* Technician Notes */}

                      <label>
                        Technician Notes
                      </label>

                      <textarea
                        value={technicianNotes}
                        onChange={(e) =>
                          setTechnicianNotes(
                            e.target.value
                          )
                        }
                        placeholder="Add your inspection notes or changes..."
                      />

                    </div>

                    {/* Review buttons */}

                    <div className="review-actions">

                      <button
                        className="reject-button"
                        onClick={() =>
                          reviewWorkOrder(
                            "REJECT"
                          )
                        }
                        disabled={loading}
                      >
                        Reject
                      </button>

                      <button
                        className="approve-button"
                        onClick={() =>
                          reviewWorkOrder(
                            "APPROVE"
                          )
                        }
                        disabled={loading}
                      >
                        {loading
                          ? "Saving..."
                          : "Approve Work Order"}
                      </button>

                    </div>
                  </>
                )}

                {/* Approved */}

                {workOrder.status ===
                  "APPROVED" && (
                  <div className="success-box">
                    ✓ Work order approved by
                    technician.
                  </div>
                )}

                {/* Rejected */}

                {workOrder.status ===
                  "REJECTED" && (
                  <div className="rejected-box">
                    Work order rejected by
                    technician.
                  </div>
                )}

              </section>
            )}

          </>
        )}

        {/* =========================
            STEP 06 - HISTORY
        ========================== */}

        <section className="card">

          <div className="section-heading">

            <div className="step-number">
              06
            </div>

            <div>
              <h2>
                Maintenance History
              </h2>

              <p>
                Previous issues and maintenance
                decisions for this equipment.
              </p>
            </div>

          </div>

          {historyLoading ? (
            <div className="empty-box">
              Loading maintenance history...
            </div>
          ) : history.length === 0 ? (
            <div className="empty-box">
              No previous maintenance records
              found.
            </div>
          ) : (
            <div className="history-list">

              {history.map((item) => (
                <div
                  className="history-card"
                  key={item._id}
                >

                  <div className="history-top">

                    <div>
                      <strong>
                        {item.equipmentId
                          ?.identifier ||
                          "PUMP-102"}
                      </strong>

                      <span>
                        {new Date(
                          item.createdAt
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          }
                        )}
                      </span>
                    </div>

                    <span
                      className={`history-status ${
                        item.status?.toLowerCase() ||
                        ""
                      }`}
                    >
                      {item.status}
                    </span>

                  </div>

                  <h3>
                    {item.description}
                  </h3>

                  {item.aiAnalysis
                    ?.priority && (
                    <div className="history-priority">
                      Priority:

                      <strong>
                        {
                          item.aiAnalysis
                            .priority
                        }
                      </strong>
                    </div>
                  )}

                  {item.aiAnalysis
                    ?.summary && (
                    <p className="history-summary">
                      {
                        item.aiAnalysis
                          .summary
                      }
                    </p>
                  )}

                </div>
              ))}

            </div>
          )}

        </section>

      </main>
    </div>
  );
}

export default App;