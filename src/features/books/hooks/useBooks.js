import {useQuery,useMutation,useQueryClient} from '@tanstack/react-query';
import {useState} from 'react';
import {bookApi} from '../api/bookApi';
import {useAuth} from '@/features/auth/hooks/useAuth';
import {requireStaff} from '@/features/auth/permissions';
import {apiError} from '@/shared/api/errors';
export const bookKeys={list:['books','list'],detail:id=>['books','detail',String(id)]};
export function useBookList(){
 return useQuery({queryKey:bookKeys.list,queryFn:({signal})=>bookApi.getAll(signal)});
}
export function useBookDetail(id){
 return useQuery({queryKey:bookKeys.detail(id),queryFn:({signal})=>bookApi.getById(id,signal),enabled:/^[1-9][0-9]*$/.test(String(id))&&Number(id)<=2147483647});
}
export function useBooks(){
 const {user}=useAuth();const client=useQueryClient();const [actionError,setError]=useState('');
 const query=useBookList();
 const mutation=useMutation({mutationFn:async({method,id,data})=>{requireStaff(user?.role);return method==='create'?bookApi.create(data):method==='delete'?bookApi.delete(id):bookApi.update(id,data)}});
 const refreshList=async()=>{
  try { await query.refetch({throwOnError:true}); return null; }
  catch (error) { return error; }
 };
 const writeBook=async(method,id,data)=>{
  const result=await mutation.mutateAsync({method,id,data});
  const affectedId=method==='create'?result?.id:id;
  client.setQueryData(bookKeys.list,current=>{
   if (!Array.isArray(current)) return current;
   if (method==='delete') return current.filter(book=>book.id!==id);
   if (method==='create') return [...current,result];
   return current.map(book=>book.id===id?result:book);
  });
  await client.invalidateQueries({queryKey:bookKeys.list,refetchType:'none'});
  if (affectedId != null) await client.invalidateQueries({queryKey:bookKeys.detail(affectedId)});
  void client.invalidateQueries({queryKey:['borrows']});
  return {result,refreshError:await refreshList()};
 };
 return {...query,books:query.data??[],loading:query.isPending,error:actionError||(!query.data&&query.error?apiError(query.error).message:''),setError,fetchBooks:refreshList,
 createBook:data=>writeBook('create',null,data),updateBook:(id,data)=>writeBook('update',id,data),deleteBook:id=>writeBook('delete',id),pending:mutation.isPending};
}
export default useBooks;
