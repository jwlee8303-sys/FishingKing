import { createServer } from 'vite'
import { fileURLToPath } from 'node:url'
// A test run owns a fixed source version. Documentation/tool writes must not
// reload an open dialog mid-click; the normal npm run dev server keeps HMR.
export async function startTestServer(port=4173) {
  const server=await createServer({ server: { host: '127.0.0.1',port,strictPort: true,watch: null,hmr: false } })
  await server.listen(); return server
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
  const server=await startTestServer()
  const stop=async () => { await server.close(); process.exit(0) }
  process.once('SIGINT',stop); process.once('SIGTERM',stop)
}
