# Equipment Maintenance Triage Assistant

An AI-powered maintenance triage application that helps technicians investigate equipment issues, identify possible causes, perform deterministic threshold checks, and prepare draft work orders for human review.

## Features

- Report equipment issues
- Record operating events
- Add optional sensor readings
- Deterministic sensor threshold checks
- Detect missing and conflicting sensor data
- Retrieve relevant maintenance manual sections
- AI-assisted issue analysis using Gemini
- Identify possible causes as hypotheses
- Generate targeted follow-up questions
- Recommend inspection steps
- Suggest maintenance priority
- Generate draft work orders
- Allow technician editing
- Approve or reject work orders
- Maintain issue and maintenance history
- Show evidence used by the AI
- Handle AI/retrieval failures
- Keep human approval in the loop

## Architecture

React + Vite
        ↓
Express REST API
        ↓
Validation & Rule Engine
        ↓
Knowledge Retrieval + Gemini AI
        ↓
MongoDB Atlas
        ↓
Work Order Review

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

### AI
- Google Gemini API

## Project Structure

```text
equipment-maintenance-assistant/
├── client/
│   └── React frontend
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   ├── tests/
│   ├── seedKnowledge.js
│   └── server.js
│
├── .env.example
├── .gitignore
├── README.md
└── AGENT_USAGE.md