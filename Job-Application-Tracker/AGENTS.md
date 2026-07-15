# AGENTS.md

## Project Mission
This repository contains a production-grade full-stack Job Application Tracker. The system should help users manage applications, interview stages, notes, documents, and follow-up tasks with a reliable, secure, and maintainable architecture.

## Core Objectives
- Deliver a polished, accessible user experience.
- Keep backend APIs secure, validated, and observable.
- Preserve data integrity and support future scaling.
- Favor maintainability over cleverness.

## Repository Expectations
- Backend code belongs in backend/.
- Frontend code belongs in frontend/.
- Shared docs and assets belong in docs/ and assets/.
- Keep changes scoped and avoid unnecessary refactors.

## Coding Standards
- Write clear, self-explanatory code with meaningful names.
- Favor explicit, typed code over implicit behavior.
- Keep functions small and focused on one responsibility.
- Avoid dead code, duplication, and speculative abstractions.
- Follow existing project conventions unless a change is clearly justified.

## Architecture Guidance
- Backend:
  - Build APIs with clear separation between routes, services, validation, and persistence.
  - Validate all incoming input and sanitize output.
  - Handle authentication, authorization, and errors consistently.
  - Prefer structured logging and actionable error responses.
- Frontend:
  - Build reusable, accessible UI components.
  - Keep state predictable and localized where practical.
  - Handle loading, empty, and error states gracefully.
  - Avoid brittle client-side logic that duplicates server rules.

## Data and Persistence
- Treat data models, validation rules, and relationships as first-class concerns.
- Use migrations or schema changes deliberately and keep them reversible where possible.
- Avoid destructive changes without explicit approval.
- Preserve referential integrity and avoid orphaned records.

## Security and Reliability
- Never hardcode secrets, API keys, or credentials.
- Validate user input on both client and server.
- Protect against common web vulnerabilities such as injection, broken access control, and XSS.
- Prefer safe defaults, fail closed, and surface actionable errors.

## Testing and Verification
Before concluding work:
- Run the relevant tests, linters, type checks, or build commands.
- Verify that the change works end to end for the affected flow.
- Confirm that no regressions were introduced in adjacent functionality.
- If a full run is not possible, clearly document what was verified and what remains.

## Change Management
- Prefer small, reviewable changes over large sweeping edits.
- Preserve backward compatibility unless the task explicitly requires a breaking change.
- Update documentation when behavior, configuration, or workflows change.
- Do not modify generated files, lockfiles, or unrelated assets without justification.

## Working Style
- Ask clarifying questions when requirements are ambiguous.
- Summarize the intent of a change before making broad edits.
- Keep commit-level changes focused and easy to review.
- When uncertain, prefer the safer, more explicit implementation.
