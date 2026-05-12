import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

export function startMirrorReceiver(io: Server, port: number): void {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.use(express.text({ limit: '1mb' }));

  app.use((req, res) => {
    const processName = req.headers['x-process-name'] as string | undefined;
    res.sendStatus(200);
    if (!processName) return;
    const event = {
      ts: Date.now(),
      method: req.method,
      path: req.path,
      query: req.query,
      headers: req.headers,
      body: req.body,
    };
    io.to(`traffic:${processName}`).emit('traffic', event);
  });

  http.createServer(app).listen(port, () => console.log(`mirror receiver listening on :${port}`));
}
