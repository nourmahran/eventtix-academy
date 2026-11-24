#!/usr/bin/env bash
# Install locked dependencies without changing application data or existing secrets.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
command -v node >/dev/null
command -v npm >/dev/null
command -v php >/dev/null
command -v composer >/dev/null
node -e 'const [major, minor] = process.versions.node.split(".").map(Number); if (!(major === 20 && minor >= 19 || major === 22 && minor >= 12 || major >= 24)) process.exit(1)'
php -r 'if (PHP_VERSION_ID < 80300) { fwrite(STDERR, "PHP 8.3+ required\n"); exit(1); }'
npm ci
composer install --working-dir=backend --no-interaction --prefer-dist
composer check-platform-reqs --working-dir=backend
printf '%s\n' 'Dependencies ready. Existing .env files and databases were not modified.'
