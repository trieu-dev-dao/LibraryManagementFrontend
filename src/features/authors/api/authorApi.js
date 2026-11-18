import client from '@/shared/api/axiosClient';
import {parseResponse} from '@/shared/api/response';
import {responseSchema,listSchema} from './responseSchema';
export const authorApi={
 getAll:async(signal)=>parseResponse(listSchema,(await client.get('/authors',{signal})).data),
 getById:async(id,signal)=>parseResponse(responseSchema,(await client.get('/authors/'+id,{signal})).data),
 create:async(data)=>(await client.post('/authors',data)).data,
 update:async(id,data)=>(await client.put('/authors/'+id,data)).data,
 delete:async(id)=>(await client.delete('/authors/'+id)).data,
};