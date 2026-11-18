import { useAuthStore } from '../store/authStore';
export function useAuth(){const s=useAuthStore();return {...s,login:s.setAuth,logout:s.clearAuth};}
export default useAuth;
