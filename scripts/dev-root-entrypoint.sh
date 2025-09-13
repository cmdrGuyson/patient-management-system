#!/bin/sh
set -e

echo "Running workspace install if needed..."
yarn install --frozen-lockfile || true

export NODE_ENV=development

echo "Ensuring OpenSSL is installed..."
if ! command -v openssl >/dev/null 2>&1; then
  echo "Installing OpenSSL (apt-get)..."
  apt-get update -y && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
fi

echo "Generating Prisma clients..."
yarn --cwd apps/api prisma generate

echo "Applying Prisma migrations..."
if [ -d "apps/api/prisma/migrations" ] && [ "$(ls -A apps/api/prisma/migrations 2>/dev/null)" ]; then
  yarn --cwd apps/api prisma migrate deploy
else
  yarn --cwd apps/api prisma migrate dev --name init
fi

if [ -n "$SEED" ] && [ "$SEED" = "true" ]; then
  echo "Seeding database..."
  yarn --cwd apps/api prisma db seed
fi

echo "Starting Turbo dev for all apps..."
yarn dev


