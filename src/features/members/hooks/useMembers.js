import {useQuery,useMutation,useQueryClient} from '@tanstack/react-query';
import {useState} from 'react';
import {memberApi} from '../api/memberApi';
import {useAuth} from '@/features/auth/hooks/useAuth';
import {requireStaff,canManageLibrary} from '@/features/auth/permissions';
import {apiError} from '@/shared/api/errors';
export function useMembers(){
 const {user,sessionVersion}=useAuth();const client=useQueryClient();const [actionError,setError]=useState('');
 const query=useQuery({queryKey:['members','staff',user?.userId,sessionVersion],queryFn:({signal})=>memberApi.getAll(signal),enabled:canManageLibrary(user?.role)&&Number.isInteger(user?.userId)});
 const mutation=useMutation({mutationFn:async({method,id,data})=>{requireStaff(user?.role);return method==='delete'?memberApi.delete(id):memberApi.update(id,data)},onSuccess:()=>{void client.invalidateQueries({queryKey:['members']});void client.invalidateQueries({queryKey:['borrows']});}});
 return {...query,members:query.data??[],loading:query.isPending,error:actionError||(query.error?apiError(query.error).message:''),setError,fetchMembers:()=>query.refetch(),
updateMember:(id,data)=>mutation.mutateAsync({method:'update',id,data}),deleteMember:id=>mutation.mutateAsync({method:'delete',id}),pending:mutation.isPending};
}
export default useMembers;
