import {z} from 'zod';
export const responseSchema = z.object({id: z.number().int().positive(), title: z.string(), authorId: z.number().int().positive(), authorName: z.string().nullable(), categoryId: z.number().int().positive(), categoryName: z.string().nullable(), quantity: z.number().int().nonnegative(), publishedYear: z.number().int().min(0).max(9999)});
export const listSchema = z.array(responseSchema);
