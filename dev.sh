#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_CONTAINER="team-task-manager-postgres"
DB_IMAGE="postgres:16"
DB_NAME="team_task_manager"
DB_USER="postgres"
DB_PASSWORD="postgres"
BACKEND_PID=""

cleanup() {
  if [[ -n "${BACKEND_PID}" ]] && kill -0 "${BACKEND_PID}" 2>/dev/null; then
    kill "${BACKEND_PID}" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required but was not found in PATH" >&2
  exit 1
fi

echo "Checking Docker..."
if ! docker info >/dev/null 2>&1; then
  echo "docker is installed but the Docker daemon is not reachable" >&2
  exit 1
fi

if docker ps -a --format '{{.Names}}' | grep -qx "${DB_CONTAINER}"; then
  echo "Starting existing PostgreSQL container..."
  docker start "${DB_CONTAINER}" >/dev/null
else
  echo "Creating PostgreSQL container..."
  docker run -d \
    --name "${DB_CONTAINER}" \
    -e POSTGRES_DB="${DB_NAME}" \
    -e POSTGRES_USER="${DB_USER}" \
    -e POSTGRES_PASSWORD="${DB_PASSWORD}" \
    -p 5432:5432 \
    "${DB_IMAGE}" >/dev/null
fi

echo "Waiting for PostgreSQL..."
until docker exec "${DB_CONTAINER}" pg_isready -U "${DB_USER}" -d "${DB_NAME}" >/dev/null 2>&1; do
  sleep 1
done

echo "Starting backend..."
(
  cd "${ROOT_DIR}/apps/server"
  SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/${DB_NAME}" \
  SPRING_DATASOURCE_USERNAME="${DB_USER}" \
  SPRING_DATASOURCE_PASSWORD="${DB_PASSWORD}" \
  mvn spring-boot:run
) &
BACKEND_PID=$!

echo "Waiting for backend..."
until (echo > /dev/tcp/127.0.0.1/8080) >/dev/null 2>&1; do
  if ! kill -0 "${BACKEND_PID}" 2>/dev/null; then
    echo "backend exited before opening port 8080" >&2
    wait "${BACKEND_PID}"
    exit 1
  fi
  sleep 1
done

echo "Starting frontend..."
cd "${ROOT_DIR}/apps/client"
corepack pnpm install
corepack pnpm dev
