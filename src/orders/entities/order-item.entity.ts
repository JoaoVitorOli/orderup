import { defineEntity, type InferEntity, p } from '@mikro-orm/core';
import { v7 } from 'uuid';
import { MenuItemSchema } from '../../menuItem/entities/menu-item.entity.js';
import { OrderSchema } from './order.entity.js';

export const OrderItemSchema = defineEntity({
  name: 'OrderItem',
  properties: {
    id: p.uuid().primary().onCreate(() => v7()),
    order: () => p.manyToOne(OrderSchema),
    menuItem: () => p.manyToOne(MenuItemSchema),
    quantity: p.integer(),
    unitPrice: p.integer(),
    createdAt: p.datetime().onCreate(() => new Date()),
  },
});

export type IOrderItem = InferEntity<typeof OrderItemSchema>;
