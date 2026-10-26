import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { checkAssets, projectRoot } from './lib.mjs'
import { assetManifest } from '../../src/assets/manifest.ts'
import { validateAssetManifest } from '../../src/assets/validation.ts'
import { checkManifestFiles } from './manifest-check.mjs'

const report = await checkAssets()
try {
  validateAssetManifest(assetManifest)
  report.manifest = checkManifestFiles(assetManifest, report)
} catch (error) {
  report.manifest = { registeredFiles: 0, errors: [{ code: error.code, error: error.message }] }
}
report.errors = report.errors.map(error => ({ severity: 'ERROR',...error }))
report.manifest.errors = report.manifest.errors.map(error => ({ severity: 'ERROR',...error }))
report.warnings = report.warnings.map(warning => ({ severity: 'WARNING',...warning }))
report.summary = { errors: report.errors.length+report.manifest.errors.length,warnings: report.warnings.length }
await mkdir(path.join(projectRoot, '.local'), { recursive: true })
await writeFile(path.join(projectRoot, '.local/graphics-report.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
if (report.errors.length || report.manifest.errors.length) process.exitCode = 1
