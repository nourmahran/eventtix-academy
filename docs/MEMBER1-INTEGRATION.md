# Member 1: Foundation & Authentication

Branch: `feature/member1-foundation-auth`

## Scope and status

Member 1 is implemented locally. The assignment PDF supplied on 12 November 2026 confirms Milestone 1 is frontend-only and permits client-side mock authentication. This handoff covers Member 1, not the entire team project.

| Responsibility | Implementation |
| --- | --- |
| Angular setup/structure | Angular 20 standalone components, SCSS, lazy routes, core/shared/layout directories |
| Home/navigation | Dark-purple home, responsive menu, auth links, direct profile button, role-aware navigation |
| Signup/login | Validated reactive forms, duplicate checks, password confirmation/visibility, logout |
| Roles | Student registration; explicit student/admin/accounting demo entry points and role guards |
| Profile/pictures | Edit name, email, preferences, photo and mock card; local photo preview/resize/removal |
| Guards/auth service | Protected profile, guest-only auth pages, role checks, safe return URLs, forbidden/not-found pages |
| Shared models/storage | Existing shared models preserved; optional User.paymentMethodLabel; local/session storage and a theme cookie |
| GitHub/integration support | Existing GitHub origin and feature branch verified; integration contract below |

Member 1 work is maintained on feature/member1-foundation-auth for GitHub handoff. No merge or branch change was made. No other members' feature branches were present on origin when checked.

## Try it

Run `npm install` if needed, then `npm start`. Open http://localhost:4200. Sign up with demo details, optionally choose a picture and sample card, and select preferences. Save profile changes, sign out, and sign in again. Login -> Explore demo roles provides admin/accounting demonstrations.

Cards are mocked with fixed labels ending in 4242 or 4444. No full card number, security code, or real payment is collected. Passwords are never shown on the profile.

Photos accept PNG/JPEG/WebP up to 2 MB and 4096 pixels per dimension. The image is cropped/resized to a 192-pixel JPEG before saving. The original file/metadata is not retained and nothing is uploaded.

## Role matrix

| Route | Guest | Student | Accounting | Admin |
| --- | --- | --- | --- | --- |
| Home/events entry | Yes | Yes | Yes | Yes |
| Login/signup | Yes | Redirect to profile | Redirect to profile | Redirect to profile |
| Own profile | Redirect to login | Yes | Yes | Yes |
| /accounting | Redirect to login | Denied | Yes | Yes |
| /admin | Redirect to login | Denied | Denied | Yes |

/events, /admin, and /accounting are explicit placeholders for teammates. This task did not implement their event, ticket, finance, or chatbot features.

## Storage choices

| Method / key | Value | Purpose |
| --- | --- | --- |
| localStorage / eventtix.accounts.v1 | Profiles, resized picture, sample-card label, preferences, salt and PBKDF2-SHA256 hash (600,000 iterations) | Persistent demo accounts; no plaintext passwords |
| sessionStorage / eventtix.lastUsername | Last successful registered username only | Login convenience within the tab; no password, role, or authentication token |
| Cookie / eventtix_theme | dark or light | One-year display preference; SameSite=Lax, Path=/, Secure on HTTPS |
| Memory | Authenticated user and demo-role changes | Refresh signs out; demo profiles do not overwrite registered accounts |

Clearing site data removes demo accounts. Blocked/damaged account storage produces a visible error rather than silently erasing records. Optional username-storage failure does not prevent login. Notification/sound preferences are saved for teammates to consume; delivery and audio effects remain outside this scope.

This is a classroom mock, not production security. Browser code/storage can be modified. Stored registered roles are ignored at login; registered accounts always sign in as students. Demo-role access is deliberately simulated. Server authorization belongs to a later milestone. Angular reference: https://v20.angular.dev/guide/routing/route-guards

## Integration contract

- Import AuthService from src/app/core/auth/auth.service.ts. Read user(), isAuthenticated(), and hasRole([...]); avoid a second authentication store.
- Apply authGuard to signed-in routes. It redirects guests and preserves returnUrl.
- Apply roleGuard with data: { roles: ['admin'] } or ['admin', 'accounting']. It handles guests and denies access without role metadata.
- Replace the status components at /events, /admin and /accounting with teammates' lazy routes/components. Keep guard metadata and put new routes before the wildcard.
- Scope student records to user().id. A route parameter is not proof of ownership.
- Consume user().preferences.notificationsEnabled and soundEnabled in your features. AppearanceService already applies the theme.
- Use separate versioned keys for business records; do not overwrite eventtix.accounts.v1. Never store raw passwords or real payment details.
- Existing shared interfaces remain compatible. The new User.paymentMethodLabel is optional and demo-only.
- Keep separate feature branches and review shared route/model changes before merging into develop. Do not replace teammates' folders wholesale.

## Validation

Production build passed. All 20 Jasmine/Karma tests passed, including registration/login, hashes, duplicates, role tampering, own-profile isolation, persistence, invalid/blocked storage, redirects, safe return URLs, photo validation/resizing, sample cards and theme cookies.

Headless Chrome passed signup -> photo upload -> profile -> theme change -> logout -> login, plus mobile navigation and horizontal-overflow checks. Desktop and 390-pixel mobile screenshots were visually reviewed; there were no browser runtime errors.

Commands: npm run build; npm test -- --watch=false --browsers=ChromeHeadless.

Teammates' features, the full team report, final integration and submission remain team responsibilities.
