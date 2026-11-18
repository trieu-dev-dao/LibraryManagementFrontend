import {z} from 'zod';
export const responseSchema = z.object({id: z.number().int().positive(), name: z.string(), bio: z.string().nullable()});
export const listSchema = z.array(responseSchema);
