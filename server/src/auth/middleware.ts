import { Express, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const PASSWORD = process.env.ACCESS_PASSWORD ?? 'changeme';
const JWT_SECRET = process.env.JWT_SECRET ?? 'changeme-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';

export function registerAuthRoutes(app: Express): void {
  app.post('/auth/login', async (req: Request, res: Response) => {
    const { password } = req.body as { password?: string };
    if (!password) {
      res.status(400).json({ error: 'password required' });
      return;
    }
    const match = password === PASSWORD || await bcrypt.compare(password, PASSWORD).catch(() => false);
    if (!match) {
      res.status(401).json({ error: 'invalid password' });
      return;
    }
    const token = jwt.sign({}, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
    res.json({ token });
  });
}

export function verifyToken(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}
