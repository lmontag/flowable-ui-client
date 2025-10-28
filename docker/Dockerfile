# --- build stage ---
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# --- runtime stage ---
FROM nginx:alpine
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Entrypoint runtime-config
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
HEALTHCHECK CMD wget -qO- http://localhost/ || exit 1
