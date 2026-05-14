import { useState } from 'react';
import { Flex, Input, Button, Typography } from 'antd';
interface Props { onLogin: (token: string) => void; }

export default function Login({ onLogin }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    if (!res.ok) { setError('Invalid password'); return; }
    const { token } = await res.json();
    onLogin(token);
  }

  return (
    <Flex vertical gap={16} align="center" justify='center' style={{ height: '100vh', width: '100vw' }} >
      <Flex
        component="form"
        onSubmit={handleSubmit}
        vertical
        gap={24}
        align="center"
        style={{ backgroundColor: 'rgb(198, 231, 248, 0.3)', padding: '4rem 2rem', borderRadius: '1rem', backdropFilter: 'blur(0.3rem)', border: '2px solid rgba(198, 231, 248, 0.1)' }}>
        <Typography.Title style={{ margin: '0 0 4rem 0', color: 'white', fontSize: '3rem' }}>Server Monitor</Typography.Title>
        <Input.Password
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Access password"
					size='large'
					variant='filled'
          required
					style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(0.3rem)', border: '1px solid rgba(255, 255, 255, 0.1)', height: 'auto', padding: '1rem', fontSize: '1.5rem' }}
					/>
        <Button
          type="default"
          htmlType='submit'
					size='large'
          style={{ width: '100%', height: 'auto', backgroundColor: 'rgba(255, 182, 193, 0.5)' , backdropFilter: 'blur(0.3rem)', border: '1px solid rgba(255, 182, 193, 0.1)', color: 'white'}}>
          <Typography.Title level={3} style={{ color: 'white', margin: '1rem 0' }}>Sign In</Typography.Title>
        </Button>
        {error && <p>{error}</p>}
      </Flex>
    </Flex>
  );
}
