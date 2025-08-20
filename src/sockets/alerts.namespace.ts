import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../config/logger';

export const setupAlertsNamespace = (io: SocketIOServer): void => {
  const alertsNamespace = io.of('/alerts');

  alertsNamespace.on('connection', (socket) => {
    logger.info(`Client connected to alerts namespace: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`Client disconnected from alerts namespace: ${socket.id}`);
    });

    // Join room for specific alert types
    socket.on('joinAlertType', (alertType: string) => {
      socket.join(`alerts:${alertType}`);
      logger.info(`Client ${socket.id} joined alert type: ${alertType}`);
    });

    // Leave room for specific alert types
    socket.on('leaveAlertType', (alertType: string) => {
      socket.leave(`alerts:${alertType}`);
      logger.info(`Client ${socket.id} left alert type: ${alertType}`);
    });
  });

  // Helper function to broadcast alert updates
  alertsNamespace.broadcastAlertUpdate = (alert: any) => {
    alertsNamespace.emit('alertUpdated', alert);
    alertsNamespace.to(`alerts:${alert.type}`).emit('alertTypeUpdated', alert);
  };
};