# NORI Playwright

End-to-end Playwright test suite for the NORI web app. This project validates core user flows and quality signals (compatibility, performance, reliability, security, and usability) across major browsers.

## What this repo is for
- Automating UI checks for NORI features like auth, study flows, and critical screens.
- Running cross-browser coverage (Chromium, Firefox, WebKit).
- Measuring UX and performance behavior using targeted scenarios.

## Project layout
- `tests/` grouped by intent:
  - `compatibility/`, `usability/`, `reliability/`, `security/` for focused coverage.
  - `performance/` for flow and interaction timing checks.
  - `fixtures/` and `helpers/` for shared auth flows and API helpers.
- `playwright.config.ts` defines browser projects and shared settings.
- `playwright-report/` and `test-results/` contain generated artifacts.

## Requirements
- Node.js 18+ recommended
- Playwright browsers installed locally

## Run tests
- All tests:
  ```bash
  npx playwright test
  ```
- Single file:
  ```bash
  npx playwright test tests/smoke.spec.ts
  ```
- Single browser project:
  ```bash
  npx playwright test --project=chromium
  ```

## Reports
After a run, view the HTML report:
```bash
npx playwright show-report
```

## Notes
- Default viewport is `1366x900`, headless is disabled, and HTTPS errors are ignored.
