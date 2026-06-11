import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { missionEngine } from './services/MissionEngine.js';
import { marketService } from './services/MarketService.js';

const PORT = process.env.PORT || 3001;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

missionEngine.setSocketIO(io);
marketService.setSocketIO(io);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('joinExecution', (executionId: string) => {
    socket.join(`execution:${executionId}`);
    console.log(`Socket ${socket.id} joined execution:${executionId}`);
  });

  socket.on('leaveExecution', (executionId: string) => {
    socket.leave(`execution:${executionId}`);
    console.log(`Socket ${socket.id} left execution:${executionId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const server = httpServer.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
  console.log(`WebSocket server running`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
