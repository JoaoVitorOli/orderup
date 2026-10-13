export class Order {}
import { defineEntity, type InferEntity, p } from '@mikro-orm/core';
import { generateOrderCode } from '../../shared/helpers/generate-order-id.js';
import { v7 } from 'uuid';

export const OrderSchema = defineEntity({
  name: 'Order',
  properties: {
    id:   p.uuid().primary().onCreate(() => v7()),
    code: p.string().length(6).unique().onCreate(() => generateOrderCode()),
    name: p.string(),
    createdBy: p.string(),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p.datetime().onCreate(() => new Date())
  },
});

export type IOrder = InferEntity<typeof OrderSchema>;