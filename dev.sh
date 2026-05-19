#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_CONTAINER="team-task-manager-postgres"
DB_IMAGE="postgres:16"
DB_VOLUME="team-task-manager-postgres-data"
DB_NAME="team_task_manager"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_HOST="localhost"
DB_PORT="5432"
BACKEND_PORT="8080"
FRONTEND_PORT="5173"
SEED_FILE="${ROOT_DIR}/apps/server/src/main/resources/db/seed/mock_data.sql"
BACKEND_PID=""

cleanup() {
  if [[ -n "${BACKEND_PID}" ]] && kill -0 "${BACKEND_PID}" 2>/dev/null; then
    kill "${BACKEND_PID}" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

port_is_open() {
  local port="$1"
  (echo >"/dev/tcp/127.0.0.1/${port}") >/dev/null 2>&1
}

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required but was not found in PATH" >&2
  exit 1
fi

if port_is_open "${BACKEND_PORT}"; then
  echo "port ${BACKEND_PORT} is already in use; stop the existing backend before running dev.sh" >&2
  exit 1
fi

if port_is_open "${FRONTEND_PORT}"; then
  echo "port ${FRONTEND_PORT} is already in use; stop the existing frontend before running dev.sh" >&2
  exit 1
fi

echo "Checking Docker..."
if ! docker info >/dev/null 2>&1; then
  echo "docker is installed but the Docker daemon is not reachable" >&2
  exit 1
fi

if docker ps -a --format '{{.Names}}' | grep -qx "${DB_CONTAINER}"; then
  if ! docker port "${DB_CONTAINER}" 5432/tcp | grep -q ":${DB_PORT}$"; then
    echo "existing ${DB_CONTAINER} does not expose PostgreSQL on host port ${DB_PORT}" >&2
    echo "recreate it once with:" >&2
    echo "docker stop ${DB_CONTAINER}" >&2
    echo "docker rm ${DB_CONTAINER}" >&2
    echo "./dev.sh" >&2
    echo "then reseed with:" >&2
    echo "docker exec -i ${DB_CONTAINER} psql -U ${DB_USER} -d ${DB_NAME} < apps/server/src/main/resources/db/seed/mock_data.sql" >&2
    exit 1
  fi
  echo "Starting existing PostgreSQL container..."
  docker start "${DB_CONTAINER}" >/dev/null
else
  echo "Creating PostgreSQL container..."
  docker volume create "${DB_VOLUME}" >/dev/null
  docker run -d \
    --name "${DB_CONTAINER}" \
    -e POSTGRES_DB="${DB_NAME}" \
    -e POSTGRES_USER="${DB_USER}" \
    -e POSTGRES_PASSWORD="${DB_PASSWORD}" \
    -p "${DB_PORT}:5432" \
    -v "${DB_VOLUME}:/var/lib/postgresql/data" \
    "${DB_IMAGE}" >/dev/null
fi

echo "Waiting for PostgreSQL..."
until docker exec "${DB_CONTAINER}" pg_isready -U "${DB_USER}" -d "${DB_NAME}" >/dev/null 2>&1; do
  sleep 1
done

echo "Starting backend..."
(
  cd "${ROOT_DIR}/apps/server"
  SPRING_DATASOURCE_URL="jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}" \
  SPRING_DATASOURCE_USERNAME="${DB_USER}" \
  SPRING_DATASOURCE_PASSWORD="${DB_PASSWORD}" \
  SERVER_PORT="${BACKEND_PORT}" \
  mvn spring-boot:run
) &
BACKEND_PID=$!

echo "Waiting for backend..."
until port_is_open "${BACKEND_PORT}"; do
  if ! kill -0 "${BACKEND_PID}" 2>/dev/null; then
    echo "backend exited before opening port ${BACKEND_PORT}" >&2
    wait "${BACKEND_PID}"
    exit 1
  fi
  sleep 1
done

if [[ -f "${SEED_FILE}" ]]; then
  echo "Seeding mock data..."
  docker exec -i "${DB_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" < "${SEED_FILE}" >/dev/null
fi

echo "Starting frontend..."
cd "${ROOT_DIR}/apps/client"
corepack pnpm install
VITE_API_TARGET="http://localhost:${BACKEND_PORT}" \
corepack pnpm exec vite --host 0.0.0.0 --port "${FRONTEND_PORT}" --strictPort
