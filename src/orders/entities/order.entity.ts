import { defineEntity, type InferEntity, p } from '@mikro-orm/core';
import { generateOrderCode } from '../../shared/helpers/generate-order-id.js';
import { v7 } from 'uuid';
import { OrderItemSchema } from './order-item.entity.js';

export const OrderSchema = defineEntity({
  name: 'Order',
  properties: {
    id:   p.uuid().primary().onCreate(() => v7()),
    code: p.string().length(6).unique().onCreate(() => generateOrderCode()),
    customerName: p.string(),
    status: p.enum(['RECEIVED', 'PREPARING', 'READY']).default('RECEIVED'),
    total: p.integer(),
    idempotencyKey: p.uuid().unique(),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
    items: () => p.oneToMany(OrderItemSchema).mappedBy('order'),
  },
});

export type IOrder = InferEntity<typeof OrderSchema>;