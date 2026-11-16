# Team integration - 16 November 2026

Existing teammate work was integrated into develop. No missing teammate features were implemented, and all original feature branches were preserved.

## Included work

- Member 1: 8228bb0, home/navigation, authentication, profiles, pictures, roles, guards and shared models.
- Member 2: 63b42eb, event catalogue/details, seat selection, mock checkout, ticket history, and admin event create/edit.
- Member 3: c0fd374, student fees/invoices/payments, staff payroll/monthly JSON reports, and event finance with Chart.js.
- Member 4: e8625c8, shared StorageService and tests, Karma CI setup, responsive styles, animation/reveal utilities, and team testing guide.
- Main: 66efa69, project description and planned feature overview.

## Integration changes

README conflicts were resolved by retaining the team overview and identifying the actual implementation status. The app shell retains the shared navbar and router outlet. All three finance pages are lazy-loaded, linked from the Accounting landing page, and protected by roleGuard for admin/accounting users. These pages show all staff/student financial records, so ordinary students must not access them. A personal student-fee view must be implemented by its owner before allowing student access.

The finance components' business logic and styling were preserved. Two route-integration tests were added. Member 2 event/ticket pages were connected to the existing routes, shared navbar and authentication. No chatbot or missing teammate feature was implemented.

## Validation

- npm ci installed the merged lockfile.
- npm run build passed.
- npm run test:ci passed all 41 Jasmine/Karma tests.
- Headless Chrome verified guest redirects, accounting navigation, all three finance pages, and 390-pixel mobile layouts without horizontal page overflow or browser runtime errors.
- Unit/route tests verify that both admin and accounting users can open finance routes, while guests and students cannot.

These checks do not certify every financial calculation or every user action. The existing finance unit tests primarily check component creation.

## Remaining gaps for the feature owners

- Ticket QR rendering is a hardcoded decorative pattern, now explicitly labeled non-scannable. Real QR encoding and ticket invoices remain missing.
- Seat availability is a fixed list; confirming a booking does not reserve inventory globally. The feature owner still needs inventory/duplicate-seat handling.
- Admin event edits live in the service signal and reset on reload. Event/ticket models also remain distinct from the shared finance models.
- Events and finance use separate mock data; ticket revenue does not automatically update the finance dashboard.
- The finance components keep mutable data in component arrays. Changes are lost when leaving/reloading a page. They have not yet been connected to the shared StorageService.
- Student Fees has View buttons without click handlers.
- Student fee records use mock IDs and are not associated with registered authentication accounts; the staff-wide view is intentionally restricted.
- Payroll allows deductions larger than gross salary and can therefore produce negative net salary; the finance owner should decide and enforce the intended validation.
- Chatbot and the complete team report/submission remain pending. The merged testing guide is a guide, not proof that every checklist item was run.

## Collaboration

Fetch origin, then merge origin/develop into your own feature branch after preserving local changes. Review route/model conflicts rather than replacing whole files. Main and all teammate feature branches are unchanged. The original Desktop checkout remains on feature/member1-foundation-auth; the integration was prepared in a separate checkout.

The shared storage helper lives at src/app/shared/services/storage.service.ts. Existing auth account storage and the appearance cookie keep their behavior and keys; they were not replaced during integration. Use namespaced keys for future business records and keep real card/password data out of storage.

## Member 2 authentication integration

All new routes use lazy loading. Events/details are public; seats, checkout and ticket history require authGuard; /admin/events requires the admin role. Home Explore Events and navbar My Tickets now lead to the completed pages. Administration includes Manage Events.

BookingStorage connects the existing booking flow to AuthService with per-user keys: eventtix.pending-booking.v1.<user-id> and eventtix.ticket-history.v1.<user-id>. Legacy global eventtix-pending-booking and eventtix-ticket-history keys are deliberately not imported because they have no reliable owner. They are not deleted. Demo users of the same role share the same demo identity; real registered students have unique IDs.

Checkout rejects pending bookings for a different event, recalculates totals from event pricing, limits the student discount to student accounts, stores unique ticket references, and consumes the pending booking after confirmation. Repeated confirmation on the same page is prevented. Corrupt or blocked storage is reported rather than silently overwriting records. A browser-only app is still not an authorization security boundary.

Existing generated tests were repaired to provide router dependencies and inject EventService instead of the Event interface. Three new tests cover account isolation, wrong-event/repeated confirmation, and damaged history. Browser checks passed the guest-to-login return flow, student booking/discount/confirmation/history, separate admin history, admin guard, and mobile history/event layouts without runtime errors. No full ticket inventory or concurrency guarantee is claimed.
