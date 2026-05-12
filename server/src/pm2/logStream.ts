import pm2 from 'pm2';
import { Server } from 'socket.io';

interface PM2LogPacket {
  process: {
    pm_id: number;
    name: string;
  };
  data: string;
  type: string;
  topic: string;
}

export function startLogStream(io: Server): void {
  pm2.connect(false, (err) => {
    if (err) { console.error('pm2 connect error', err); return; }
    pm2.launchBus((err, bus) => {
      if (err) { console.error('pm2 bus error', err); return; }
      bus.on('log:out', (packet: PM2LogPacket) => {
        const name = packet.process?.name;
        if (name) io.to(`logs:${name}`).emit('log', { type: 'out', name, data: packet.data, ts: Date.now() });
      });
      bus.on('log:err', (packet: PM2LogPacket) => {
        const name = packet.process?.name;
        if (name) io.to(`logs:${name}`).emit('log', { type: 'err', name, data: packet.data, ts: Date.now() });
      });
    });
  });
}
