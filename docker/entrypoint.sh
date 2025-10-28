#!/bin/sh
set -e

# Prende l'endpoint da API_BASE oppure dalle VITE_* se le stai passando
RUNTIME_API_BASE="${API_BASE:-${VITE_API_BASE:-${VITE_FLOWABLE_BASE_URL}}}"

if [ -n "$RUNTIME_API_BASE" ]; then
  echo "Setting API_BASE to ${RUNTIME_API_BASE}"
  sed -i "s#http://localhost:8080/flowable-rest/service#${RUNTIME_API_BASE}#g" /usr/share/nginx/html/config.js
fi

exec nginx -g "daemon off;"
