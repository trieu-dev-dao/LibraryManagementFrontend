import client from '@/shared/api/axiosClient';
import {parseResponse} from '@/shared/api/response';
import {responseSchema,listSchema} from './responseSchema';
export const bookApi={
 getAll:async(signal)=>parseResponse(listSchema,(await client.get('/books',{signal})).data),
 getById:async(id,signal)=>parseResponse(responseSchema,(await client.get('/books/'+id,{signal})).data),
 create:async(data)=>(await client.post('/books',data)).data,
 update:async(id,data)=>(await client.put('/books/'+id,data)).data,
 delete:async(id)=>{await client.delete('/books/'+id);},
};
