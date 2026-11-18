import {create} from 'zustand';
import {emptySession,mapAuth,restoreSession} from './session.js';
let storage;try{storage=globalThis.localStorage}catch{/* Memory-only session */}
export const useAuthStore=create(set=>({
 ...restoreSession(storage),isHydrated:true,sessionVersion:0,
 setAuth:data=>{const next=mapAuth(data);set(s=>({...next,sessionVersion:s.sessionVersion+1}));return next.user;},
 clearAuth:()=>set(s=>({...emptySession,sessionVersion:s.sessionVersion+1})),
 updateUser:data=>set(s=>({user:{...s.user,...data}})),
}));
useAuthStore.subscribe(s=>{try{storage?.setItem('library-auth',JSON.stringify({state:{accessToken:s.accessToken,user:s.user},version:0}))}catch{/* Storage can be disabled */}});
