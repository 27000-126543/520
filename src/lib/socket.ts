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

  socket.on('executionUpdate', (execution: MissionExecution) => {
    useGameStore.getState().updateExecution(execution);
  });

  socket.on('missionEvent', (event: any) => {
    useGameStore.getState().addNotification(
      'event',
      `任务发生新事件：${event.description}`
    );
  });

  socket.on('missionComplete', (data: {
    success: boolean; perfection: number; pointsReward: number; reputationReward: number;
    scrolls: { id: string; name: string; rarity: string }[];
    failure: { reputationLoss: number; exposureIncrease: number } | null;
  }) => {
    const scrollList = data.scrolls.map(s => `${s.name}(${s.rarity})`).join('、') || '无';
    useGameStore.getState().addNotification(
      data.success ? 'success' : 'error',
      data.success
        ? `任务完成！完美度 ${data.perfection.toFixed(0)}%，积分 +${data.pointsReward}，声望 +${data.reputationReward}，获得卷轴：${scrollList}`
        : `任务失败！声望 -${data.failure?.reputationLoss || 0}，暴露风险 +${data.failure?.exposureIncrease || 0}`
    );
    setTimeout(() => {
      useGameStore.getState().loadExecutions();
      useGameStore.getState().loadSpies();
      useGameStore.getState().loadScrolls();
      useGameStore.getState().loadOrganizationData();
    }, 500);
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
