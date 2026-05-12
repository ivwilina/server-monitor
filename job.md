# Server Monitor Tool

A web-based tool for testers to monitor and manage PM2-managed server processes on a VPS without SSH access. Supports real-time log streaming, nginx traffic capture, config modification, and process control — all through a password-protected web interface. Multiple testers can use the tool simultaneously.

## Features

- List all PM2 processes running on the VPS
- View status and config of a specific process
- Control processes: Reload / Restart / Stop / Start
- Stream PM2 logs in real-time (stdout/stderr)
- Stream nginx traffic in real-time (request metadata)
- Modify process config (.env) and reload
- Multi-tester support: multiple users can watch different processes concurrently

## Tech Stack

### Backend
- TypeScript
- Node.js (Express, Socket.io, PM2 programmatic API)
- JWT for session auth

### Frontend
- React (Vite)
- Socket.io client

## VPS Current Setup
- Ubuntu 22.04 LTS
- Node.js 18+
- PM2
- Nginx reverse proxy with mirror module

## Architecture

This tool is deployed on the same VPS as the target servers. It exposes two real-time data pipelines to the web interface via Socket.io rooms.

### Data Pipelines

**Pipeline 1 — PM2 Logs**
```
pm2.launchBus() (programmatic API)
  └─▶ parse by process name
      └─▶ broadcast to Socket.io room "logs:{processName}"
```

**Pipeline 2 — Nginx Traffic**
```
nginx mirror_module ──▶ POST :6069/mirror
  └─▶ parse request metadata (method, path, headers, body, response time)
      └─▶ broadcast to Socket.io room "traffic:{processName}"
```

Process name is resolved from the `X-Process-Name` header injected by nginx.

### Multi-Tester Model

Each tester connects via WebSocket and subscribes to named rooms per process. Multiple testers can watch the same or different processes concurrently. Socket.io handles room broadcasting natively.

```
Tester A ──▶ subscribe("logs:api-server")
Tester B ──▶ subscribe("logs:api-server") + subscribe("traffic:api-server")
Tester C ──▶ subscribe("traffic:worker")
```

### Auth

- `POST /auth/login { password }` → returns a short-lived JWT (1h)
- JWT is sent in the Socket.io handshake and verified on every room join
- No plain password is ever passed over WebSocket

### Nginx Config (mirror side)

```nginx
location / {
    proxy_pass http://target-app;
    mirror /mirror;
    mirror_request_body on;
}

location /mirror {
    internal;
    proxy_pass http://localhost:6069;
    proxy_set_header X-Process-Name "api-server";
}
```

## Project Structure

```
server-monit/
├── server/
│   └── src/
│       ├── app.ts                  # Express + Socket.io bootstrap
│       ├── auth/
│       │   └── middleware.ts       # Password → JWT
│       ├── pm2/
│       │   ├── api.ts              # list, status, restart, stop, start
│       │   ├── logStream.ts        # pm2.launchBus() → room broadcast
│       │   └── config.ts           # read/write .env, pm2.reload()
│       ├── mirror/
│       │   └── receiver.ts         # POST :6069 listener → room broadcast
│       └── ws/
│           └── rooms.ts            # subscription management, auth guard
└── client/
    └── src/
        ├── pages/
        │   ├── Login.tsx
        │   └── Dashboard.tsx
        ├── components/
        │   ├── ProcessList.tsx
        │   ├── LogViewer.tsx       # subscribes to "logs:{name}"
        │   ├── TrafficViewer.tsx   # subscribes to "traffic:{name}"
        │   └── ConfigEditor.tsx
        └── hooks/
            ├── useSocket.ts
            └── useProcessStream.ts
```

## Logic

### Monitor Flow

1. Tester opens web interface
2. Tester submits access password → receives JWT session token
3. Tester selects a process to watch
4. Client subscribes to `logs:{processName}` and/or `traffic:{processName}` rooms via Socket.io
5. **For PM2 logs**: server streams stdout/stderr via `pm2.launchBus()` and broadcasts to the room
6. **For nginx traffic**: nginx mirrors each request to `POST :6069/mirror`; server parses and broadcasts to the room
7. All subscribed testers receive the events in real-time

### Modify Config Flow

1. Tester selects a process and opens its config
2. Server reads the `.env` file for that process via PM2 API
3. Tester edits key-value pairs in the web interface
4. On save, server validates keys against an allowlist, writes the `.env` file, then calls `pm2.reload(processName)` — no shell exec
