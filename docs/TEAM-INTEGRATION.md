# Team integration - 15 November 2026

Existing teammate work was integrated into develop. No missing teammate features were implemented, and all original feature branches were preserved.

## Included work

- Member 1: 8228bb0, home/navigation, authentication, profiles, pictures, roles, guards and shared models.
- Member 3: c0fd374, student fees/invoices/payments, staff payroll/monthly JSON reports, and event finance with Chart.js.
- Member 4: e8625c8, shared StorageService and tests, Karma CI setup, responsive styles, animation/reveal utilities, and team testing guide.
- Main: 66efa69, project description and planned feature overview.

## Integration changes

README conflicts were resolved by retaining the team overview and identifying the actual implementation status. The app shell retains the shared navbar and router outlet. All three finance pages are lazy-loaded, linked from the Accounting landing page, and protected by roleGuard for admin/accounting users. These pages show all staff/student financial records, so ordinary students must not access them. A personal student-fee view must be implemented by its owner before allowing student access.

The finance components' business logic and styling were preserved. Two route-integration tests were added. No event, ticketing or chatbot feature was authored during integration.

## Validation

- npm ci installed the merged lockfile.
- npm run build passed.
- npm run test:ci passed all 31 Jasmine/Karma tests.
- Headless Chrome verified guest redirects, accounting navigation, all three finance pages, and 390-pixel mobile layouts without horizontal page overflow or browser runtime errors.
- Unit/route tests verify that both admin and accounting users can open finance routes, while guests and students cannot.

These checks do not certify every financial calculation or every user action. The existing finance unit tests primarily check component creation.

## Remaining gaps for the feature owners

- No Member 2 branch was available. Event catalogue/management, ticket purchases, QR tickets and ticket invoices are still absent.
- The finance components keep mutable data in component arrays. Changes are lost when leaving/reloading a page. They have not yet been connected to the shared StorageService.
- Student Fees has View buttons without click handlers.
- Student fee records use mock IDs and are not associated with registered authentication accounts; the staff-wide view is intentionally restricted.
- Payroll allows deductions larger than gross salary and can therefore produce negative net salary; the finance owner should decide and enforce the intended validation.
- Chatbot and the complete team report/submission remain pending. The merged testing guide is a guide, not proof that every checklist item was run.

## Collaboration

Fetch origin, then merge origin/develop into your own feature branch after preserving local changes. Review route/model conflicts rather than replacing whole files. Main and all teammate feature branches are unchanged. The original Desktop checkout remains on feature/member1-foundation-auth; the integration was prepared in a separate checkout.

The shared storage helper lives at src/app/shared/services/storage.service.ts. Existing auth account storage and the appearance cookie keep their behavior and keys; they were not replaced during integration. Use namespaced keys for future business records and keep real card/password data out of storage.
