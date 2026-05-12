import { useEffect, useState } from 'react';
import ProcessList from '../components/ProcessList';
import LogViewer from '../components/LogViewer';
import TrafficViewer from '../components/TrafficViewer';
import ConfigEditor from '../components/ConfigEditor';
import { useSocket } from '../hooks/useSocket';

interface Process { name: string; status: string; pid: number; }

interface Props { token: string; }

export default function Dashboard({ token }: Props) {
  const socket = useSocket(token);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<'logs' | 'traffic' | 'config'>('logs');

  useEffect(() => {
    fetch('/pm2/processes').then(r => r.json()).then(setProcesses);
  }, []);

  return (
    <div>
      <ProcessList processes={processes} selected={selected} onSelect={setSelected} />
      {selected && (
        <div>
          <div>
            <button onClick={() => setTab('logs')}>Logs</button>
            <button onClick={() => setTab('traffic')}>Traffic</button>
            <button onClick={() => setTab('config')}>Config</button>
          </div>
          {tab === 'logs' && <LogViewer socket={socket} processName={selected} />}
          {tab === 'traffic' && <TrafficViewer socket={socket} processName={selected} />}
          {tab === 'config' && <ConfigEditor socket={socket} processName={selected} />}
        </div>
      )}
    </div>
  );
}
