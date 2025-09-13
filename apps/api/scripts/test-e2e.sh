#!/usr/bin/env bash
set -euo pipefail

# Configuration
COMPOSE_FILE="../../docker-compose.test.yml"
DB_SERVICE="db_test"

# Environment variables
export DATABASE_URL="${DATABASE_URL:-postgresql://test:test@localhost:5433/pms_test?schema=public}"
export JWT_SECRET="${JWT_SECRET:-testing-secret}"

# Seed credentials
export ADMIN_EMAIL="${ADMIN_EMAIL:-admin@test.com}"
export ADMIN_PASSWORD="${ADMIN_PASSWORD:-Password123!}"
export ADMIN_NAME="${ADMIN_NAME:-Admin Test}"
export USER_EMAIL="${USER_EMAIL:-user@test.com}"
export USER_PASSWORD="${USER_PASSWORD:-Password123!}"
export USER_NAME="${USER_NAME:-User Test}"

cleanup() {
  docker compose -f "$COMPOSE_FILE" down -v >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "Starting test database..."
docker compose -f "$COMPOSE_FILE" up -d "$DB_SERVICE"

echo "Waiting for Postgres to be ready..."
until docker compose -f "$COMPOSE_FILE" exec -T "$DB_SERVICE" pg_isready -U test -d pms_test >/dev/null 2>&1; do
  sleep 1
done

echo "Running Prisma migrations..."
yarn prisma migrate deploy

echo "Seeding database..."
yarn prisma:seed

echo "Running e2e tests..."
jest --config ./test/jest-e2e.json


