import { z } from 'zod';

export const createMenuItemSchema = z.object({
  name: z.string().trim().min(1).max(100),
  quantity: z.int().min(1),
  price: z.int().min(1),
});

export type CreateMenuItemDto = z.infer<typeof createMenuItemSchema>;