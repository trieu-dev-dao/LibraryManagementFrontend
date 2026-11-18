import client from '@/shared/api/axiosClient';
import {parseResponse} from '@/shared/api/response';
import {responseSchema,listSchema} from './responseSchema';
export const memberApi={
 getAll:async(signal)=>parseResponse(listSchema,(await client.get('/members',{signal})).data),
 getById:async(id,signal)=>parseResponse(responseSchema,(await client.get('/members/'+id,{signal})).data),
 
 update:async(id,data)=>(await client.put('/members/'+id,data)).data,
 delete:async(id)=>(await client.delete('/members/'+id)).data,
};