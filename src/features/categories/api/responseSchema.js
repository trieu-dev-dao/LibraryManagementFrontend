import {z} from 'zod';
export const responseSchema = z.object({id: z.number().int().positive(), name: z.string()});
export const listSchema = z.array(responseSchema);
