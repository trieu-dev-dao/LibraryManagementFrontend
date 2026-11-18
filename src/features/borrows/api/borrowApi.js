import client from '@/shared/api/axiosClient';
import {parseResponse} from '@/shared/api/response';
import {responseSchema, listSchema} from './responseSchema';

export const borrowApi = {
  getAll: async (signal, status) => parseResponse(listSchema, (await client.get('/borrow-records', {signal, params: status ? {status} : undefined})).data),
  getById: async (id, signal) => parseResponse(responseSchema, (await client.get('/borrow-records/' + id, {signal})).data),
  borrow: async data => (await client.post('/borrow-records/borrow', data)).data,
  returnBook: async id => parseResponse(responseSchema, (await client.post('/borrow-records/' + id + '/return')).data),
  update: async ({id, data}) => (await client.put('/borrow-records/' + id, data)).data,
  delete: async id => (await client.delete('/borrow-records/' + id)).data,
};
