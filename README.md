[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE) [![Version](https://img.shields.io/badge/version-7.0.0-blue.svg)](#-versioning)

# Flowable UI Client

A lightweight and modern web interface for **Flowable REST APIs (v7.x)**.
Built with **React + Vite**, this client allows you to explore process definitions, start new process instances, manage user tasks, and monitor runtime state — directly from a clean web UI.

---

## ✨ Features

* View **process definitions** and their versions
* Start **process instances** with variables
* Inspect **active instances**, variables and incidents
* Manage **user tasks** (claim, complete, open details)
* **Pagination** and filters for tasks and instances
* Layout inspired by **Flowable Work UI**

---

## 🔗 Compatibility

| Component          | Version                  |
| ------------------ | ------------------------ |
| Flowable Engine    | 7.x                      |
| Flowable REST base | `/flowable-rest/service` |
| Node.js            | ≥ 18                     |
| NPM                | ≥ 9                      |
| TypeScript         | ≥ 5                      |

---

## 🚀 Quick start

```bash
# Install deps
npm install

# Configure env
cp .env.example .env
# then edit VITE_FLOWABLE_API_URL to point to your Flowable REST base
# (e.g. http://localhost:8080)

# Start dev
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

> 🧩 **Note:** The app expects the REST base URL to end with the host and port only
> (e.g. `http://localhost:8080`), since all endpoints are resolved automatically by the client.

---

## 🧰 Optional dev proxy (for CORS issues)

If you get CORS errors during development because your Flowable REST API runs on a **different origin**
(e.g. backend on port 8080 and UI on 5173), you can enable the commented proxy block in `vite.config.ts`.

Example file (included by default):

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    /*
     * Optional: Flowable REST dev proxy
     * Uncomment this block only if you get CORS issues
     * when connecting to a Flowable REST API running on a different origin.
     */
    // proxy: {
    //   '/flowable-rest': {
    //     target: 'http://localhost:8080',
    //     changeOrigin: true,
    //     secure: false,
    //   },
    // },
  },
})
```

> 💡 Just uncomment the `proxy` section and restart `npm run dev` to bypass CORS locally.

---

## 🐳 Docker

Build a production image and run with Nginx:

```bash
docker build -t flowable-ui-client -f docker/Dockerfile .
docker run -d -p 8080:80 -e API_URL=https://flowable.dev.mycompany.it:8443 flowable-ui-client
```

Open [http://localhost:8080](http://localhost:8080)

### 🔧 Environment variables

| Variable                    | Used by                | Description                                                                         |
| --------------------------- | ---------------------- | ----------------------------------------------------------------------------------- |
| **`API_URL`**               | `docker/entrypoint.sh` | Runtime-only. Defines the Flowable REST base URL. Default: `http://localhost:8080`. |
| **`VITE_FLOWABLE_API_URL`** | Vite build / local dev | Used during development or build to set the Flowable REST base URL.                 |

> 🧠 The runtime variable `API_URL` overrides the build-time `VITE_FLOWABLE_API_URL`.
> During local development, only `VITE_FLOWABLE_API_URL` is used.

---

## ⚠️ Security & CORS

This project is a **client** for Flowable REST.
CORS must be configured **on the server side** (Flowable REST) or via a **reverse proxy** in production.
During local development, you can temporarily use the Vite dev proxy as shown above.

---

## 📦 Versioning

The package version is aligned to **7.0.0** to indicate compatibility with Flowable 7.x APIs.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.