import { Server, Socket } from 'socket.io';
import { verifyToken } from '../auth/middleware';
import { readConfig, writeConfig } from '../pm2/config';

export function registerWsRooms(io: Server): void {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token || !verifyToken(token)) {
      next(new Error('unauthorized'));
      return;
    }
    next();
  });

  io.on('connection', (socket: Socket) => {
    socket.on('subscribe', (room: string) => {
      if (/^(logs|traffic):[a-zA-Z0-9_-]+$/.test(room)) socket.join(room);
    });

    socket.on('unsubscribe', (room: string) => {
      socket.leave(room);
    });

    socket.on('config:read', async (processName: string, cb: (err: string | null, data?: Record<string, string>) => void) => {
      try {
        const config = await readConfig(processName);
        cb(null, config);
      } catch (err) {
        cb(String(err));
      }
    });

    socket.on('config:write', async ({ processName, updates }: { processName: string; updates: Record<string, string> }, cb: (err: string | null) => void) => {
      try {
        await writeConfig(processName, updates);
        cb(null);
      } catch (err) {
        cb(String(err));
      }
    });
  });
}
