import { io, Socket } from 'socket.io-client';
import { useGameStore } from '../store/useGameStore';
import type { MissionExecution, Announcement } from '../../shared/types';

const SOCKET_URL = 'http://localhost:3001';

let socket: Socket | null = null;

export const initSocket = (token: string) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('mission:update', (execution: MissionExecution) => {
    useGameStore.getState().updateExecution(execution);
    useGameStore.getState().addNotification(
      'mission',
      `任务「${execution.id}」状态已更新`
    );
  });

  socket.on('mission:event', (data: { executionId: string; event: any }) => {
    useGameStore.getState().addNotification(
      'event',
      `任务发生新事件：${data.event.description}`
    );
  });

  socket.on('announcement:new', (announcement: Announcement) => {
    useGameStore.getState().addAnnouncement(announcement);
    useGameStore.getState().addNotification(
      'announcement',
      `新公告：${announcement.message}`
    );
  });

  socket.on('market:update', () => {
    useGameStore.getState().loadMarket();
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
