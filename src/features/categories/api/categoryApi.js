import client from '@/shared/api/axiosClient';
import {parseResponse} from '@/shared/api/response';
import {responseSchema,listSchema} from './responseSchema';
export const categoryApi={
 getAll:async(signal)=>parseResponse(listSchema,(await client.get('/categories',{signal})).data),
 getById:async(id,signal)=>parseResponse(responseSchema,(await client.get('/categories/'+id,{signal})).data),
 create:async(data)=>(await client.post('/categories',data)).data,
 update:async(id,data)=>(await client.put('/categories/'+id,data)).data,
 delete:async(id)=>(await client.delete('/categories/'+id)).data,
};