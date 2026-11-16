# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: React components consume API via shared client; use Bootstrap for layout; route structure mirrors API endpoints.
- Logic tier decision: Express routes delegate to service layer; services handle validation, business logic, and error responses; routes stay thin.
- Data tier decision: Mongoose schemas (User, Team, Activity) with required fields and indexes; seed data populates test database on startup.
- Activity tracking approach: POST validates userId and teamId existence before creating; compute points from type mapping (e.g., running=10pts/min); set occurredAt to current timestamp.
- Team management approach: Teams require a name; POST validates name presence and returns 400 if missing; mascot is optional.
- Leaderboard approach: Aggregate Activity records by teamId, sum points, join with Team names, sort descending, add 1-based rank.
- Workout suggestions approach: Look up user by email; query recent activities; recommend based on most-common activity type or user's stored goal; return 404 for unknown emails.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend`
  - Tests Mongoose models and seed data; validates schemas, indexes, and database connectivity; failures indicate missing models or seed issues.
- API command: `npm run test:api --prefix octofit-tracker/backend`
  - Tests all four endpoints (teams, activities, leaderboard, workout suggestions); validates contracts, error codes, and response shapes; failures show which endpoints or validations are incomplete.
- Frontend command: `npm test --prefix octofit-tracker/frontend`
  - Tests React components and API client integration; failures indicate UI logic or client-side validation issues.
- Backend build command: `npm run build --prefix octofit-tracker/backend`
  - Compiles TypeScript to JavaScript; failures indicate syntax or type errors.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend`
  - Builds optimized Vite bundle; failures indicate missing dependencies or build configuration issues.
