#!/bin/sh
set -e

echo "Waiting for PostgreSQL to be ready..."
until nc -z postgres 5432; do
  echo "Waiting for database connection..."
  sleep 2
done

echo "Running database migrations..."
node dist/database/run-migrations.js

echo "Starting application..."
exec node dist/main
