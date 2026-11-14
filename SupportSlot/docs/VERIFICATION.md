# Starter verification

Checked November 14, 2026 with Node.js 24.20.0 on Windows.

- Dependency installation completed; npm reported zero known vulnerabilities at installation time.
- Production Vite build passed.
- All six integration tests passed against an isolated MongoDB process. The tests include authentication/role restrictions, simultaneous booking conflicts, customer ownership, cancellation slot release, invalid slot validation, administrator completion, and validated/mocked AI responses.
- Automated Chromium walkthrough passed: catalog load, labeled keyword fallback, registration, booking, cancellation, logout, and mobile viewport width. No page JavaScript errors were observed.
- Desktop and mobile screenshots were inspected for layout. The screenshots in docs/screenshots show the seeded demonstration catalog, not a hosted production service.

Not verified: your MongoDB deployment, your real AI provider/model accuracy, your hosting platform, emails/payments (not implemented), full screen-reader conformance, or a complete security/load audit. CI is included but has not run in your GitHub account. See TESTING.md for the manual acceptance log and real-model evaluation cases.
