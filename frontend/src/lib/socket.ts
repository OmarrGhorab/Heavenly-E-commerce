// socket.ts
import { io } from 'socket.io-client';

export const createSocket = (userId: string, isAdmin: boolean) => {
  const socket = io(import.meta.env.VITE_API_BASE_URL, {
    query: { userId, isAdmin },
    reconnection: true,
    withCredentials: true,
    transports: ["websocket", "polling"],
  });
  socket.on('connect', () => {
    console.log('Connected to server');
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err);
  });

  socket.on('reconnect', () => {
    console.log('Reconnected to server');
  });

  // Optionally join a room
  socket.emit('join', userId);
  socket.emit("getMissedNotifications");

  return socket;
};

export default createSocket;
