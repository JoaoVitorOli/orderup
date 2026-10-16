import { z } from 'zod';

export const getOrderStatusSchema = z.uuid();

export type GetOrderStatusDto = z.infer<typeof getOrderStatusSchema>;