import { useState } from 'react';
import { api, errorMessage, formatPrice, STATUS_LABEL, type Order, type OrderStatus } from '../api';
import { usePolling } from '../usePolling';

const COLUMNS: OrderStatus[] = ['RECEIVED', 'PREPARING', 'READY'];

const NEXT: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  RECEIVED: { status: 'PREPARING', label: 'Começar preparo' },
  PREPARING: { status: 'READY', label: 'Marcar como pronto' },
};

export function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    api
      .getOrders(COLUMNS)
      .then((o) => {
        setOrders(o);
        setError(null);
      })
      .catch((err) => setError(errorMessage(err)));
  };

  usePolling(load, 3000);

  const advance = async (order: Order, status: OrderStatus) => {
    try {
      await api.updateOrderStatus(order.id, status);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <section>
      <p className="small">Atualiza a cada 3 s (o WebSocket ainda não foi implementado).</p>
      {error && <p className="error">{error}</p>}
      <div className="columns">
        {COLUMNS.map((status) => {
          const column = orders.filter((o) => o.status === status);
          return (
            <div key={status} className="column">
              <h2>
                {STATUS_LABEL[status]} <span className="count">{column.length}</span>
              </h2>
              {column.map((order) => {
                const next = NEXT[order.status];
                return (
                  <article key={order.id} className="card order">
                    <div className="row">
                      <strong className="code-sm">{order.code}</strong>
                      <span className="small">
                        {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div>{order.customerName}</div>
                    <ul className="items">
                      {order.items?.map((item) => (
                        <li key={item.id}>
                          {item.quantity}× {item.menuItem.name}
                        </li>
                      ))}
                    </ul>
                    <div className="row">
                      <span className="small">{formatPrice(order.total)}</span>
                      {next && (
                        <button className="primary" onClick={() => advance(order, next.status)}>
                          {next.label}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}
