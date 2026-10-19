import { getKitchenKey } from './kitchenKey';

export type OrderStatus = 'RECEIVED' | 'PREPARING' | 'READY';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  menuItem: MenuItem;
}

export interface Order {
  id: string;
  code: string;
  customerName: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items?: OrderItem[];
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

interface ErrorBody {
  message?: string | string[];
  errors?: { field: string; message: string }[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  const text = await res.text();
  const body: unknown = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const { message, errors } = (body ?? {}) as ErrorBody;
    const details = errors?.map((e) => `${e.field || 'value'}: ${e.message}`).join(' · ');
    const main = Array.isArray(message) ? message.join(', ') : message;
    throw new ApiError([main ?? `HTTP ${res.status}`, details].filter(Boolean).join(' — '), res.status);
  }

  return body as T;
}

// Kitchen-only routes check this header against KITCHEN_API_KEY on the API.
const kitchenHeaders = () => ({ 'X-Kitchen-Key': getKitchenKey() ?? '' });

export const api = {
  getMenu: () => request<MenuItem[]>('/menu'),
  createMenuItem: (data: Omit<MenuItem, 'id'>) =>
    request<MenuItem>('/menu', { method: 'POST', body: JSON.stringify(data) }),
  updateMenuItem: (id: string, data: Partial<Omit<MenuItem, 'id'>>) =>
    request<MenuItem>(`/menu/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteMenuItem: (id: string) => request<number>(`/menu/${id}`, { method: 'DELETE' }),

  createOrder: (data: {
    customerName: string;
    idempotencyKey: string;
    items: { menuItemId: string; quantity: number }[];
  }) => request<Order>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getOrders: (statuses: OrderStatus[]) =>
    request<Order[]>(`/orders?status=${statuses.join(',')}`, { headers: kitchenHeaders() }),
  getOrder: (id: string) => request<Order>(`/orders/${id}`),
  updateOrderStatus: (id: string, status: OrderStatus) =>
    request<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
      headers: kitchenHeaders(),
    }),
};

export const formatPrice = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const STATUS_LABEL: Record<OrderStatus, string> = {
  RECEIVED: 'Recebido',
  PREPARING: 'Preparando',
  READY: 'Pronto',
};

export const errorMessage = (err: unknown) =>
  err instanceof Error ? err.message : 'Algo deu errado';
