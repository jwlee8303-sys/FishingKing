import { spawnSync } from 'node:child_process'

if (!process.env.npm_execpath) {
  console.error('npm.cmd run check로 실행하세요.')
  process.exit(1)
}

for (const script of ['typecheck', 'lint', 'test', 'build']) {
  const result = spawnSync(process.execPath, [process.env.npm_execpath, 'run', script], {
    stdio: 'inherit',
  })
  if (result.error) console.error(result.error.message)
  if (result.status !== 0) process.exit(result.status ?? 1)
}
