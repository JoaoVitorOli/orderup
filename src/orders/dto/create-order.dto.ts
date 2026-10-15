import { z } from 'zod';

export const createOrderSchema = z.object({
  customerName: z.string(),
  idempotencyKey: z.uuid(),
  items: z
    .array(
      z.object({
        menuItemId: z.uuid(),
        quantity: z.int().positive(),
      }),
    ).min(1),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;