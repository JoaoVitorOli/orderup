import { useEffect, useRef, useState } from 'react';
import { api, errorMessage, formatPrice, STATUS_LABEL, type MenuItem, type Order } from '../api';
import { usePolling } from '../usePolling';

const ORDER_KEY = 'orderup:currentOrderId';

function readSavedOrderId() {
  try {
    return localStorage.getItem(ORDER_KEY);
  } catch {
    return null;
  }
}

function saveOrderId(id: string | null) {
  try {
    if (id) localStorage.setItem(ORDER_KEY, id);
    else localStorage.removeItem(ORDER_KEY);
  } catch {
    // storage unavailable: the order just won't survive a reload
  }
}

export function CustomerPage() {
  const [orderId, setOrderId] = useState<string | null>(readSavedOrderId);

  const track = (id: string | null) => {
    saveOrderId(id);
    setOrderId(id);
  };

  return orderId ? (
    <OrderTracker orderId={orderId} onDone={() => track(null)} />
  ) : (
    <OrderForm onPlaced={(order) => track(order.id)} />
  );
}

function OrderForm({ onPlaced }: { onPlaced: (order: Order) => void }) {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  // One key per order attempt: clicking twice (or retrying after a network
  // error) sends the same key, so the API returns the same order.
  const idempotencyKey = useRef(crypto.randomUUID());

  useEffect(() => {
    api.getMenu().then(setMenu).catch((err) => setError(errorMessage(err)));
  }, []);

  const change = (item: MenuItem, delta: number) => {
    setCart((prev) => {
      const next = Math.min(item.quantity, Math.max(0, (prev[item.id] ?? 0) + delta));
      const { [item.id]: _, ...rest } = prev;
      return next > 0 ? { ...rest, [item.id]: next } : rest;
    });
  };

  const items = Object.entries(cart).map(([menuItemId, quantity]) => ({ menuItemId, quantity }));
  const total = items.reduce(
    (sum, { menuItemId, quantity }) =>
      sum + (menu.find((m) => m.id === menuItemId)?.price ?? 0) * quantity,
    0,
  );

  const placeOrder = async () => {
    setSending(true);
    setError(null);
    try {
      const order = await api.createOrder({
        customerName: name.trim(),
        idempotencyKey: idempotencyKey.current,
        items,
      });
      onPlaced(order);
    } catch (err) {
      setError(errorMessage(err));
      api.getMenu().then(setMenu).catch(() => {});
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="grid-2">
      <div>
        <h2>Cardápio</h2>
        <ul className="list">
          {menu.map((item) => {
            const inCart = cart[item.id] ?? 0;
            const soldOut = item.quantity === 0;
            return (
              <li key={item.id} className={soldOut ? 'row muted' : 'row'}>
                <div>
                  <strong>{item.name}</strong>
                  <div className="small">
                    {formatPrice(item.price)} · {soldOut ? 'esgotado' : `${item.quantity} ${item.quantity === 1 ? 'disponível' : 'disponíveis'}`}
                  </div>
                </div>
                <div className="stepper">
                  <button onClick={() => change(item, -1)} disabled={inCart === 0}>
                    −
                  </button>
                  <span>{inCart}</span>
                  <button onClick={() => change(item, 1)} disabled={soldOut || inCart >= item.quantity}>
                    +
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="card">
        <h2>Seu pedido</h2>
        {items.length === 0 ? (
          <p className="small">Escolha itens no cardápio.</p>
        ) : (
          <ul className="list compact">
            {items.map(({ menuItemId, quantity }) => {
              const item = menu.find((m) => m.id === menuItemId);
              return (
                <li key={menuItemId} className="row">
                  <span>
                    {quantity}× {item?.name}
                  </span>
                  <span>{formatPrice((item?.price ?? 0) * quantity)}</span>
                </li>
              );
            })}
          </ul>
        )}
        <p className="total">Total: {formatPrice(total)}</p>
        <label className="field">
          Seu nome
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ana" />
        </label>
        <button
          className="primary"
          onClick={placeOrder}
          disabled={sending || items.length === 0 || !name.trim()}
        >
          {sending ? 'Enviando…' : 'Fazer pedido'}
        </button>
        {error && <p className="error">{error}</p>}
      </div>
    </section>
  );
}

function OrderTracker({ orderId, onDone }: { orderId: string; onDone: () => void }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  usePolling(
    () => {
      api
        .getOrder(orderId)
        .then((o) => {
          setOrder(o);
          setError(null);
        })
        .catch((err) => setError(errorMessage(err)));
    },
    3000,
    order?.status !== 'READY',
  );

  const steps = ['RECEIVED', 'PREPARING', 'READY'] as const;
  const current = order ? steps.indexOf(order.status) : -1;

  return (
    <section className="card tracker">
      <h2>Acompanhe seu pedido</h2>
      {order && (
        <>
          <p className="code">{order.code}</p>
          <p className="small">
            {order.customerName} · {formatPrice(order.total)}
          </p>
          <ol className="steps">
            {steps.map((s, i) => (
              <li key={s} className={i <= current ? 'done' : ''}>
                {STATUS_LABEL[s]}
              </li>
            ))}
          </ol>
          {order.status === 'READY' && <p className="ready">Seu pedido está pronto! Pode retirar no balcão.</p>}
          <p className="small">Atualiza a cada 3 s (o WebSocket ainda não foi implementado).</p>
        </>
      )}
      {error && <p className="error">{error}</p>}
      <button onClick={onDone}>{order?.status === 'READY' ? 'Fazer outro pedido' : 'Voltar ao cardápio'}</button>
    </section>
  );
}
