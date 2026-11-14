# Deploy one complete application

The simplest architecture for this starter is one Node web service that serves Express and the built React files on the same HTTPS origin, plus MongoDB Atlas. This avoids cross-site session-cookie configuration. Use a Node host supporting build commands, start commands, environment variables, and HTTPS. Hosting plans, prices, and limits vary; review your provider's current documentation.

## Prepare

1. Push the source and package-lock.json to GitHub.
2. Create an Atlas database and a database user with access only to this application database. Configure network access for the hosting service's outbound IPs according to the hosting and Atlas documentation.
3. Run the automated tests and frontend build locally.

## Web service settings

- Repository root: project root (not client or server).
- Node: 24.
- Build command: `npm ci && npm run build`.
- Start command: `npm start`.
- Health check: `/api/health`.
- Environment: `NODE_ENV=production`, `MONGODB_URI`, a private random `JWT_SECRET`, and optionally all three AI settings. Let the host provide PORT.
- HTTPS required: production session cookies are Secure.

Seed the deployed database once through the host's private shell/job facility:

```sh
node server/src/seed.js
```

The hosting environment must supply the variables. Do not run the seed via npm run seed on a host without a server/.env file, because that development command intentionally loads the local file. If you set ADMIN_EMAIL and ADMIN_PASSWORD to create an administrator, remove those two setup variables after the seed succeeds. Existing user accounts are never promoted by re-seeding.

## Verify

Open the HTTPS deployment URL. Browse services, register a customer, reserve a future weekday slot, reload, cancel, and sign out. Verify the seeded admin in a separate session and test a real AI request. Inspect logs for startup or index errors. Health currently checks the HTTP process, not database readiness; add a readiness endpoint before operational use that needs it.

Add the real live URL and screenshots to the README after verification. No public deployment or paid resources are created by these files. GitHub Pages alone cannot run this Express/MongoDB application.

## Before a larger public launch

Configure provider spend limits and distributed request quotas, review privacy and data retention for AI inputs, add password recovery and session revocation, and observe errors and usage. In-process rate limits reset on restart and do not coordinate across replicas. Configure Express trust proxy only for the actual host's trusted proxy topology; do not blindly trust arbitrary forwarding headers. Ensure the database reservation index finishes building before accepting live bookings.
