import {Fragment, useEffect} from 'react';
import {useAuthStore} from '@/features/auth/store/authStore';
import {tokenExpiry} from '@/features/auth/store/session';
import {configureSession, cancelSessionRequests} from '@/shared/api/axiosClient';
import {queryClient} from './QueryProvider';

configureSession(useAuthStore.getState, () => useAuthStore.getState().clearAuth());
const unsubscribe = useAuthStore.subscribe((next, previous) => {
  if (next.sessionVersion !== previous.sessionVersion) {
    cancelSessionRequests();
    queryClient.clear();
  }
});
if (import.meta.hot) import.meta.hot.dispose(unsubscribe);

// Orchestration only; Zustand is the sole session owner.
export function AuthProvider({children}) {
  const {accessToken, sessionVersion, clearAuth} = useAuthStore();
  useEffect(() => {
    if (!accessToken) return;
    let timer;
    const check = () => {
      const remaining = tokenExpiry(accessToken) - Date.now();
      if (remaining <= 0) clearAuth();
      else timer = setTimeout(check, Math.min(remaining, 2147483647));
    };
    check();
    return () => clearTimeout(timer);
  }, [accessToken, clearAuth]);
  // Remove private form inputs and local state as well as queries on account switch.
  return <Fragment key={sessionVersion}>{children}</Fragment>;
}
