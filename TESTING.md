# Step 4 Test Validation

The project uses Vitest 4 and Supertest. Integration tests send HTTP requests to the Express application; unit tests isolate utilities, the server entrypoint and route discovery.

## Reproduce the checks

Use Node.js >=20.19.0. GitHub Actions uses Node 20.

```sh
npm ci
npm run lint
npm test
npm test -- --coverage
```

Open `coverage/index.html` for the per-file HTML report. `coverage/coverage-summary.json` contains machine-readable totals. The CI job uploads the complete folder as `coverage-report`.

## Test matrix

| Area | Test files | Expected behaviour |
| --- | --- | --- |
| Version (DEVOPS-1) | `test/version.test.js`, `test/version.route.test.js` | HTTP 200, JSON content type, non-empty version matching package metadata |
| Info (DEVOPS-2) | `test/info.test.js`, `test/info.route.test.js`, `test/unit/appInfo.test.js` | HTTP 200, name/version/node/uptime, non-negative uptime and helper behaviour |
| Errors (DEVOPS-3) | `test/boom.test.js`, `test/boom.route.test.js`, `test/unit/errorHandler.test.js`, `test/app.test.js` | HTTP 500, JSON error payload, custom status/message and defaults for missing errors |
| Status (DEVOPS-4) | `test/unit/status.test.js` | Warming-up below 60s, healthy from 60s to below 3600s, steady from 3600s; invalid inputs rejected |
| Base HTTP routes | `test/health.test.js`, `test/app.test.js` | Health returns 200 and OK; root returns JSON; unknown routes return 404 |
| Server entrypoint | `test/unit/index.test.js` | Default port 3000, configured PORT and readiness logging; listener mocked to avoid persistent sockets |
| Route discovery | `test/unit/appLoading.test.js` | Optional directory absent, CommonJS router export, ignored non-route files and disabled module |

## Coverage gate

`vitest.config.js` includes every `src/**/*.js` file. Thresholds are configured under `test.coverage.thresholds` with `perFile: true`:

| Metric | Minimum |
| --- | ---: |
| Statements | 80% |
| Lines | 80% |
| Functions | 80% |
| Branches | 70% |

This configuration replaces the ineffective legacy `vitest` key in `package.json`. No production source is excluded from coverage. Vitest exits unsuccessfully if any file misses a threshold.

## Validation on 13 October 2026

The expanded suite passes 44 tests across 13 test files. Local coverage is 100% for statements, branches, functions and lines across all eight source files. These percentages measure the exercised suite; they do not establish that all possible defects are absent.

The original four feature PRs were merged on 1 October. The final baseline main run was successful, with 22 tests; this Step 4 change adds 22 tests and explicit coverage enforcement. Consult the pull request's Actions checks for the validation of the updated commit.

CI runs on pushes to main and pull requests targeting main. A push to a feature branch alone does not trigger this workflow until a PR is opened. The coverage artifact is downloadable from the Actions run summary. Automated merge blocking requires an additional branch-protection setting by the repository owner.
