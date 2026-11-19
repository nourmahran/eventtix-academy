# EventTix professional redesign

Completed 19 November 2026 on `feature/premium-ui-redesign`, based on `759a971`. Integration target: develop. The dedicated feature branch is preserved for review.

## Visual direction

The Observatory design uses midnight navy (#0b1420), raised navy surfaces (#121f2e), teal actions (#087f74), and mint accents (#76ddc7). Warm daylight mode uses #f6f7f5 backgrounds, white surfaces, and #16283a text. Segoe UI and system sans-serif fonts avoid font downloads. Shared SCSS tokens define color, spacing, typography, borders, and interaction states.

## Pages and improvements

The redesign covers home, login, signup, profile, student overview, event catalogue, event details, seat selection, checkout and confirmation, ticket history/QR cards, administration overview, event administration, accounting overview, student fees/invoices/payment detail dialogs, payroll, event finance, department budgets, forbidden and not-found pages, plus the AI assistant.

The home page now has live featured events and category links. Role-aware navigation, accounting tabs, a footer, active states, and predictable back links connect the application. Forms have consistent labels, validation, password visibility controls, focus styling, and spacing. Booking retains its existing seat identifiers, discounts, invoices, and QR data. Profile includes a real purchased-ticket preview. Finance uses aligned numeric columns, contained table scrolling, theme-aware charts, and consistent forms. The mobile assistant launcher sits beside navigation rather than covering form actions. Chat loading, errors, retries, history, and live Gemini integration remain intact.

Existing authentication behavior, backend code, package dependencies, business record formats, and teammates' feature branches were preserved. A staff-only account lookup and a separate eventtix.fee-links.v1 assignment record now connect authenticated students to fee balances. Presentation reads were added for the overview and profile; catalogue category links initialize the existing filter.

## Executed verification

- Production build: passed. Initial bundle 376.04 kB raw / 102.63 kB estimated transfer, compared with 357.21 / 99.13 kB before redesign. Increase: 18.83 / 3.50 kB. Lazy loading remains enabled; no added dependency or web-font request.
- Angular Jasmine/Karma: 70 of 70 passed in Chrome Headless.
- Node backend tests: 9 of 9 passed.
- Responsive audit: 273 checks passed across 19 routes, both themes, and widths 320, 375, 390, 768, 1024, 1440, and 1920 px, including seven chat-bound checks. A further 35 focused checks passed after the final profile/admin changes. No page overflow, visible unlabeled form controls, or uncaught JavaScript errors were detected by these checks.
- Real signup/login, profile changes, theme persistence, cookies, session username, role guards, and payroll JSON export passed browser regression checks.
- Booking, QR display, invoice generation, saved ticket reload, occupied seats across accounts, student discounts, and financial persistence passed. A two-tab seat race produced one booking and one conflict as intended.
- Fees/detail views, saved events, finance, payroll, and mobile financial layouts passed browser checks.
- Actual Gemini reply captured. Controlled API outage and retry passed without duplicating the user message.
- Sound test confirmed Web Audio oscillator creation only when enabled. This proves audio generation, not a physical speaker listening test.
- Department income 1,000 and expense 250 produced a persisted balance of 750. Accounting access and student denial passed.
- Keyboard skip link, mobile menu, Escape behavior, chat focus restoration, and reduced-motion checks passed. Fourteen core text/surface contrast pairs met 4.5:1; the lowest was approximately 4.89:1.

## Evidence and limits

Open `index.html` in the accompanying review folder for actual rendered screenshots, including before/after, both themes, mobile screens, populated tickets, finances, and a live Gemini reply. Screenshots use isolated fictional demo data. JSON audit results are included.

These checks are not a complete WCAG certification, screen-reader audit, physical-device test, or Safari/Firefox validation. Core Web Vitals and real-user performance were not measured; bundle measurements and browser checks are the available performance evidence. External event images and Gemini remain network-dependent.

Accounting staff can now link a fee record to a registered username through Student Fees > View > Save account link. The student overview shows only the assigned record. Assignment persists by stable account ID, rejects duplicate account links, and supports unlinking. Student self-assignment and unknown usernames are rejected. Four new unit tests and browser checks cover privacy, persistence, corrupted data, and seven widths. The application remains a browser-storage classroom demo with simulated payments. Notification preference is stored, but does not send notifications. These existing limitations were not silently replaced with invented behavior.

## Run locally

From the repository, run `npm start`; open http://localhost:4200. The existing ignored server environment file supplies the Gemini key. Do not commit credentials.

## Modified files

- `docs/REDESIGN-AUDIT.md`
- `docs/REDESIGN-REPORT.md`
- `src/app/app.html`
- `src/app/app.routes.ts`
- `src/app/app.scss`
- `src/app/app.ts`
- `src/app/core/auth/auth.service.ts`
- `src/app/core/auth/auth.spec.ts`
- `src/app/features/auth/login/login.html`
- `src/app/features/auth/login/login.scss`
- `src/app/features/auth/signup/signup.html`
- `src/app/features/auth/signup/signup.scss`
- `src/app/features/dashboard/dashboard.html`
- `src/app/features/dashboard/dashboard.ts`
- `src/app/features/events/pages/admin-events/admin-events.html`
- `src/app/features/events/pages/admin-events/admin-events.scss`
- `src/app/features/events/pages/checkout/checkout.html`
- `src/app/features/events/pages/checkout/checkout.scss`
- `src/app/features/events/pages/event-details/event-details.scss`
- `src/app/features/events/pages/event-list/event-list.html`
- `src/app/features/events/pages/event-list/event-list.scss`
- `src/app/features/events/pages/event-list/event-list.ts`
- `src/app/features/events/pages/seat-selection/seat-selection.html`
- `src/app/features/events/pages/seat-selection/seat-selection.scss`
- `src/app/features/events/pages/ticket-code.ts`
- `src/app/features/events/pages/ticket-history/ticket-history.html`
- `src/app/features/events/pages/ticket-history/ticket-history.scss`
- `src/app/features/finance/department-budget/department-budget.html`
- `src/app/features/finance/department-budget/department-budget.scss`
- `src/app/features/finance/department-budget/department-budget.ts`
- `src/app/features/finance/event-finance/event-finance.html`
- `src/app/features/finance/event-finance/event-finance.scss`
- `src/app/features/finance/event-finance/event-finance.ts`
- `src/app/features/finance/fee-links.spec.ts`
- `src/app/features/finance/fee-links.ts`
- `src/app/features/finance/finance-persistence.spec.ts`
- `src/app/features/finance/payroll/payroll.html`
- `src/app/features/finance/payroll/payroll.scss`
- `src/app/features/finance/student-fees/student-fees.html`
- `src/app/features/finance/student-fees/student-fees.scss`
- `src/app/features/finance/student-fees/student-fees.ts`
- `src/app/features/home/home/home.html`
- `src/app/features/home/home/home.scss`
- `src/app/features/home/home/home.ts`
- `src/app/features/profile/profile.html`
- `src/app/features/profile/profile.scss`
- `src/app/features/profile/profile.ts`
- `src/app/features/status/status.html`
- `src/app/features/status/status.ts`
- `src/app/layout/navbar/navbar.html`
- `src/app/layout/navbar/navbar.scss`
- `src/app/layout/navbar/navbar.ts`
- `src/app/layout/workspace-nav.ts`
- `src/app/shared/help/help-widget.html`
- `src/app/shared/help/help-widget.scss`
- `src/app/shared/photo-picker/photo-picker.ts`
- `src/styles.scss`
- `src/styles/_components.scss`
- `src/styles/_events.scss`
- `src/styles/_layouts.scss`
- `src/styles/_tokens.scss`
