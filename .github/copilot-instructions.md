<!-- Short, focused instructions to help AI coding agents be productive in this repo -->
# Copilot instructions for this repository

This repository contains a Node/Express backend (Sequelize + MySQL) and a Vite + React front-end. The notes below explain the architecture, key workflows, conventions, and integration points an AI code assistant should follow when making changes.

- **High level**: backend is in `backend/` (Express, Sequelize models, migrations). front-end is in `front-end/` (Vite + React, services calling backend API).

- **Start / debug**:
  - Backend: install in `backend/` and run the listed scripts. Example: `pnpm install` then `pnpm run dev` (nodemon) or `pnpm start` to run `server.js`.
  - Front-end: run in `front-end/` with `pnpm install` then `pnpm run dev` (Vite).

- **Environment & secrets**:
  - Backend expects classic env vars: `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `CLOUDINARY_*`, `STRIPE_*`, `JWT_SECRET`, `PORT`. See `backend/src/config/database.js` and `backend/src/config/cloudinary.js` for usage.

- **Database & migrations**:
  - Sequelize is used; migration files live in `backend/migrations/`. Do not rely on `db.sync({ force: true })` in production — migrations are the source of truth.
  - To run migrations use the installed `sequelize-cli` (devDependency); examples: `npx sequelize-cli db:migrate --config backend/config/config.json` from the `backend/` folder.

- **Key backend files & patterns** (examples to reference for changes):
  - Server bootstrap and route registration: `backend/server.js`.
  - DB connection: `backend/src/config/database.js`.
  - Cloudinary config: `backend/src/config/cloudinary.js`.
  - Models and associations: `backend/src/models/` (see `index.js` for association patterns).
  - Routes: `backend/src/routes/*Routes.js` — follow existing request/response shapes and use `express-validator` conventions used by `validators/`.
  - Middleware: `backend/src/middleware/errorHandler.js` and `authMiddleware.js` — return consistent JSON errors and status codes.

- **Front-end integration points**:
  - API wrapper(s): `front-end/src/services/*.jsx` (e.g., `api.jsx`, `auth.jsx`, `categoryApi.jsx`) — prefer these when changing network behavior.
  - Components use `react-router-dom` v7 and client-side hooks like `useAuth` / `useCart` located in `front-end/src/hooks/`.

- **Conventions & choices to preserve**:
  - Use the existing folder structure: controllers are implemented as route modules, validations live in `validators/`, and shared logic is in `src/lib/utils.jsx` on the front-end.
  - Error responses: follow the JSON structure produced by `errorHandler.js` to avoid breaking front-end expectations.
  - File encoding and module style: repository uses ES modules (`type: module`) across both projects.

- **What to avoid / be careful about**:
  - Do not change database credentials, Cloudinary, or Stripe env var keys; add new vars only if necessary and document them in `backend/.env.example` (create one if missing).
  - Avoid running `db.sync({ force: true })` in production code paths; prefer migrations.

- **Testing / developer workflow notes**:
  - There are small test scripts in `backend/` (e.g., `test-*.js`); run them with `node` from the `backend/` folder.
  - Linting / formatting are minimal in the repo; respect project style and keep edits focused.

- **When creating PRs or changes**:
  - Update or add migration files under `backend/migrations/` for schema changes.
  - Update API client calls in `front-end/src/services/` when backend response shapes change.
  - Add or update short notes in `front-end/README.md` or `backend/README.md` when you introduce new dev commands or env vars.

If any of this is unclear or you want extra examples (common request/response shapes, typical model fields, example env templates), tell me which area to expand and I will update this file.
