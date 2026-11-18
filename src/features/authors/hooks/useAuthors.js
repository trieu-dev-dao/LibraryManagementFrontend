import {useQuery,useMutation,useQueryClient} from '@tanstack/react-query';
import {useState} from 'react';
import {authorApi} from '../api/authorApi';
import {useAuth} from '@/features/auth/hooks/useAuth';
import {requireStaff} from '@/features/auth/permissions';
import {apiError} from '@/shared/api/errors';
export function useAuthors(){
 const {user}=useAuth();const client=useQueryClient();const [actionError,setError]=useState('');
 const query=useQuery({queryKey:['authors','list'],queryFn:({signal})=>authorApi.getAll(signal)});
 const mutation=useMutation({mutationFn:async({method,id,data})=>{requireStaff(user?.role);return method==='create'?authorApi.create(data):method==='delete'?authorApi.delete(id):authorApi.update(id,data)},onSuccess:()=>{void client.invalidateQueries({queryKey:['authors']});void client.invalidateQueries({queryKey:['books']});}});
 return {...query,authors:query.data??[],loading:query.isPending,error:actionError||(query.error?apiError(query.error).message:''),setError,fetchAuthors:()=>query.refetch(),
 createAuthor:data=>mutation.mutateAsync({method:'create',data}),updateAuthor:(id,data)=>mutation.mutateAsync({method:'update',id,data}),deleteAuthor:id=>mutation.mutateAsync({method:'delete',id}),pending:mutation.isPending};
}
export default useAuthors;