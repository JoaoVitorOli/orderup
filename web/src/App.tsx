import { useState } from 'react';
import { CustomerPage } from './pages/CustomerPage';
import { KitchenPage } from './pages/KitchenPage';
import { MenuAdminPage } from './pages/MenuAdminPage';

const TABS = [
  { id: 'customer', label: 'Cliente', Page: CustomerPage },
  { id: 'kitchen', label: 'Cozinha', Page: KitchenPage },
  { id: 'menu', label: 'Cardápio (admin)', Page: MenuAdminPage },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function App() {
  const [tab, setTab] = useState<TabId>('customer');
  const { Page } = TABS.find((t) => t.id === tab)!;

  return (
    <div className="app">
      <header className="header">
        <h1>OrderUp</h1>
        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={t.id === tab ? 'tab active' : 'tab'}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main>
        <Page />
      </main>
    </div>
  );
}
