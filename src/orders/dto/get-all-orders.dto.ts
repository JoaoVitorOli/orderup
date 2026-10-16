import { z, ZodPreprocess } from 'zod';

const Status = z.enum(['RECEIVED', 'PREPARING', 'READY'])

export const getAllOrderSchema = z.object({
  status: z.preprocess((val) => {
    if (typeof val === 'string') return val.split(',');

    return val;
  }, z.array(Status)).optional()
});

export type GetAllOrderDto = z.infer<typeof getAllOrderSchema>;