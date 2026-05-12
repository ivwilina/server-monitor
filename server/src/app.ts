import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { registerAuthRoutes } from './auth/middleware';
import { registerPm2Routes } from './pm2/api';
import { startLogStream } from './pm2/logStream';
import { startMirrorReceiver } from './mirror/receiver';
import { registerWsRooms } from './ws/rooms';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

registerAuthRoutes(app);
registerPm2Routes(app);
registerWsRooms(io);
startLogStream(io);

const PORT = Number(process.env.PORT) || 3001;
const MIRROR_PORT = Number(process.env.MIRROR_PORT) || 6069;

httpServer.listen(PORT, () => console.log(`server-monit listening on :${PORT}`));
startMirrorReceiver(io, MIRROR_PORT);
