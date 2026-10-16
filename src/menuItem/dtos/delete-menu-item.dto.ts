import { z } from 'zod';

export const deleteMenuItemSchema = z.uuid();

export type DeleteMenuItemDto = z.infer<typeof deleteMenuItemSchema>;