#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(CDPATH= cd -- "${SCRIPT_DIR}/.." && pwd)"

: "${DEPLOY_HOST:?Set DEPLOY_HOST to the server hostname or IP}"

DEPLOY_USER="${DEPLOY_USER:-deploy}"
DEPLOY_GROUP="${DEPLOY_GROUP:-www-data}"
SSH_PORT="${SSH_PORT:-22}"
DEPLOY_DIR="${DEPLOY_DIR:-/var/www/gender-healthcare-fe}"
NGINX_SERVICE="${NGINX_SERVICE:-nginx}"
CHECK_URL="${CHECK_URL:-http://127.0.0.1/}"
HEALTH_RETRIES="${HEALTH_RETRIES:-15}"

RELEASE_ID="$(date -u +%Y%m%d%H%M%S)"
REMOTE_RELEASE_DIR="${DEPLOY_DIR}/releases/${RELEASE_ID}"

remote() {
    ssh -p "${SSH_PORT}" "${DEPLOY_USER}@${DEPLOY_HOST}" "$@"
}

echo "Building frontend..."
cd "${PROJECT_DIR}"
npm run build

if [[ ! -f "${PROJECT_DIR}/dist/index.html" ]]; then
    echo "Frontend build output not found: ${PROJECT_DIR}/dist" >&2
    exit 1
fi

PREVIOUS_RELEASE="$(remote "readlink -f '${DEPLOY_DIR}/current' 2>/dev/null || true" | tr -d '\r')"

echo "Preparing release ${RELEASE_ID}..."
remote "sudo mkdir -p '${REMOTE_RELEASE_DIR}' '${DEPLOY_DIR}/releases' && sudo chown -R '${DEPLOY_USER}:${DEPLOY_GROUP}' '${DEPLOY_DIR}'"
scp -P "${SSH_PORT}" -r "${PROJECT_DIR}/dist/." "${DEPLOY_USER}@${DEPLOY_HOST}:${REMOTE_RELEASE_DIR}/"

echo "Switching current release..."
remote "sudo ln -sfn '${REMOTE_RELEASE_DIR}' '${DEPLOY_DIR}/current' && sudo nginx -t && sudo systemctl reload '${NGINX_SERVICE}'"

echo "Checking served frontend..."
for ((attempt = 1; attempt <= HEALTH_RETRIES; attempt++)); do
    if remote "curl --fail --silent --show-error --max-time 5 '${CHECK_URL}' | grep -q '<'"; then
        echo "Frontend release ${RELEASE_ID} is healthy."
        exit 0
    fi
    sleep 2
done

echo "Frontend check failed; restoring the previous release." >&2
if [[ -n "${PREVIOUS_RELEASE}" ]]; then
    remote "sudo ln -sfn '${PREVIOUS_RELEASE}' '${DEPLOY_DIR}/current' && sudo nginx -t && sudo systemctl reload '${NGINX_SERVICE}'"
else
    remote "sudo rm -f '${DEPLOY_DIR}/current' && sudo systemctl reload '${NGINX_SERVICE}'"
fi
exit 1
