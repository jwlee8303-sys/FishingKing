import { spawn } from 'node:child_process'
import path from 'node:path'
import { startTestServer } from './dev-server.mjs'
import { projectRoot } from '../graphics/lib.mjs'
// Own the temporary Vite server in this process. This avoids Windows shell-tree
// teardown delays while leaving the user's existing development server alone.
const server=process.env.PLAYWRIGHT_BASE_URL ? undefined : await startTestServer(0)
const baseURL=process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${server.httpServer.address().port}`
try {
  const child=spawn(process.execPath,[path.join(projectRoot,'node_modules/@playwright/test/cli.js'),'test',...process.argv.slice(2)],{ cwd: projectRoot,stdio: 'inherit',env: { ...process.env,PLAYWRIGHT_BASE_URL: baseURL } })
  process.exitCode=await new Promise((resolve,reject) => { child.once('error',reject); child.once('exit',code => resolve(code ?? 1)) })
} finally { await server?.close() }
