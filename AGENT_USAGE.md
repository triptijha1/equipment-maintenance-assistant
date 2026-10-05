# Agent Usage

This project was developed with assistance from AI coding tools.

## Purpose of AI Assistance

AI assistance was used as a development support tool for planning, implementation, debugging, testing, and documentation.

The final application was manually tested by running the backend, frontend, API requests, database operations, AI analysis, and work-order approval flow.

## Areas Where AI Assistance Was Used

AI assistance was used for:

- Planning the application architecture
- Structuring the MERN project
- Creating Express routes and controllers
- Designing MongoDB/Mongoose schemas
- Implementing deterministic sensor threshold checks
- Handling missing and conflicting sensor data
- Integrating the Gemini API
- Designing the AI analysis prompt
- Implementing knowledge-base retrieval
- Creating draft work orders
- Implementing technician approval and rejection
- Debugging backend and frontend errors
- Improving frontend UI and user experience
- Writing focused backend tests
- Reviewing the implementation against the assignment requirements
- Preparing project documentation

## Representative Prompts / Tasks

Examples of tasks given to the AI coding assistant include:

1. Design a simple MERN architecture for an equipment maintenance triage assistant.

2. Create Express controllers and routes for:
   - Equipment
   - Issues
   - AI analysis
   - Work orders

3. Add deterministic sensor threshold checks for temperature, vibration, and pressure.

4. Handle missing sensor readings without assuming a default value.

5. Detect conflicting readings when multiple values are provided for the same sensor.

6. Integrate Google Gemini to analyze equipment issues.

7. Ensure AI-generated causes are presented as possible hypotheses rather than confirmed root causes.

8. Generate follow-up questions and inspection steps for technicians.

9. Add technician editing, approval, and rejection for AI-generated work orders.

10. Add maintenance history for equipment.

11. Add focused tests for the deterministic rule engine.

12. Review the project against the assignment requirements and identify missing functionality.

## Important Issues and Debugging

### 1. AI Analysis Was Not Persisting

During development, the AI analysis was generated successfully but was not being stored correctly in the issue document.

The issue model was updated to include an `aiAnalysis` field.

After the change, AI analysis persistence was tested again and verified.

### 2. MongoDB Atlas DNS Error

MongoDB Atlas initially produced a DNS-related connection error:

```text
querySrv ECONNREFUSED