# DevOps Lab – Student Project (Node.js + Jira/GitHub + CI/CD)

This repository is a **teaching template** for a 4-student DevOps mini-project.
It demonstrates a realistic workflow: **PLAN (Jira) → CODE (Git/VS Code) → BUILD/TEST (GitHub Actions) → REVIEW (PRs) → DEPLOY (optional)**.

> **What you get here**
> - Minimal **Express** API with auto-mounted routes
> - **Vitest + Supertest** for integration & unit tests
> - Coverage thresholds enforced in CI
> - **GitHub Actions** workflow for lint + tests + coverage artifact
> - Clear file layout for a team of 4

---

## Quickstart

```bash
npm ci              # Node.js >=20.19.0 (CI uses Node 20)
npm run dev          # http://localhost:3000
npm test -- --coverage
```

Open `coverage/index.html` for a visual coverage report (locally).

---

## Routes

### Base routes (Lab 4)

- `GET /` – basic JSON greeting
- `GET /health` – health check (200 OK)
- `GET /version` – returns `{ version }` from `package.json`
- `GET /info` – returns `{ name, version, node, uptime }`
- `GET /boom` – triggers a 500 error; the global error handler returns `{ error: true, message }`

### Example routes (Lab 5)

| Method | Route | Description |
|---|---|---|
| GET | `/api/doctors` | List doctors (200) |
| POST | `/api/doctors` | Add a doctor `{ name, specialty }` (201, 400 if a field is missing) |
| GET | `/api/patients` | List patients (200) |
| POST | `/api/patients` | Add a patient `{ name, age }` (201, 400 if a field is missing or invalid) |
| GET | `/api/appointments` | List appointments (200) |
| POST | `/api/appointments` | Add an appointment `{ doctor, patient, date }` (201, 400 if a field is missing) |
| GET | `/api/metrics` | System uptime, memory usage, status and hospital totals `{ doctors, patients, appointments }` (200) |

### PeopleRam CRUD (Lab 6)

Each entity exposes the five CRUD routes below. Data is kept in memory and resets when the server restarts.

| Action | Method | Route |
|---|---|---|
| List all | GET | `/api/<entity>` |
| Retrieve by ID | GET | `/api/<entity>/:id` |
| Create | POST | `/api/<entity>` |
| Update | PUT | `/api/<entity>/:id` |
| Delete | DELETE | `/api/<entity>/:id` |

| Entity | Route | Fields | Notes |
|---|---|---|---|
| Products | `/api/products` | `category_id`, `name`, `brand`, `description`, `sku`, `price`, `stock`, `low_stock_threshold`, `purchase_limit` | Filters `?category_id=&brand=&inStock=true`; computed `availability`; soft delete |
| Categories | `/api/categories` | `name` (unique), `usage` (`desktop`, `laptop`, `gaming`), `description` | 409 on duplicate name; soft delete |
| Orders | `/api/orders` | `status`, `deliveryMethod`, `items[]`, `total` | `status`: pending, processing, shipped, delivered, cancelled |
| Machine models | `/api/machine-models` | `brand`, `model`, `machine_type`, `ddr_generation`, `form_factor`, `slots`, `max_capacity_gb`, `max_speed_mhz` | Base for the RAM compatibility tool |

Status codes: `200` OK, `201` created, `204` deleted, `400` invalid body, `404` unknown id, `409` conflict.

Routes are **auto-mounted** from `src/routes/auto/*.route.js` so each student can add a file without touching `src/app.js` (fewer merge conflicts).

---

## Tests

- **Integration tests** (Supertest) target HTTP endpoints in `test/*.test.js`.
- **Unit tests** target internal logic in `test/unit/*.test.js`.

Coverage thresholds are enforced by `vitest.config.js`: lines, functions and statements ≥80%, branches ≥70%, for every source file and for the aggregate. All `src/**/*.js` files are included, including the server entrypoint.

`npm run test:coverage` generates HTML, JSON, LCOV and console reports. Coverage below a threshold exits with a non-zero status and fails CI. Preventing merges with a failed check also requires a repository branch-protection rule configured by the owner.

See [TESTING.md](TESTING.md) for the Step 4 test matrix, boundary cases and reproduction commands.

---

## Branch & Commit Convention (Jira-friendly)

- Branch: `feature/<ISSUE-KEY>-<short-desc>` → e.g., `feature/DEVOPS-2-info-endpoint`
- Commit: `feat(<ISSUE-KEY>): <what>` → e.g., `feat(DEVOPS-2): implement /info endpoint`
- PR title: `<ISSUE-KEY> | <title>` → e.g., `DEVOPS-2 | Add /info endpoint`

If you install **GitHub for Jira**, issues will link automatically when the key appears in branch/commit/PR.

---

## CI (GitHub Actions)

A workflow is included at `.github/workflows/ci.yml` that runs on pushes and PRs to `main`:

- Install Node and deps
- `npm run lint`
- `npm test -- --coverage`
- Upload `coverage/` as an artifact

![CI](https://github.com/leochen260/LAB-4-Software-Ing-nieur/actions/workflows/ci.yml/badge.svg)

---

## Project layout

```
src/
  app.js          # Express app (auto-mount + global error handler)
  index.js        # server entry (not used by tests)
  routes/auto/    # students add *.route.js files here
  utils/          # small testable helpers
test/
  *.test.js       # integration (HTTP) tests
  unit/*.test.js  # pure unit tests
```

---

## Useful scripts

- `npm run dev` – start dev server with nodemon
- `npm test` – run all tests (Vitest)
- `npm test -- --coverage` – with coverage
- `npm run lint` – ESLint check

Enjoy the lab!
