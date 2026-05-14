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
    <pre style={{
      height: '45%',
      overflow: 'auto',
      background: 'rgba(17, 17, 17, 0.5)',
      backdropFilter: 'blur(0.3rem)',
      borderRadius: '0.5rem',
      border: '2px solid rgba(255, 255, 255, 0.1)',
      scrollbarWidth: 'none',
      color: '#eee',
      padding: '0rem 1.2rem',
      margin: 0,
      fontSize: '1.2rem'
    }}>
      {lines.map((l, i) => <span key={i} style={{ color: l.type === 'err' ? '#f88' : '#eee' }}>{l.data}{'\n'}</span>)}
      <div ref={bottomRef} />
    </pre>
  );
}
