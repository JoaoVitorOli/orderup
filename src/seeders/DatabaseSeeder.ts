import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { MenuItemSchema } from '../menuItem/entities/menu-item.entity.js';

// Prices are in cents (2000 = R$ 20,00).
const menuItems = [
  { name: 'X-Burger', quantity: 10, price: 2000 },
  { name: 'X-Salada', quantity: 10, price: 2200 },
  { name: 'X-Bacon', quantity: 8, price: 2600 },
  { name: 'X-Tudo', quantity: 5, price: 3200 },
  { name: 'Veggie Burger', quantity: 6, price: 2400 },
  { name: 'Batata Frita', quantity: 15, price: 1200 },
  { name: 'Onion Rings', quantity: 1, price: 1400 },
  { name: 'Refrigerante Lata', quantity: 30, price: 600 },
  { name: 'Suco Natural', quantity: 12, price: 900 },
  { name: 'Milkshake', quantity: 0, price: 1600 },
];

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const existing = await em.find(MenuItemSchema, {
      name: { $in: menuItems.map((item) => item.name) },
    });
    const existingNames = new Set(existing.map((item) => item.name));

    for (const item of menuItems) {
      if (!existingNames.has(item.name)) {
        em.create(MenuItemSchema, item);
      }
    }
  }
}
