[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE) [![Version](https://img.shields.io/badge/version-7.0.0-blue.svg)](#-versioning) [![CI](https://github.com/lmontag/flowable-ui-client/actions/workflows/ci.yml/badge.svg)](https://github.com/lmontag/flowable-ui-client/actions/workflows/ci.yml)

# Flowable UI Client

A lightweight and modern web interface for **Flowable REST APIs (v7.x)**.  
Built with **React + Vite**, this client allows you to explore process definitions, start new process instances, manage user tasks, and monitor runtime state — directly from a clean web UI.

## ✨ Features
- View **process definitions** and their versions
- Start **process instances** with variables
- Inspect **active instances**, variables and incidents
- Manage **user tasks** (claim, complete, open details)
- **Pagination** and filters for tasks and instances
- Layout inspired by **Flowable Work UI**

## 🔗 Compatibility
| Component | Version |
|----------|---------|
| Flowable Engine | 7.x |
| Flowable REST base | `/flowable-rest/service` |
| Node.js | ≥ 18 |
| NPM | ≥ 9 |
| TypeScript | ≥ 5 |

## 🚀 Quick start

```bash
# Install deps
npm install

# Configure env
cp .env.example .env
# then edit VITE_API_BASE to point to your Flowable REST (e.g. http://localhost:8080/flowable-rest/service)

# (optional) You can also configure a development proxy in vite.config.ts if needed to simplify local development.

# Start dev
npm run dev
```

Open http://localhost:5173

## 🧰 Proxy (optional, for dev)

**Why/when**: use this only during local development when the Flowable REST API is on a different origin (to avoid CORS). In production, configure CORS at the server or use a reverse proxy.

You can enable a dev proxy in `vite.config.ts` to avoid CORS during development. Example snippet:

```ts
server: {
  proxy: {
    '/flowable-rest': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

> **Note:** Do not commit company-specific hosts or tokens. Keep the proxy generic and document your environment in the README instead.

## 🐳 Docker

Build a production image and run with Nginx:

```bash
docker build -t dockerlmontag/flowable-ui-client:latest .
docker run -p 8080:80 dockerlmontag/flowable-ui-client:latest
```

Open http://localhost:8080

## ⚠️ Security & CORS

This project is a **client** for Flowable REST. CORS must be configured on your Flowable REST endpoint (server-side) or via a reverse proxy. The UI supports Basic authentication against the REST endpoint; ensure you follow your organization's guidelines when exposing endpoints.

## 📦 Versioning

The package version is aligned to **7.0.0** to indicate compatibility with Flowable 7.x APIs.

## 📜 License

This project is licensed under the [MIT License](LICENSE).  
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
