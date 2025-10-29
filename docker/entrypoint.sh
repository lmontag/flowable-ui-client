#!/bin/sh
set -e

API="${API_URL:-http://localhost:8080}"

cat >/usr/share/nginx/html/config.js <<EOF
window.__RUNTIME_CONFIG__ = { API_URL: "${API}" };
EOF

exec nginx -g 'daemon off;'
