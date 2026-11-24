# EventTix Milestone 2 cloud transfer

## Preserved revision

The transfer branch is `codex/milestone-2-cloud-transfer-20261124` in
`https://github.com/nourmahran/eventtix-academy.git`. It preserves the local
Milestone 2 Laravel backend alongside the existing Angular frontend and Node
chat service. Existing remote branches are not rewritten or merged.

## Cloud setup

Select this repository and transfer branch in the cloud environment. Use Node
22.12 or later in the Node 22 line (or a compatible Node 24 release), PHP 8.3+
with the extensions required by `backend/composer.lock`, Composer 2, and MySQL
8.4. PHPUnit also needs PDO SQLite. Headless Angular browser tests need Chrome
or Chromium and an appropriate `CHROME_BIN`.

Run `bash scripts/cloud-setup.sh`, then `bash scripts/cloud-verify.sh`.
The scripts deliberately do not run migrations, seed databases, rotate keys,
or replace existing environment files. The backend Vite build is separate;
the frontend application uses the root Angular lockfile.

## Secret configuration

The repository is public. Never commit `.env`, database dumps, session data,
private keys, or local transfer backups. Both existing `.env` files remain
unchanged locally. Their backup copies use Windows DPAPI CurrentUser encryption
and can only be decrypted with the original Windows user profile on this machine.
These are recovery copies, not portable cloud secret files.

Use the cloud environment's secure secret settings for `GEMINI_API_KEY`,
`APP_KEY`, `DB_PASSWORD`, and any other populated credential fields. Preserve the
existing Laravel `APP_KEY` when restoring data that depends on it. Do not paste
secrets into task prompts, logs, setup scripts, or this document.

Use `.env.example` and `backend/.env.example` as variable-name references.
Cloud MySQL needs its own host and credentials; `127.0.0.1` in the original
configuration refers to this Windows computer and is not a remote database.
Set `APP_URL`, `FRONTEND_URL`, `SANCTUM_STATEFUL_DOMAINS`, session cookie settings,
and `CHAT_ALLOWED_ORIGINS` to the actual cloud URLs. Preserve the original files
and supply cloud-specific overrides securely. Verify the available runtime
secret mechanism before starting services.

## Database recovery and validation

The private local backup directory contains `mysql.sql`, a Git bundle, a source
archive, encrypted environment files, and verification reports. It is excluded
from Git and restricted to the current Windows user. The SQL dump includes
schema, data, triggers, events, and routines and was exported with a consistent
InnoDB transaction. It was restored into a separate temporary MySQL 8.4 instance;
the original database was not changed.

Restore only into a newly created, empty cloud database. Never import the dump
over an existing database: its table statements can replace tables. Verify the
dump checksum against the private manifest, restore it with a protected client
configuration, compare table counts, and run `php artisan migrate:status` before
considering any further migration. Do not run `migrate:fresh` or `db:wipe`.

## Completion criteria

GitHub synchronization alone does not prove a cloud transfer. Completion requires
the cloud checkout to match the pushed commit, successful setup and verification
scripts, secure runtime configuration, and an actual MySQL connection. Validate
registration, login, authenticated user retrieval, logout, frontend connectivity,
and the chat service in the cloud before declaring the transfer complete.

## Recovery

The original branches remain available. Clone the private `repository.bundle`
into a new directory to recover prior Git history. Extract the source archive
into a separate directory to recover uncommitted source. Restore encrypted
environment files only to a new destination using the original Windows account.
Keep the local project and database until cloud verification is complete.
