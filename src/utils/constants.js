export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;

export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read'
};

export const USER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline'
};

export const COLORS = {
  PRIMARY: '#0088cc',
  PRIMARY_DARK: '#006ba6',
  SUCCESS: '#4CAF50',
  ERROR: '#f44336',
  WARNING: '#ff9800',
  GRAY_LIGHT: '#f5f5f5',
  GRAY_MEDIUM: '#e0e0e0',
  GRAY_DARK: '#757575'
};