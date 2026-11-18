import {z} from 'zod';
const integer = (min, max) => z.preprocess(
  value => value === '' || value == null ? NaN : Number(value),
  z.number({error: 'Vui lòng nhập số hợp lệ.'}).int('Phải là số nguyên.')
    .min(min, 'Giá trị tối thiểu: ' + min).max(max, 'Giá trị tối đa: ' + max),
);
export const bookSchema = z.object({
  title: z.string().trim().min(1, 'Vui lòng nhập tên sách.').max(200, 'Tối đa 200 ký tự.'),
  authorId: integer(1, 2147483647), categoryId: integer(1, 2147483647),
  quantity: integer(0, 2147483647), publishedYear: integer(0, 9999),
});
