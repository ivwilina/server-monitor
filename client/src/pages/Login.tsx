import { useState } from 'react';

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
    <form onSubmit={handleSubmit}>
      <h2>Server Monitor</h2>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Access password" required />
      <button type="submit">Login</button>
      {error && <p>{error}</p>}
    </form>
  );
}
