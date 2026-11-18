import {z} from 'zod';
export const responseSchema = z.object({id: z.number().int().positive(), fullName: z.string(), email: z.string(), phone: z.string().nullable()});
export const listSchema = z.array(responseSchema);
