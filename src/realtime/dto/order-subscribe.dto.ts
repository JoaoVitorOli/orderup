import { z } from 'zod';

export const orderSubscribeSchema = z.object({
  orderId: z.uuid(),
});

export type OrderSubscribeDto = z.infer<typeof orderSubscribeSchema>;