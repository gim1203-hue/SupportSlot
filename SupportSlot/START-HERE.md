# Open SupportSlot on your computer

## 1. Extract and open

Extract SupportSlot.zip into a folder you own, such as Documents/Projects. Open VS Code, choose File → Open Folder, and select the SupportSlot folder containing package.json. Do not open only client or server.

Open Terminal → New Terminal. The commands below use PowerShell. `npm.cmd` avoids Windows PowerShell script execution-policy errors without changing computer settings.

## 2. Install tools and packages

Install Node.js 24 LTS if needed. Close and reopen VS Code after installation.

```powershell
node --version
npm.cmd --version
npm.cmd ci
Copy-Item server/.env.example server/.env
```

`npm ci` installs exactly the dependency versions recorded in package-lock.json. Run it once after extraction. Never commit node_modules.

## 3. Configure MongoDB and the server

Choose either a local MongoDB Community server or MongoDB Atlas. For local MongoDB, start the MongoDB service and keep the example MONGODB_URI. For Atlas, create a database user, allow your development IP through Atlas network access, and copy your database connection string into MONGODB_URI. Replace its credential placeholders; URL-encode special characters in credentials. Never paste the URI into GitHub.

Generate a unique session secret:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Paste the generated value after JWT_SECRET= in server/.env. Do not use the example value. Keep this file private.

Optionally set ADMIN_EMAIL and ADMIN_PASSWORD (10–72 characters) before seeding. Use a separate email from your customer account. Seed creates a new administrator only; it never changes an existing user's role or password.

```powershell
npm.cmd run seed
npm.cmd run dev
```

Expected: the terminal prints the Express address and a Vite local URL. Open the Vite URL, normally http://127.0.0.1:5173. Keep that browser hostname consistent. Register a customer account and book an appointment. Times are explicitly UTC. Stop both servers with Ctrl+C.

## 4. Enable the real AI feature

Get an API key from a provider supporting the OpenAI-compatible chat completions protocol and JSON response format. Check that provider's own documentation for its endpoint and a currently available model. Set these in server/.env:

```dotenv
AI_CHAT_URL=https://your-provider.example/v1/chat/completions
AI_API_KEY=your-private-api-key
AI_MODEL=your-provider-model-id
```

The URL above is a placeholder, not a working endpoint. Restart the development command after changing .env. Submit a fictional IT problem in the smart finder. A successful live response says **AI recommendation**. If the provider is missing, times out, rejects the requested format, or returns invalid output, you see **Keyword fallback · not AI**. Do not present fallback behavior as a completed AI integration. Provider usage may incur charges; configure a spending limit in your provider account.

## 5. Verify your project

```powershell
npm.cmd test
npm.cmd run build
```

The tests download a temporary MongoDB binary on first use. This does not touch your application database. An internet connection may be required. Use docs/TESTING.md for the manual walkthrough and AI evaluation.

## Common problems

| Problem | Fix |
| --- | --- |
| npm is not recognized | Install Node.js and restart VS Code |
| npm.ps1 cannot be loaded | Use npm.cmd commands as shown |
| Missing .env file | Copy server/.env.example to server/.env |
| Invalid JWT_SECRET | Generate a new random secret and paste it into .env |
| MongoDB connection refused | Start local MongoDB or use a working Atlas URI |
| Atlas cannot connect | Check database user credentials, IP allowlist, and URI |
| Empty service catalog | Stop and run npm.cmd run seed, then restart |
| Service list cannot load | Check the API terminal and database connection |
| No booking slots | Select a weekday within the next 29 days; all times are UTC |
| AI always falls back | Verify all three AI settings, model JSON support, quota, endpoint, and restart |
| Port already used | Close the old app process; if changing API port, also update client/vite.config.js |

Continue with docs/LEARNING-GUIDE.md and docs/GITHUB.md. Do not create a GitHub repository inside node_modules or an extracted nested folder by mistake.
