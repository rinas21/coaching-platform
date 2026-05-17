#!/bin/sh
set -e
echo "[docker-entrypoint] Automatic Strapi seeding is disabled."
echo "[docker-entrypoint] To seed manually, run: docker compose exec backend npm run seed"
exec "$@"
