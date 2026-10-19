import { io } from 'socket.io-client';

// Same origin as the page: in dev, Vite proxies /socket.io to the Nest API.
// Pages call connect() when they mount, so nothing opens before it's needed.
export const socket = io({ autoConnect: false });

// Keep in sync with src/realtime/realtime.events.ts on the API.
export const WS_EVENTS = {
  KITCHEN_SUBSCRIBE: 'kitchen:subscribe',
  ORDER_CREATED: 'order:created',
  ORDER_STATUS_UPDATED: 'order:status_updated',
  ORDER_SUBSCRIBE: 'order:subscribe',
} as const;
