#!/bin/sh
set -e

DB_HOST="${DB_HOSTNAME:-postgres}"
DB_PORT_VALUE="${DB_PORT:-5432}"

echo "Waiting for PostgreSQL to be ready..."
until nc -z "$DB_HOST" "$DB_PORT_VALUE"; do
  echo "Waiting for database connection..."
  sleep 2
done

echo "Running database migrations..."
node dist/database/run-migrations.js

echo "Starting application..."
exec node dist/main
