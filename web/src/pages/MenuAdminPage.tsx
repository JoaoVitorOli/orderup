import { useEffect, useState, type FormEvent } from 'react';
import { api, errorMessage, type MenuItem } from '../api';

// The API stores prices in cents; the form uses reais ("12,50").
const toCents = (reais: string) => Math.round(Number(reais.replace(',', '.')) * 100);
const toReais = (cents: number) => (cents / 100).toFixed(2).replace('.', ',');

export function MenuAdminPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = () => api.getMenu().then(setMenu).catch((err) => setError(errorMessage(err)));

  useEffect(() => {
    void load();
  }, []);

  const run = async (action: () => Promise<unknown>) => {
    setError(null);
    try {
      await action();
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <section>
      <CreateForm onCreate={(data) => run(() => api.createMenuItem(data))} />
      {error && <p className="error">{error}</p>}
      <table className="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Preço (R$)</th>
            <th>Estoque</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {menu.map((item) => (
            <EditRow
              key={`${item.id}-${item.price}-${item.quantity}-${item.name}`}
              item={item}
              onSave={(data) => run(() => api.updateMenuItem(item.id, data))}
              onDelete={() => {
                if (confirm(`Apagar "${item.name}"?`)) void run(() => api.deleteMenuItem(item.id));
              }}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
}

function CreateForm({ onCreate }: { onCreate: (data: Omit<MenuItem, 'id'>) => Promise<void> }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await onCreate({ name, price: toCents(price), quantity: Number(quantity) });
    setName('');
    setPrice('');
    setQuantity('');
  };

  return (
    <form className="card inline-form" onSubmit={submit}>
      <strong>Novo item</strong>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" required />
      <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Preço (12,50)" required />
      <input
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        placeholder="Estoque"
        type="number"
        min={1}
        required
      />
      <button className="primary" type="submit">
        Criar
      </button>
    </form>
  );
}

function EditRow({
  item,
  onSave,
  onDelete,
}: {
  item: MenuItem;
  onSave: (data: Partial<Omit<MenuItem, 'id'>>) => Promise<void>;
  onDelete: () => void;
}) {
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(toReais(item.price));
  const [quantity, setQuantity] = useState(String(item.quantity));

  // PATCH only what changed.
  const changes: Partial<Omit<MenuItem, 'id'>> = {};
  if (name !== item.name) changes.name = name;
  if (toCents(price) !== item.price) changes.price = toCents(price);
  if (Number(quantity) !== item.quantity) changes.quantity = Number(quantity);
  const dirty = Object.keys(changes).length > 0;

  return (
    <tr>
      <td>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </td>
      <td>
        <input value={price} onChange={(e) => setPrice(e.target.value)} className="narrow" />
      </td>
      <td>
        <input
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          type="number"
          min={0}
          className="narrow"
        />
      </td>
      <td className="actions">
        <button className="primary" disabled={!dirty} onClick={() => onSave(changes)}>
          Salvar
        </button>
        <button className="danger" onClick={onDelete}>
          Apagar
        </button>
      </td>
    </tr>
  );
}
