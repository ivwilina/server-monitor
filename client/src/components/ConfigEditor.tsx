import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';

interface Props { socket: Socket | null; processName: string; }

export default function ConfigEditor({ socket, processName }: Props) {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!socket) return;
    socket.emit('config:read', processName, (err: string | null, data?: Record<string, string>) => {
      if (err) { setStatus(`Error: ${err}`); return; }
      setConfig(data ?? {});
    });
  }, [socket, processName]);

  function handleChange(key: string, value: string) {
    setConfig(prev => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    if (!socket) return;
    socket.emit('config:write', { processName, updates: config }, (err: string | null) => {
      setStatus(err ? `Error: ${err}` : 'Saved and reloaded.');
    });
  }

  return (
    <div>
      {Object.entries(config).map(([k, v]) => (
        <div key={k}>
          <label>{k}</label>
          <input value={v} onChange={e => handleChange(k, e.target.value)} />
        </div>
      ))}
      <button onClick={handleSave}>Save & Reload</button>
      {status && <p>{status}</p>}
    </div>
  );
}
