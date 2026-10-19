export const WS_EVENTS = {
  KITCHEN_SUBSCRIBE: 'kitchen:subscribe',
  ORDER_CREATED: 'order:created',
  ORDER_STATUS_UPDATED: 'order:status_updated',
  ORDER_SUBSCRIBE: 'order:subscribe'
} as const;

export const ROOMS = {
  KITCHEN: 'kitchen',
  order: (id: string) => `order:${id}`,
};