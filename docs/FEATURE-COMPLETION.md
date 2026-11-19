# Feature completion — 18 November 2026

> Chat update: the local FAQ described in this historical completion record has been replaced with a Gemini AI chatbot at the owner’s request. See [Gemini setup](GEMINI-CHAT.md). A valid server-side API key is required.

The owner authorized implementation of the previously deferred teammate features. Changes were made in the Desktop checkout, preserving the existing visual redesign and original feature branches. These local changes have not yet been committed or pushed.

## Delivered

- Real QR encoding using `qrcode`. Each QR contains the saved booking reference, event ID and seats. It does not contain account contact details or act as an admission credential.
- Downloadable, self-contained HTML ticket invoices from checkout and My Tickets. They include the saved event, customer name, timestamp, seats, subtotal, discount, total and QR. Open the file and use the browser’s Print / Save as PDF option. Values are escaped before insertion into HTML.
- Atomic booking ledger: tickets and seat ownership are committed in one localStorage write under a Web Lock. Concurrent tabs cannot sell the same seat twice. Failed writes do not reserve seats or consume pending bookings. The existing six seed reservations remain in place.
- Event add/edit persistence. Stale event pricing is rejected at confirmation. Currency totals round to two decimal places.
- Student fee invoices, payments and balances persist together. View opens a keyboard-accessible native dialog with student details, invoices and itemized payments. Opening sample balances are distinguished from newly recorded payments. Invoices cannot exceed the balance not already covered by unpaid invoices; duplicate payment is prevented.
- Staff and monthly event allowances persist. Deductions cannot exceed base salary plus regular allowances.
- Event budgets persist. Booking revenue is derived from saved tickets for matching event IDs; original sample budgets remain separate instead of being guessed or overwritten.
- Local FAQ assistant with topic buttons, typed questions, internal navigation, Escape/Close handling and clear conversation. No API key, AI provider or external chat service is used. Messages stay in memory and are never stored or sent.

## Storage and compatibility

| Key | Contents |
| --- | --- |
| `eventtix.bookings.v2` | Booking ledger with owner IDs and saved tickets; also the source of seat reservations and sales revenue |
| `eventtix.pending-booking.v1.<user-id>` | Existing per-account pending booking |
| `eventtix.ticket-history.v1.<user-id>` | Existing legacy account history, read without deletion or rewrite |
| `eventtix.events.v1` | Event catalogue edits |
| `eventtix.fees.v1` | Student balances, invoices and payments |
| `eventtix.payroll.v1` | Staff and monthly allowances |
| `eventtix.event-finance.v1` | Financial budgets and expenses |

Legacy account tickets remain visible and reserve their seats. Older unowned global ticket keys are untouched and are not imported. Corrupt records cause visible errors and are never silently replaced. LocalRecord validates documents, surfaces quota/access failures and rejects saves based on a stale stored version. Financial forms restore their last saved state if persistence fails.

Accounts, roles, login behavior and theme-cookie keys are unchanged. Refresh still signs out. Finance routes remain restricted to admin/accounting. Mock student fee IDs are not linked to registered students; the fee detail view is for staff only.

## Validation

- Production build and Jasmine/Karma tests, including real QR decoding, invoice escaping, stale-write rejection, corrupt-storage preservation, quota failure, account isolation, duplicate reservations, reload persistence and fee/payment calculations.
- Browser acceptance: full student booking and invoice download; reload/sign-in/history; booked-seat visibility for another role; ticket revenue; persisted expenses, staff, event edits and fees; View dialog; mobile finance and FAQ; Escape closes the help dialog.
- Production dependency audit: no reported production vulnerabilities. The full development-tool dependency audit reports 33 advisories; no unrelated major dependency upgrades were performed.

## Demo limits and submission tasks

Browser storage is not a security boundary or a shared backend. Different devices, browser profiles, ports and hostnames have separate data. Use localhost or HTTPS in a browser supporting Web Locks. Clearing site data removes local records. QR tickets and invoices represent mock transactions, not payments, tax documents or verified admission.

The selected FAQ assistant does not satisfy a requirement specifically asking for generative AI integration. Real AI and shared multi-device inventory need a backend. The team still needs to complete its report, identity fields and submission process. Commit/push these changes when ready.
