import { z } from 'zod';

export const getMenuItemSchema = z.uuid();

export type GetMenuItemDto = z.infer<typeof getMenuItemSchema>;