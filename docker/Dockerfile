# --- build stage ---
FROM node:20-bookworm-slim AS build
WORKDIR /app

ENV NPM_CONFIG_FUND=false NPM_CONFIG_AUDIT=false
RUN npm i -g npm@11 && npm --version

COPY package*.json ./

RUN npm install --include=dev --no-audit --no-fund
COPY . .
RUN npm run build

# --- runtime stage ---
FROM nginx:alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Entrypoint runtime-config
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
HEALTHCHECK CMD wget -qO- http://localhost/ || exit 1
