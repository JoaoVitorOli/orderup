import { z } from 'zod';

export const updateOrderStatusSchema = z.object({
  status: z.enum(['RECEIVED', 'PREPARING', 'READY']),
});

export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;
