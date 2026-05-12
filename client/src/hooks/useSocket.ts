import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket(token: string): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io(window.location.origin, { auth: { token } });
    setSocket(s);
    return () => { s.disconnect(); };
  }, [token]);

  return socket;
}
