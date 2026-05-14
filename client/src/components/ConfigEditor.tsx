import { SaveFilled } from '@ant-design/icons';
import { ConfigProvider, Flex, FloatButton, Input, Table } from 'antd';
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
    <Flex
      vertical
      style={{ height: '50%' }}
    >
      <ConfigProvider theme={{ components: { Table: {
        colorBgContainer: 'transparent',
        headerBg: 'rgba(255, 255, 255, 0.08)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        colorText: '#eee',
        headerColor: '#eee',
        rowHoverBg: 'rgba(255, 255, 255, 0.06)',
      }}}}>
        <div style={{
          borderRadius: '0.5rem',
          overflow: 'hidden',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(0.3rem)',
          background: 'rgba(17, 17, 17, 0.5)',
        }}>
          <Table
            dataSource={Object.entries(config).map(([k, v]) => ({ key: k, value: v }))}
            pagination={false}
          >
            <Table.Column title="Key" dataIndex="key" key="key" />
            <Table.Column
              title="Value"
              dataIndex="value"
              key="value"
              render={(value: string, record: { key: string }) => (
                <Input
                  value={value}
                  onChange={e => handleChange(record.key, e.target.value)}
                  variant="borderless"
                  style={{ color: '#eee', background: 'transparent' }}
                />
              )}
            />
          </Table>
        </div>
      </ConfigProvider>
      <FloatButton
        onClick={handleSave}
        content="Save & Reload"
        icon={<SaveFilled />}
        shape="square"
        style={{
          insetInlineEnd: 24,
          padding: 8,
          width: 'auto',
          fontSize: '2rem',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(0.3rem)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      />
      {
        status &&
        <div style={{ position: 'absolute', top: '3rem', right: '3rem', padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: '0.5rem' }}>
          {status}
        </div>
      }
    </Flex>
  );
}
