import {createServer} from 'vite';
// Never use the developer's API address or Google configuration in browser tests.
process.env.VITE_API_BASE_URL = 'http://127.0.0.1:4179/test-api';
process.env.VITE_GOOGLE_CLIENT_ID = process.env.TEST_GOOGLE_CLIENT_ID ? 'test-client-id' : '';
const server = await createServer({server: {port: 4179, host: '127.0.0.1', strictPort: true}});
await server.listen();
