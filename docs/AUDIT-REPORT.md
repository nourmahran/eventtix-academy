# EventTix Academy — Milestone 1 audit report

Audit date: 19 November 2026 · Branch: `audit/full-project-verification` · Requirements source: *ICS 511 Course Project – Milestone 1* (3-page PDF)

## A. Overall status

| Area | Result |
|---|---|
| Mandatory requirements | 21 PASS, 0 FAIL |
| Bonus 1 – animation, visual and audio effects | PASS (strengthened during audit) |
| Bonus 2 – AI chatbot | PASS: live Google Gemini via local key proxy (see risk R1) |
| Production build | PASS – 378 kB initial (103 kB transfer), all routes lazy-loaded |
| Unit tests (Jasmine/Karma) | PASS – 90/90 (was 81/81 before audit fixes) |
| Server tests (`node --test`) | PASS – 9/9 |
| Browser end-to-end journeys | PASS – scenarios 1–7, run manually in Chromium (built-in browser) |
| Security | No secrets in Git history, no unsafe HTML, passwords PBKDF2-hashed; frontend-only limits apply |
| `npm audit --omit=dev` | 0 vulnerabilities (16 moderate in dev-only Angular CLI tooling; not force-fixed) |

**Readiness decision: READY WITH DOCUMENTED LIMITATIONS** — code and report are complete; the remaining items in F are confirmations and frontend-only limits.

## B. Requirement compliance matrix

| ID | Requirement (PDF) | Status | Evidence (how tested) | Fix applied |
|---|---|---|---|---|
| D1 | Layout suited to user personas | PASS | Separate student, admin and accounting navigation; staff workspace nav | – |
| D2 | Interactive widgets, mouse + keyboard | PASS | Seats selected with click, Enter and Space; Escape closes chat; visible focus outline | – |
| D3 | Reactivity & state management | PASS | Signals/computed (seat totals, filters), reactive forms, validated `LocalRecord` stores | – |
| D4 | Users: admin, accounting, student + authorization | PASS | 4 roles × 11 protected routes in browser: all correct (guest→login, student→forbidden on staff routes, accounting→forbidden on admin) | – |
| F1 | Home page: info + login/signup + profile button | PASS | Home has Login, Sign Up, Join EventTix, My Profile; no console errors | Fixed page `<title>` (was "GiuFinancialManagement") |
| F2 | Signup: username, name, email, picture, password, credit card, preferences | PASS | Empty submit → 6 errors; bad email, password mismatch caught; signup saved with hash only; card is a sample label | – |
| F3 | Login | PASS | Empty, unknown user, wrong password (same generic message), case-insensitive success, `returnUrl` honoured | – |
| F4 | Profile shows signup info | PASS | Name/email/card/preferences shown; edit persisted to storage | – |
| F5 | Staff payroll: salary, allowances, deductions | PASS | Negative input rejected; decimals; net = base + allowances + event allowances − deductions verified for every row | – |
| F6 | Monthly salary report (JSON) | PASS | Export captured and parsed; keys month/staff/totals; net values verified | Totals rounded to cents; download URL no longer revoked early |
| F7 | Department budget income/expenses + charts | PASS | Department, income 5000.25, expense 1200.50 → balance 3799.75; Chart.js bars updated (screenshot) | – |
| F8 | Student fees: responsive tables, invoice, mark payment, history | PASS | Invoice validation (empty, negative, over-balance); create → Mark as Paid → history row; balance 10,000 → 12,500.5 | – |
| U1 | Fully responsive at breakpoints | PASS | 19 routes scanned for horizontal overflow at 320, 375, 768, 1440, 1920 px: none; chat panel fits at 320 px | – |
| U2 | Lazy loading | PASS | Every route uses `loadComponent`; build lists separate lazy chunks | – |
| S1 | Cookies (appropriate use) | PASS | `eventtix_theme` cookie: non-sensitive, 1-year, SameSite=Lax | – |
| S2 | Session storage (appropriate use) | PASS | Per-tab sign-in marker (account id or demo role only) + last username | **Fixed:** sign-in now survives refresh; cleared on logout/tab close |
| S3 | Local storage (appropriate use) | PASS | Accounts (hashed), events, bookings, fees, payroll, budgets persist after reload | – |
| A1 | Authentication & authorization | PASS (demo level) | Guards on every protected route; roles never read from storage | – |
| T1 | Jasmine/Karma unit tests | PASS | 90/90 headless Chrome | +9 tests for the audit fixes |
| R1 | 3-page report: team, IDs, emails, idea, description, storage explanation, screenshots | PASS | `docs/submission/*.pdf`: 3-page core report + screenshot appendix (48 pages total) | Added team emails; updated storage paragraph, test counts and delivery note |
| R2 | Source code fully running | PASS | `npm start` serves app + chat proxy; build passes | – |
| B1 | Bonus: animation, visual & audio effects | PASS | Success chime (660→880 Hz) and error tone (330→220 Hz) captured via Web Audio; message slide-in and error shake confirmed by computed styles | **Added** error tone, feedback animations, button press, card lift, seat pop |
| B2 | Bonus: AI chat tool | PASS | Live Gemini reply grounded in catalogue (150 → 135 with discount); follow-up used conversation history; offline/429/no-backend errors shown with Retry/Edit | Updated assistant's facts about sign-in |

## C. Member-by-member audit

- **Member 1 – Foundation & authentication:** solid. Salted PBKDF2 hashing, generic login errors, safe `returnUrl`, role re-derivation. Bug fixed: refreshing the page signed users out.
- **Member 2 – Events & ticketing:** solid. Search/filter, details, seats, 10% discount, Web-Locks-guarded checkout (3 rapid clicks → 1 booking), **QR decodes** to `{reference, eventId, seats}`, tickets persist across reloads, sold seats blocked, sold-out/expired events closed. Bugs fixed: admin could create past-dated events; vague capacity errors.
- **Member 3 – Finance:** solid. Fees, invoices, payments, payroll, JSON export, event finance linked to real ticket revenue (EGP 630 booking appeared; 630 + 1000 sponsor − 400 expense = 1230), department charts. Minor fix to report rounding and download timing.
- **Member 4 – Bonuses, UX, testing:** responsive layout passes, chatbot is robust. Motion and sound feedback were thin (success tone only); strengthened during the audit. Tests extended.

## D. Bugs discovered and fixed

| # | Severity | Bug | Root cause | Files | Verification |
|---|---|---|---|---|---|
| 1 | High (UX) | Any refresh or direct URL signs the user out | Session held only in memory | `core/auth/auth.service.ts` (+ notices in login/signup/profile, README, chat prompt) | Reload keeps session; logout clears key; tampered markers ignored; 4 unit tests |
| 2 | Medium | Admin can create an event dated in the past | No date check on save | `admin-events/admin-events.ts` | Browser + unit test |
| 3 | Low | Capacity 0/41/2.5 gives generic "Check the entered values" | Only the storage validator caught it | same | Browser + unit test |
| 4 | Low | Payroll JSON totals could show float noise; URL revoked synchronously | Unrounded sums; immediate `revokeObjectURL` | `finance/payroll/payroll.ts` | Unit test (0.1 + 0.2 → 0.3) |
| 5 | Low | Browser tab showed "GiuFinancialManagement" before routing | Leftover title | `src/index.html` | Browser |
| 6 | Bonus gap | No audio/visual feedback for failures | Only `success()` existed | `sound.service.ts`, checkout, profile, department budget, `_components.scss` | Tones captured in browser; unit test |
| 7 | Low | Chatbot wrote prices with "$" instead of EGP | System prompt never stated the currency | `server/chat-server.mjs` | Live Gemini reply showed EGP 150 / EGP 135; server tests 9/9 |

Pre-existing uncommitted work found at the start (event time/capacity, delete event, expired-event closing, event-details param fix, payroll rounding, two audit spec files) was reviewed, kept and covered by the tests above.

## E. Test execution evidence

- `npx tsc -p tsconfig.app.json --noEmit` / `tsconfig.spec.json` → exit 0
- `npx ng build` → exit 0, no warnings, initial 378.25 kB
- `npx ng test --watch=false --browsers=ChromeHeadlessCI` → **90 SUCCESS**, exit 0
- `node --test server/*.test.mjs` → 9 pass, 0 fail
- `npm audit --omit=dev` → 0 vulnerabilities
- Browser (Chromium, built-in pane, against `npm start` on 127.0.0.1:4200): scenarios 1–7; 0 console errors.
- QR verified by decoding the live PNG with jsQR in Node.
- **Not performed:** Safari/Firefox, physical phones, screen-reader pass, Lighthouse/real-user performance, automated reduced-motion emulation (CSS rule inspected instead), 390 px and 1024 px scans (neighbouring widths passed).

## F. Remaining risks and to-dos

1. **Team emails confirmed:** each email belongs to the member with the matching first name (surnames in the addresses may differ from the listed names).
2. **Report text updated (19 Nov):** the storage paragraph now describes the per-tab sessionStorage sign-in, and test counts read 90 Angular / 9 server tests.
2b. **Screenshot appendix refreshed (19 Nov):** the five audit-affected screens and all ten Member 4 evidence screens were retaken from the current application; storage views show live values in an inspection panel, and build/test views show the real audit-run output.
3. **Chatbot local proxy confirmed as acceptable** for the milestone (19 Nov 2026). It still requires `npm start`; `ng serve` alone shows "Start the app with npm start". Restart `npm start` to load the updated prompt (EGP prices, sign-in facts).
4. **Deadline:** the PDF deadline was 14/11/2026; later changes count as post-deadline improvements.
5. **Frontend-only security:** anyone can use the demo role buttons, and browser storage can be edited. Guards are UX/demo protections, not real security. Bookings are only consistent within one browser profile (Web Locks across tabs).
6. Running chat server must be restarted to pick up the updated assistant prompt.
7. Department Budgets starts empty (no seed data) — fine functionally, but an empty chart at first open may look unfinished during evaluation.
