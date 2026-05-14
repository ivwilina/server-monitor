import { useEffect, useState } from 'react';
import LogViewer from '../components/LogViewer';
import ConfigEditor from '../components/ConfigEditor';
import { Flex, Card, Typography } from 'antd'
import { SignalFilled } from '@ant-design/icons';
import { useSocket } from '../hooks/useSocket';

interface Process { name: string; status: string; pid: number; }

interface Props { token: string; }

export default function Dashboard({ token: _token }: Props) {
  const socket = useSocket(_token);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<'logs' | 'traffic' | 'config'>('logs');

  useEffect(() => {
    fetch('/pm2/processes').then(r => r.json()).then(setProcesses);
  }, []);

  return (
    // <div>
    //   <ProcessList processes={processes} selected={selected} onSelect={setSelected} />
    //   {selected && (
    //     <div>
    //       <div>
    //         <button onClick={() => setTab('logs')}>Logs</button>
    //         <button onClick={() => setTab('config')}>Config</button>
    //       </div>
    //       {tab === 'logs' && <LogViewer socket={socket} processName={selected} />}
    //       {tab === 'config' && <ConfigEditor socket={socket} processName={selected} />}
    //     </div>
    //   )}
    // </div>

		<Flex justify='space-between' style={{ height: '100vh', width: '100vw' }}>
			<Flex
				vertical
				style={{
					width: '15%',
					margin: '1rem',
					borderRadius: '0.5rem',
					overflow: 'scroll',
					scrollbarWidth: 'none',
				}}
				gap={16}
			>
				{processes.map((p) => (
					<Card
						key={p.name}
						size="default"
						style={{
							width: '100%',
							backgroundColor: selected === p.name ? 'rgba(255, 182, 193, 0.5)' : 'rgba(255, 255, 255, 0.1)',
							border: '2px solid rgba(255, 255, 255, 0.1)',
							backdropFilter: 'blur(0.3rem)',
							transition: 'all 0.3s ease',
						}}
						onClick={() => setSelected(p.name)}
					>
						<Flex align="center" gap={16} style={{ fontSize: '1rem', color: 'white', overflow: 'hidden' }}>
							<SignalFilled style={{ color: p.status === 'online' ? 'green' : 'red' }} />
							{p.name}
						</Flex>
					</Card>
				))}
			</Flex>
			<Flex
				vertical
				gap={32}
				justify="space-between"
				style={{
					width: '80%',
					backgroundColor: 'transparent',
					margin: '1rem',
				}}
			>
				{selected && (
					<>
						<LogViewer socket={socket} processName={selected} />
						<ConfigEditor socket={socket} processName={selected} />
					</>
				)}
			</Flex>
		</Flex>
	);
}
