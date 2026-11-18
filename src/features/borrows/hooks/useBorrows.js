import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useAuth} from '@/features/auth/hooks/useAuth';
import {requireStaff, canManageLibrary} from '@/features/auth/permissions';
import {borrowApi} from '../api/borrowApi';

export function borrowMutationOptions(client, role) {
  const refresh = () => Promise.all([
    client.invalidateQueries({queryKey: ['borrows']}),
    client.invalidateQueries({queryKey: ['books']}),
  ]);
  return {
    mutationFn: ({action, data}) => {
      requireStaff(role);
      if (!['borrow', 'returnBook', 'update', 'delete'].includes(action)) throw new Error('Thao tác không được hỗ trợ.');
      return borrowApi[action](data);
    },
    onSuccess: async (result, {action}) => {
      if (action === 'returnBook') {
        for (const query of client.getQueryCache().findAll({queryKey: ['borrows']})) {
          const key = query.queryKey;
          if (key[1] === 'detail' && String(key.at(-1)) === String(result.id)) {
            client.setQueryData(key, result);
          } else if (key[1] === 'staff') {
            const filter = key.at(-1);
            client.setQueryData(key, records => Array.isArray(records)
              ? records.filter(record => record.id !== result.id || filter === 'all' || filter === result.status)
                .map(record => record.id === result.id ? result : record)
              : records);
          }
        }
      }
      await refresh();
    },
    onError: error => {
      if ([400, 404, 409].includes(error.response?.status)) refresh();
    },
  };
}

export function useBorrows(status = '') {
  const {user, sessionVersion} = useAuth(), client = useQueryClient();
  const allowed = canManageLibrary(user?.role);
  const query = useQuery({
    queryKey: ['borrows', 'staff', user?.userId, sessionVersion, status || 'all'],
    queryFn: ({signal}) => borrowApi.getAll(signal, status), enabled: allowed && Number.isInteger(user?.userId),
    refetchInterval: 60_000,
  });
  const mutation = useMutation(borrowMutationOptions(client, user?.role));
  return {...query, allowed, records: query.data ?? [], pending: mutation.isPending,
    act: (action, data) => mutation.mutateAsync({action, data})};
}
