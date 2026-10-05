# Equipment Maintenance Triage Assistant

An AI-powered equipment maintenance triage application that helps technicians investigate equipment issues, identify possible causes, perform deterministic sensor checks, and prepare draft work orders for human review.

## Live Demo

### Frontend

https://equipment-maintenance-assistant-xi.vercel.app/

### Backend API

https://equipment-maintenance-assistant.onrender.com

### GitHub Repository

https://github.com/triptijha1/equipment-maintenance-assistant

---

## Overview

The Equipment Maintenance Triage Assistant helps technicians turn an equipment issue report into a structured maintenance investigation.

A technician can provide:

- Equipment type and identifier
- Issue description
- Recent operating events
- Optional sensor readings

The system then:

1. Validates the issue
2. Performs deterministic sensor threshold checks
3. Retrieves relevant maintenance manual sections
4. Uses Gemini AI to analyze the issue
5. Presents possible causes as hypotheses
6. Generates targeted follow-up questions
7. Suggests inspection steps
8. Suggests maintenance priority
9. Creates a draft work order
10. Allows the technician to edit the draft
11. Allows the technician to approve or reject it
12. Preserves the issue and maintenance history

The system is designed with a **human-in-the-loop** approach. AI recommendations are not treated as confirmed findings and maintenance is never automatically approved.

---

# Features

## Issue Reporting

Technicians can report an equipment issue with:

- Equipment identifier
- Equipment type
- Issue description
- Recent operating events
- Optional sensor readings

## Deterministic Sensor Checks

The application performs rule-based checks before AI analysis.

Current thresholds:

| Sensor | Threshold | Result |
|---|---:|---|
| Temperature | > 80 °C | WARNING |
| Vibration | > 7 mm/s | HIGH |
| Pressure | < 3 bar | LOW |

Normal readings are also explicitly identified.

The rule engine additionally handles:

- Missing sensor values
- Conflicting sensor readings

## Knowledge Base Retrieval

The application contains a maintenance knowledge base with equipment-specific manual sections.

The current demo focuses on **Industrial Pumps** and includes information related to:

- Excessive vibration
- Unusual noise
- High temperature
- Inspection procedures

Relevant manual sections are retrieved before AI analysis.

The current retrieval implementation uses keyword-based matching rather than vector embeddings.

## AI-Assisted Investigation

Gemini is used to analyze the reported issue using:

- Equipment information
- Issue description
- Operating events
- Sensor readings
- Deterministic threshold results
- Retrieved maintenance manual sections

The AI generates:

- Observations
- Possible causes
- Follow-up questions
- Inspection steps
- Suggested priority
- Investigation summary
- Supporting evidence

Possible causes are explicitly presented as **hypotheses**, not confirmed root causes.

## Evidence

AI recommendations can reference:

- Sensor readings
- Operating events
- Maintenance manual sections

This helps technicians understand why a recommendation was generated.

## Draft Work Orders

After AI analysis, the application can generate a draft work order containing:

- Priority
- Summary
- Recommended inspection actions
- Issue reference
- Equipment reference

## Human Review

Technicians can edit the draft work order before making a decision.

They can:

- Change priority
- Edit the summary
- Add or remove recommended actions
- Add technician notes
- Approve the work order
- Reject the work order

AI never automatically approves a work order.

## Maintenance History

The application stores reported issues and provides maintenance history for the equipment.

The history includes information such as:

- Issue description
- Date
- Issue status
- AI priority
- AI summary

## Safety

The application intentionally separates:

### Observations

Facts provided by sensors, operating events, or issue reports.

### Possible Causes

AI-generated hypotheses that require technician verification.

### Confirmed Findings

Findings confirmed by a technician after inspection.

The system does not automatically confirm a root cause.

---

# Architecture

```text
                 ┌──────────────────────┐
                 │     React + Vite     │
                 │      Frontend        │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │    Express REST API  │
                 │       Backend        │
                 └──────────┬───────────┘
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
      ┌────────────┐ ┌─────────────┐ ┌─────────────┐
      │ Rule       │ │ Knowledge   │ │ Gemini AI   │
      │ Engine     │ │ Retrieval   │ │ Analysis    │
      └────────────┘ └─────────────┘ └─────────────┘
             │              │              │
             └──────────────┼──────────────┘
                            ▼
                 ┌──────────────────────┐
                 │    MongoDB Atlas     │
                 │                      │
                 │ Equipment            │
                 │ Issues               │
                 │ Knowledge Base       │
                 │ Work Orders          │
                 └──────────────────────┘