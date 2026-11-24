# Member 1 Milestone 2

## Local setup

Use the existing Angular, Node chat, Laravel, and MySQL applications. Run the
commands below against an empty development database or a verified EventTix
development database. Keep credentials in a local ignored `backend/.env` or in
the runtime's protected settings. Preserve the existing app key when reusing
data that depends on it.

1. Run `npm ci` from the repository root and `composer install` from `backend`.
2. For a fresh standalone setup, copy `backend/.env.example` to
   `backend/.env`, set the MySQL connection for your development database,
   and run `php artisan key:generate` from `backend`.
3. From `backend`, run `php artisan migrate:status`, then
   `php artisan migrate` to apply outstanding migrations.
4. From `backend`, run `php artisan serve --host=127.0.0.1 --port=8183`.
   From the repository root, run `npm start`.
5. Open http://127.0.0.1:4200. Register fictional accounts for the three roles.
   From the trusted backend console, grant staff roles as needed.

```sh
php artisan eventtix:set-role demo-admin@example.test admin
php artisan eventtix:set-role demo-accounting@example.test accounting
```

For an HTTPS deployment, set secure cookies and list the actual frontend host
in `SANCTUM_STATEFUL_DOMAINS`. Keep the frontend, Laravel API, and Sanctum CSRF
endpoint on the same browser origin through the reverse proxy. Route only the
existing chat endpoints to Node. The dev proxy is used by Angular's dev server.
Leave `CORS_ALLOWED_ORIGINS` empty for the same-origin setup. For a separate
trusted frontend, list its exact origin there and configure the matching
Sanctum domain and cookie settings.

## Account API

| Method and route | Access and result |
| --- | --- |
| GET `/sanctum/csrf-cookie` | Initialize the CSRF cookie before mutations |
| POST `/api/register` | Create a student and start a session. Returns `201` with `message` and `user` |
| POST `/api/login` | Accept username or email and password. Returns `message` and `user` |
| POST `/api/logout` | Invalidate the session and rotate the CSRF token |
| GET `/api/user` | Return the authenticated account directly |
| PATCH `/api/user` | Update the caller's profile and return the account directly |
| DELETE `/api/user` | Require the caller's current password, disable the account, and end its sessions. Returns `204` |
| GET `/api/students/by-username/{username}` | Admin and accounting only. Returns a student's `id` for the existing fee-link UI |
| POST `/api/user/event-updates-subscription` | Record the authenticated account's opt-in, queue a confirmation, and return the updated account |

Angular uses Laravel's `XSRF-TOKEN` cookie and `X-XSRF-TOKEN` header for
same-origin mutations. Sanctum authenticates against the server session.
Account IDs are serialized as strings for the existing Angular models. APIs
return JSON, with `401` for missing identity, `403` for insufficient privileges,
`404` for missing records, `419` for an invalid request/session token, and
`422` with field errors for validation failures.

Member 2 can apply `can:manage-events` with `auth:sanctum` to admin event
writes. Member 3 can use `can:manage-finance` for staff-wide finance operations.
Both modules still need ownership policies on private student records.
Public account creation cannot choose a staff role. Browser demo identities
from Milestone 1 are not imported or granted server privileges.

The server retains a soft-deleted account row to preserve future booking and
finance references. Deleted accounts cannot log in. The account's email and
username stay reserved. Profile photo data is bounded and checked as a raster
image. The card selector stores only one of two fictional labels. The browser
may keep a remembered username and appearance preferences, while Laravel
controls identity, account preferences, and access.

## Confirmation email bonus

Event updates are an explicit opt-in on the profile page. This is the team's
proposed interpretation of the incomplete subscription wording. Changing the
account email clears its opt-in. The queued confirmation is addressed to the
subscribed account and is skipped if the account or subscription is no longer
active for that email.

Set `MAIL_MAILER=smtp`, `MAIL_HOST`, `MAIL_PORT`, and sender details to a
development mail catcher or an approved provider. Supply credentials using
protected runtime settings. With `QUEUE_CONNECTION=database`, run
`php artisan queue:work database` from `backend`. Start the worker with the same
mail environment as the backend. Check the inbox for the
“EventTix event updates subscription confirmed” subject.

Run the Laravel account feature tests and Angular suite before integration.
The existing booking and finance records still use the Milestone 1 storage
path pending those members' server integration.
