import fs from 'fs';
import path from 'path';
import pm2 from 'pm2';

const KEY_PATTERN = /^[A-Z_][A-Z0-9_]*$/i;

function pm2Describe(name: string): Promise<pm2.ProcessDescription[]> {
  return new Promise((resolve, reject) => pm2.describe(name, (err, desc) => err ? reject(err) : resolve(desc)));
}

function pm2Reload(name: string): Promise<void> {
  return new Promise((resolve, reject) => pm2.reload(name, (err) => err ? reject(err) : resolve()));
}

function parseEnv(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    result[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return result;
}

function serializeEnv(env: Record<string, string>): string {
  return Object.entries(env).map(([k, v]) => `${k}=${v}`).join('\n') + '\n';
}

export async function readConfig(processName: string): Promise<Record<string, string>> {
  const desc = await pm2Describe(processName);
  const cwd = desc[0]?.pm2_env?.pm_cwd;
  if (!cwd) throw new Error('process cwd not found');
  const envPath = path.join(cwd, '.env.config');
  if (!fs.existsSync(envPath)) return {};
  return parseEnv(fs.readFileSync(envPath, 'utf8'));
}

export async function writeConfig(processName: string, updates: Record<string, string>): Promise<void> {
  for (const key of Object.keys(updates)) {
    if (!KEY_PATTERN.test(key)) throw new Error(`invalid key: ${key}`);
  }
  const desc = await pm2Describe(processName);
  const cwd = desc[0]?.pm2_env?.pm_cwd;
  if (!cwd) throw new Error('process cwd not found');
  const envPath = path.join(cwd, '.env.config');
  const existing = fs.existsSync(envPath) ? parseEnv(fs.readFileSync(envPath, 'utf8')) : {};
  const merged = { ...existing, ...updates };
  fs.writeFileSync(envPath, serializeEnv(merged), 'utf8');
  await pm2Reload(processName);
}
