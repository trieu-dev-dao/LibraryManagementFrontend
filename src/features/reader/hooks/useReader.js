import {useQuery} from '@tanstack/react-query';
import {useAuth} from '@/features/auth/hooks/useAuth';
import {ROLES} from '@/features/auth/permissions';
import {readerApi} from '../api/readerApi';

export const readerKeys = {
  loans: (id, version) => ['reader', 'loans', id, version],
  profile: (id, version) => ['reader', 'profile', id, version],
};

export function useReaderLoans() {
  const {user, sessionVersion} = useAuth();
  return useQuery({
    queryKey: readerKeys.loans(user?.userId, sessionVersion),
    queryFn: ({signal}) => readerApi.loans(signal),
    enabled: user?.role === ROLES.USER && Number.isInteger(user?.userId),
  });
}

export function useReaderProfile() {
  const {user, sessionVersion} = useAuth();
  return useQuery({
    queryKey: readerKeys.profile(user?.userId, sessionVersion),
    queryFn: ({signal}) => readerApi.profile(signal),
    enabled: user?.role === ROLES.USER && Number.isInteger(user?.userId),
  });
}
