import { Express, Request, Response } from 'express';
import pm2 from 'pm2';

function pm2Connect(): Promise<void> {
  return new Promise((resolve, reject) => pm2.connect(false, (err) => err ? reject(err) : resolve()));
}

function pm2List(): Promise<pm2.ProcessDescription[]> {
  return new Promise((resolve, reject) => pm2.list((err, list) => err ? reject(err) : resolve(list)));
}

function pm2Action(action: 'restart' | 'stop' | 'start' | 'reload', name: string): Promise<void> {
  return new Promise((resolve, reject) => pm2[action](name, (err) => err ? reject(err) : resolve()));
}

export function registerPm2Routes(app: Express): void {
  app.get('/pm2/processes', async (_req: Request, res: Response) => {
    try {
      await pm2Connect();
      const list = await pm2List();
      pm2.disconnect();
      res.json(list.map(p => ({ name: p.name, status: p.pm2_env?.status, pid: p.pid, memory: p.monit?.memory, cpu: p.monit?.cpu })));
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.get('/pm2/process/:name/status', async (req: Request, res: Response) => {
    try {
      await pm2Connect();
      const list = await pm2List();
      pm2.disconnect();
      const proc = list.find(p => p.name === req.params.name);
      if (!proc) { res.status(404).json({ error: 'process not found' }); return; }
      res.json({ name: proc.name, status: proc.pm2_env?.status, pid: proc.pid, memory: proc.monit?.memory, cpu: proc.monit?.cpu, uptime: proc.pm2_env?.pm_uptime });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  for (const action of ['restart', 'stop', 'start', 'reload'] as const) {
    app.post(`/pm2/process/:name/${action}`, async (req: Request, res: Response) => {
      try {
        await pm2Connect();
        await pm2Action(action, req.params.name);
        pm2.disconnect();
        res.json({ ok: true });
      } catch (err) {
        res.status(500).json({ error: String(err) });
      }
    });
  }
}
