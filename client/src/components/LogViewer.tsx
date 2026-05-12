import { useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';

interface LogEntry { type: 'out' | 'err'; data: string; ts: number; }
interface Props { socket: Socket | null; processName: string; }

export default function LogViewer({ socket, processName }: Props) {
  const [lines, setLines] = useState<LogEntry[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;
    setLines([]);
    const handler = (entry: LogEntry) => setLines(prev => [...prev.slice(-499), entry]);
    socket.on('log', handler);

    const doSubscribe = () => socket.emit('subscribe', `logs:${processName}`);
    if (socket.connected) {
      doSubscribe();
    } else {
      socket.once('connect', doSubscribe);
    }

    return () => {
      socket.emit('unsubscribe', `logs:${processName}`);
      socket.off('log', handler);
      socket.off('connect', doSubscribe);
    };
  }, [socket, processName]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [lines]);

  return (
    <pre style={{ height: 400, overflow: 'auto', background: '#111', color: '#eee', padding: 8 }}>
      {lines.map((l, i) => <span key={i} style={{ color: l.type === 'err' ? '#f88' : '#eee' }}>{l.data}{'\n'}</span>)}
      <div ref={bottomRef} />
    </pre>
  );
}
