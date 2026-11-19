# Gemini AI chatbot

The former keyword FAQ has been removed. The floating AI assistant sends messages and up to four previous exchanges to Google Gemini through a local Node backend. It can generate replies, answer follow-ups and compare the public event catalogue. There is no FAQ fallback when Gemini fails.

## Setup in VS Code

1. Open the repository root. Node 22.12 or newer is required (Node 22.23.3 was used locally).
2. Open `.env` beside `package.json`. This private file was created with empty values. If it is missing, copy `.env.example` to `.env`.
3. Create a key in [Google AI Studio](https://aistudio.google.com/apikey), then set `GEMINI_API_KEY=your_key_here` in `.env`. Never paste it into Angular source, screenshots, chat or GitHub. `.env` is already ignored by Git.
4. Leave `GEMINI_MODEL=gemini-3.5-flash-lite`, or set a Gemini model that your Google project can access. Model access, quota and billing are managed by your Google project; this project does not activate billing.
5. Stop the old Angular server with Ctrl+C. Run `npm start`. This starts the API on `127.0.0.1:3001` and Angular on `127.0.0.1:4200`.
6. Open `http://127.0.0.1:4200`, select **AI assistant**, and send a message. Follow up in the same chat to use conversation history.

Restart `npm start` after editing `.env`. The server reads the file only at startup. `npm run start:api` and `npm run start:web` are available for separate terminals. If you change CHAT_PORT, also update the target in `proxy.conf.json`. If the Angular port changes, include its exact origin in CHAT_ALLOWED_ORIGINS.

## Behavior and privacy

- Messages and a whitelist of public event fields go to Google Gemini. No account object, password, card label, profile photo, ticket ledger, student record or payroll data is attached automatically. Users are told not to type secrets into chat.
- Conversation remains in browser memory. New chat clears it; account changes clear it; reload clears it. The backend does not store or log messages or keys. Google processes submitted messages according to its applicable API terms.
- Answers are plain text, rendered with Angular interpolation. Model output cannot inject HTML or run scripts.
- The assistant cannot change bookings, charge money, inspect private records or know current seat inventory. The system context describes these limits and actual project routes.
- Requests have bounded message/context sizes, a 45-second provider timeout, two concurrent requests and a 20-request-per-minute local limit. Stop aborts the request; Retry reuses the pending message without duplicating it.
- Missing credentials, invalid model/key access, quota errors, timeouts and blocked/empty responses produce visible errors, not invented answers. The status endpoint reports whether a key is configured, not whether Google has accepted it.

## Deployment boundary

This backend binds only to loopback and accepts explicitly configured frontend origins. It is intended for the local classroom project. Angular's proxy configuration applies to `ng serve`, not a static production host. Hosting this publicly requires a server-side deployment, HTTPS, real user authentication, per-user usage controls and a same-origin reverse proxy for `/api`; never expose the current anonymous local proxy directly to the Internet. A frontend-only static upload cannot run Gemini by itself.

## Checks

Run `npm run test:server`, `npm run test:ci`, and `npm run build`. Backend tests use an injected fake provider and test request validation, history, key isolation, provider errors, quota, timeout and text filtering without sending data to Google. Angular tests check follow-up history, retry/cancel, account-change cleanup and safe text rendering. A live Gemini reply still requires a valid key and model access.

## Official references

- [Google Gemini generateContent and conversation history](https://ai.google.dev/gemini-api/docs/generate-content/get-started)
- [Gemini API key setup](https://ai.google.dev/gemini-api/docs/api-key)
- [Gemini 3.5 Flash Lite model](https://aistudio.google.com/docs/models/gemini-3.5-flash-lite)

The Node backend uses the documented REST generateContent endpoint with the API key in the `x-goog-api-key` header. No extra SDK dependency is needed.
