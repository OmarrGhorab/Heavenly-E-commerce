// src/hooks/useSocket.ts
import { useEffect, useState } from 'react';
import createSocket from '@/lib/socket';
import { useUserStore } from '@/stores/useUserStore';

export const useSocket = () => {
  const { user } = useUserStore();
  const [socketInstance, setSocketInstance] = useState<any>(null);

  useEffect(() => {
    // Use _id if available, otherwise use id
    const userId = user?._id || user?.id;
    if (user && userId) {
      const socket = createSocket(userId, user.role === 'admin');
      setSocketInstance(socket);

      return () => {
        socket.disconnect(); // Cleanup on user change
      };
    }
  }, [user]);

  return socketInstance;
};
