import { useEffect, useState } from 'react';
import { api, errorMessage, formatPrice, STATUS_LABEL, type Order, type OrderStatus } from '../api';
import { socket, WS_EVENTS } from '../socket';

const COLUMNS: OrderStatus[] = ['RECEIVED', 'PREPARING', 'READY'];

const NEXT: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  RECEIVED: { status: 'PREPARING', label: 'Começar preparo' },
  PREPARING: { status: 'READY', label: 'Marcar como pronto' },
};

export function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    const load = () => {
      api
        .getOrders(COLUMNS)
        .then((o) => {
          setOrders(o);
          setError(null);
        })
        .catch((err) => setError(errorMessage(err)));
    };

    // Replace the order if we already have it, append it otherwise. Receiving
    // the same event twice is harmless.
    const upsert = (order: Order) =>
      setOrders((prev) =>
        prev.some((o) => o.id === order.id)
          ? prev.map((o) => (o.id === order.id ? order : o))
          : [...prev, order],
      );

    // Runs on the first connection and on every reconnection. A reconnected
    // socket is in no room, so join again, and only then load the snapshot:
    // anything created in between arrives as an event, and the snapshot covers
    // whatever was missed while offline.
    const onConnect = () => {
      setConnected(true);
      socket.emit(WS_EVENTS.KITCHEN_SUBSCRIBE, () => load());
    };
    const onDisconnect = () => setConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on(WS_EVENTS.ORDER_CREATED, upsert);
    socket.on(WS_EVENTS.ORDER_STATUS_UPDATED, upsert);
    socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off(WS_EVENTS.ORDER_CREATED, upsert);
      socket.off(WS_EVENTS.ORDER_STATUS_UPDATED, upsert);
      socket.disconnect();
    };
  }, []);

  // No reload after the PATCH: the API emits order:status_updated and the
  // listener above moves the card.
  const advance = async (order: Order, status: OrderStatus) => {
    try {
      await api.updateOrderStatus(order.id, status);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <section>
      <p className="small">{connected ? 'Ao vivo' : 'Reconectando…'}</p>
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
