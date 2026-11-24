#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
npm run test:server
npm run build
# PHPUnit uses the isolated in-memory SQLite configuration in phpunit.xml.
(cd backend && php vendor/bin/phpunit)
if git ls-files --error-unmatch .env >/dev/null 2>&1 || git ls-files --error-unmatch backend/.env >/dev/null 2>&1; then
  printf '%s\n' 'ERROR: an environment file is tracked.' >&2
  exit 1
fi
printf '%s\n' 'Code checks passed. MySQL connectivity, browser flows, and external APIs require separate runtime verification.'
