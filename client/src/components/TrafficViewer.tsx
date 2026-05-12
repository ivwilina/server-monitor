import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';

interface TrafficEntry { ts: number; method: string; path: string; }
interface Props { socket: Socket | null; processName: string; }

export default function TrafficViewer({ socket, processName }: Props) {
  const [entries, setEntries] = useState<TrafficEntry[]>([]);

  useEffect(() => {
    if (!socket) return;
    setEntries([]);
    socket.emit('subscribe', `traffic:${processName}`);
    const handler = (entry: TrafficEntry) => setEntries(prev => [...prev.slice(-199), entry]);
    socket.on('traffic', handler);
    return () => {
      socket.emit('unsubscribe', `traffic:${processName}`);
      socket.off('traffic', handler);
    };
  }, [socket, processName]);

  return (
    <table>
      <thead><tr><th>Time</th><th>Method</th><th>Path</th></tr></thead>
      <tbody>
        {entries.map((e, i) => (
          <tr key={i}>
            <td>{new Date(e.ts).toISOString()}</td>
            <td>{e.method}</td>
            <td>{e.path}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
