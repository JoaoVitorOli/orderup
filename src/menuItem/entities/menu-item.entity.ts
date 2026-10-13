import { defineEntity, type InferEntity, p } from '@mikro-orm/core';
import { v7 } from 'uuid';

export const MenuItemSchema = defineEntity({
  name: 'MenuItem',
  properties: {
    id: p.uuid().primary().onCreate(() => v7()),
    name: p.string(),
    quantity: p.integer(),
    price: p.integer(),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p.datetime().onCreate(() => new Date())
  },
});

export type IMenuItem = InferEntity<typeof MenuItemSchema>;