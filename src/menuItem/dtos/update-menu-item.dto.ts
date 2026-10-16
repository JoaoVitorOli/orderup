import { z } from 'zod';
import { createMenuItemSchema } from './create-menu-item.dto.js';

export const updateMenuItemSchema = createMenuItemSchema
  .extend({ quantity: z.int().min(0) })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type UpdateMenuItemDto = z.infer<typeof updateMenuItemSchema>;
