import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {mapAuth,restoreSession} from '../src/features/auth/store/session.js';
import {loginDestination} from '../src/features/auth/navigation.js';
import {bookSchema} from '../src/features/books/schemas/bookSchema.js';
import {apiError,listData} from '../src/shared/api/errors.js';
import {countIfLoaded,borrowMonths} from '../src/features/dashboard/metrics.js';
const token='test.'+Buffer.from(JSON.stringify({exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.signature';
const fixture={token,userId:7,memberId:3,username:'reader',role:'User'};
test('camelCase login and Google contract share one mapper',()=>{assert.equal(mapAuth(fixture).user.userId,7);assert.throws(()=>mapAuth({Token:token,Role:'User'}));assert.throws(()=>mapAuth({...fixture,userId:null}));});
test('absent, corrupt, disabled and malformed storage settle signed out',()=>{for(const storage of [undefined,{getItem:()=>'{bad'},{getItem:()=>{throw Error('disabled')}},{getItem:()=>JSON.stringify({state:{isAuthenticated:true}})}])assert.equal(restoreSession(storage).isAuthenticated,false)});
test('persisted authentication flag is ignored; valid shape and expiry required',()=>{assert.equal(restoreSession({getItem:()=>JSON.stringify({state:{...mapAuth(fixture),isAuthenticated:false}})}).isAuthenticated,true);const expired='x.'+Buffer.from('{"exp":1}').toString('base64url')+'.x';assert.equal(restoreSession({getItem:()=>JSON.stringify({state:{...mapAuth(fixture),accessToken:expired}})}).isAuthenticated,false)});
test('book limits enforce numeric relations, zero year and available quantity',()=>{const base={title:'Book',authorId:'1',categoryId:'2',quantity:'0',publishedYear:'0'};assert.equal(bookSchema.parse(base).quantity,0);for(const patch of [{authorId:''},{quantity:-1},{quantity:1.2},{publishedYear:10000},{title:'x'.repeat(201)}])assert.equal(bookSchema.safeParse({...base,...patch}).success,false)});
test('errors retain field conflicts and hide server internals',()=>{assert.equal(apiError({response:{status:409}}).conflict,true);assert.match(apiError({response:{status:400,data:{errors:{Title:['required']}}}}).message,/Title/);assert.doesNotMatch(apiError({response:{status:500,data:{message:'SQL secret'}}}).message,/SQL/);assert.match(apiError({config:{url:'/auth/login'},response:{status:401}}).message,/xác thực/);assert.match(apiError({config:{url:'/members'},response:{status:401}}).message,/hết hạn/);assert.throws(()=>listData({items:[]}));assert.deepEqual(listData([]),[])});
test('Google login displays backend errors and falls back for empty responses',()=>{const config={url:'/auth/google-login'};assert.equal(apiError({config,response:{status:401,data:{message:'Google ID Token không hợp lệ.'}}}).message,'Google ID Token không hợp lệ.');assert.match(apiError({config,response:{status:401,data:''}}).message,/xác thực/);assert.equal(apiError({config,response:{status:500,data:{message:'Máy chủ chưa cấu hình Google Client ID.'}}}).message,'Máy chủ chưa cấu hình Google Client ID.');});
// Vite's module loader resolves the same aliases and JSX as the application.
// HTTP responses below use an in-memory Axios adapter; these are not live integration tests.
process.env.VITE_API_BASE_URL='http://invalid.test/api';
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
after(async()=>{await server.close()});
const load=p=>server.ssrLoadModule('/src/'+p);
test('covers match ISBN or normalized title; uncertain editions are labelled illustrations',async()=>{
 const {coverFor}=await load('features/books/components/coverSource.js');
 const book={id:10,title:'Clean Architecture',authorName:'Robert C.Martin',publishedYear:2000};
 assert.match(coverFor(book).url,/OL31838215M/);
 assert.equal(coverFor(book).illustrative,true);
 assert.match(coverFor({...book,id:99,title:'  Clean - Architecture! ',authorName:'Another Author'}).url,/OL31838215M/);
 assert.equal(coverFor({...book,title:'Other title',isbn:'978-0-13-449416-6'}).illustrative,false);
 assert.equal(coverFor({...book,publishedYear:2017,authorName:'Robert C. Martin'}).illustrative,false);
 assert.equal(coverFor({...book,title:'Unknown subject',isbn:null}),null);
});
test('return navigation accepts permitted internal paths only',async()=>{const {ROUTES,ROLE_HOME}=await load('app/router/routePaths.jsx');const go=(role,p)=>loginDestination(role,p,ROUTES,ROLE_HOME);assert.equal(go('User','/user/books/17'),'/user/books/17');for(const p of ['https://evil.test','//evil.test','/admin/books','/user/../admin/books','/user/%2fadmin'])assert.equal(go('User',p),ROUTES.USER_DASHBOARD);assert.equal(go('unknown','/user/books'),ROUTES.UNAUTHORIZED);assert.equal(go('Librarian','/admin/members'),ROUTES.ADMIN_MEMBERS)});
test('pagination clamps empty results and deletion of last row',async()=>{const {paginate}=await load('shared/hooks/useListPage.js');assert.equal(paginate([],9,10).page,1);assert.equal(paginate(Array.from({length:10}),2,10).page,1);assert.equal(paginate(Array.from({length:21}),2,20).rows.length,1)});
test('session switch clears cache, cancels requests; stale 401 cannot log out new identity',async()=>{
 const {useAuthStore:store}=await load('features/auth/store/authStore.js');
 await load('app/providers/AuthProvider.jsx');const {queryClient}=await load('app/providers/QueryProvider.jsx');const {default:client}=await load('shared/api/axiosClient.js');
 store.getState().setAuth(fixture);queryClient.setQueryData(['members',1],[{id:3}]);
 let rejectOld,oldConfig;client.defaults.adapter=config=>{oldConfig=config;return new Promise((resolve,reject)=>{rejectOld=reject})};
 const request=client.get('/members').catch(e=>e);await new Promise(resolve=>setImmediate(resolve));
 store.getState().setAuth({...fixture,userId:8,token:token+'new'});assert.equal(queryClient.getQueryData(['members',1]),undefined);assert.equal(oldConfig.signal.aborted,true);
 rejectOld({config:oldConfig,response:{status:401}});await request;assert.equal(store.getState().user.userId,8);
 client.defaults.adapter=config=>Promise.reject({config,response:{status:403}});await client.get('/members').catch(()=>{});assert.equal(store.getState().user.userId,8);
 client.defaults.adapter=config=>Promise.reject({config,response:{status:401}});await client.get('/members').catch(()=>{});assert.equal(store.getState().isAuthenticated,false);
 queryClient.clear();
});
test('successful write remains successful if background refresh fails',async()=>{
 const {QueryClient}=await import('@tanstack/react-query');const c=new QueryClient({defaultOptions:{queries:{retry:false}}});c.setQueryData(['books','list'],[]);
 const mutation=c.getMutationCache().build(c,{mutationFn:async()=>({id:1}),onSuccess:()=>{void c.invalidateQueries({queryKey:['books']});}});
 assert.deepEqual(await mutation.execute({}),{id:1});c.clear();
});
test('dashboard distinguishes zero from unavailable and groups retained records by month',()=>{
 assert.equal(countIfLoaded({data:[]},rows=>rows.length),0);
 assert.equal(countIfLoaded({data:undefined},rows=>rows.length),null);
 assert.deepEqual(borrowMonths([{borrowDate:'2026-11-01T00:00:00Z'},{borrowDate:'2026-10-31T23:00:00Z'},{borrowDate:'2026-11-15T12:00:00Z'}]),[
  {month:'2026-10',borrows:1},{month:'2026-11',borrows:2},
 ]);
});
