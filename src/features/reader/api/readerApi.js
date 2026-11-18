import {z} from 'zod';
import client from '@/shared/api/axiosClient';
import {parseResponse} from '@/shared/api/response';

const loan = z.object({
  id: z.number().int().positive(), bookTitle: z.string(), quantity: z.number().int().positive(),
  borrowDate: z.iso.datetime({offset: true}), dueDate: z.iso.date(),
  returnDate: z.iso.datetime({offset: true}).nullable(),
  status: z.enum(['Đang mượn', 'Đã trả', 'Quá hạn']), isCompleted: z.boolean(),
});
const loans = z.object({activeLoanCount: z.number().int().nonnegative(), loans: z.array(loan)});
const profile = z.object({
  userId: z.number().int().positive(), memberId: z.number().int().positive().nullable(),
  username: z.string(), email: z.string(), fullName: z.string(), phone: z.string().nullable(),
});

export const readerApi = {
  loans: async signal => parseResponse(loans, (await client.get('/reader/loans', {signal})).data),
  profile: async signal => parseResponse(profile, (await client.get('/reader/profile', {signal})).data),
  updateProfile: async data => parseResponse(profile, (await client.put('/reader/profile', data)).data),
};
