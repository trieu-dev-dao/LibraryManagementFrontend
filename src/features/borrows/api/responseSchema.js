import {z} from 'zod';
export const responseSchema = z.object({id: z.number().int().positive(), bookId: z.number().int().positive(), memberId: z.number().int().positive(), bookTitle: z.string().nullable(), memberFullName: z.string().nullable(), borrowDate: z.string(), expiredDate: z.string(), returnDate: z.string().nullable(), status: z.enum(['Đang mượn', 'Quá hạn', 'Đã trả'])});
export const listSchema = z.array(responseSchema);
