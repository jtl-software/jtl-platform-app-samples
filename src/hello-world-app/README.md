# ![JTL logo](https://avatars.githubusercontent.com/u/31404730?s=25&v=4) JTL-Platform Sample Hello World App

## ⚡️ Prerequisites

From the root directory, install the required dependencies:

```bash
cd src/hello-world-app
npm install
```

## 🛠️ Development

Run `npm run dev` to start the monorepo

## 🔌 Ports

This is a mono-repo, both backend and frontend is expected to start from one machine

| Port | Protocol | Service   |
| ---- | -------- | --------- |
| 3005 | HTTP     | API Main  |
| 3004 | HTTPS    | React App |

## Environment specific Secrets & Variables

These are the environment variables that have to be added in the `packages/backend` for the project to start.

| Name            | Description                        | Type       |
| --------------- | ---------------------------------- | ---------- |
| `CLIENT_ID`     | The ClientID of the Sample App     | `Variable` |
| `CLIENT_SECRET` | The Client Scret of the Sample App | `Secret`   |
