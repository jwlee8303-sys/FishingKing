import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'
import { access, mkdir, readFile, writeFile, copyFile, stat } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { projectRoot, checkAssets, inspectSvg, decodeImage, hash } from '../../scripts/graphics/lib.mjs'
import { convertImage } from '../../scripts/graphics/build.mjs'
import { assetManifest } from '../../src/assets/manifest.ts'
import { checkManifestFiles } from '../../scripts/graphics/manifest-check.mjs'

const root = path.join(projectRoot, '.local', `graphics-tests-${randomUUID()}`)
await mkdir(root, { recursive: true })

test('required graphics exist, decode, stay in budget, and preserve fish alpha', async () => {
  for (const file of ['fish/bass-main.webp', 'backgrounds/lake-day.webp', 'backgrounds/lake-day-mobile.webp', 'icons/fishing-rod.svg', 'icons/reel.svg', 'icons/hook.svg', 'placeholders/image-missing.svg']) await access(path.join(projectRoot, 'public/assets', file))
  const report = await checkAssets()
  assert.deepEqual(report.errors, [])
  assert.equal(report.entries.length, 7)
  const fish = report.entries.find(e => e.path === 'fish/bass-main.webp')
  assert.ok(fish.alpha.transparent > 0 && fish.alpha.opaque > 0 && fish.alpha.partial > 0)
})

test('SVG parser rejects malformed XML, entities, active content and references', () => {
  const svg = body => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${body}</svg>`
  assert.deepEqual(inspectSvg(svg('<path d="M1 1h2"/>')), { width: 24, height: 24 })
  for (const invalid of [svg('<script/>'), svg('<image href="https://example.invalid/image.png"/>'), svg('<path onload="alert(1)"/>'), svg('<path style="fill:url(https://example.invalid)"/>'), svg('<path fill="url(https://example.invalid)"/>'), svg('<path></g>'), '<!DOCTYPE svg [<!ENTITY x "bad">]>' + svg(''), svg('<foreignObject/>')]) assert.throws(() => inspectSvg(invalid))
  assert.throws(() => inspectSvg(svg('<path fill="u\\72l(other.svg)"/>')))
})

test('corrupt WebP and extension spoofing are rejected', async () => {
  const corrupt = path.join(root, 'corrupt.webp')
  await writeFile(corrupt, Buffer.from('RIFF0000WEBPbroken'))
  await assert.rejects(decodeImage(corrupt))
  const spoof = path.join(root, 'spoof.webp')
  await sharp({ create: { width: 8, height: 8, channels: 3, background: '#12344D' } }).png().toFile(spoof)
  await assert.rejects(decodeImage(spoof), /actual image format/)
})

test('conversion is incremental and refuses overwrite or escaping paths', async () => {
  const sourceRoot = path.join(root, 'source'), outputRoot = path.join(root, 'output')
  await mkdir(sourceRoot, { recursive: true })
  const source = path.join(sourceRoot, 'fish.png'), output = path.join(outputRoot, 'fish.webp')
  await copyFile(path.join(projectRoot, 'graphics/source/bass-main.png'), source)
  const before = hash(await readFile(source))
  const recipe = { source, output, width: 128, height: 128, fit: 'inside', quality: 80, requireAlpha: true }
  const options = { sourceRoot, outputRoot, cache: {} }
  assert.equal((await convertImage(recipe, options)).status, 'converted')
  const firstMtime = (await stat(output)).mtimeMs
  assert.equal((await convertImage(recipe, options)).status, 'skipped')
  assert.equal((await stat(output)).mtimeMs, firstMtime)
  assert.equal(hash(await readFile(source)), before)
  await writeFile(output, 'unmanaged file')
  await assert.rejects(convertImage(recipe, options), /already exists/)
  assert.equal(await readFile(output, 'utf8'), 'unmanaged file')
  await assert.rejects(convertImage({ ...recipe, output: source }, options), /allowed root/)
  await assert.rejects(convertImage({ ...recipe, output: path.join(projectRoot, 'outside.webp') }, options), /allowed root/)
})

test('scanner reports duplicate bytes, bad filenames and opaque fish', async () => {
  const assetRoot = path.join(root, 'invalid-assets')
  await mkdir(path.join(assetRoot, 'icons'), { recursive: true })
  await mkdir(path.join(assetRoot, 'fish'), { recursive: true })
  const icon = await readFile(path.join(projectRoot, 'public/assets/icons/reel.svg'))
  await writeFile(path.join(assetRoot, 'icons/one.svg'), icon)
  await writeFile(path.join(assetRoot, 'icons/two.svg'), icon)
  await writeFile(path.join(assetRoot, 'icons/Bad_Name.svg'), icon)
  await sharp({ create: { width: 16, height: 16, channels: 3, background: '#12344D' } }).webp().toFile(path.join(assetRoot, 'fish/opaque.webp'))
  const report = await checkAssets(assetRoot)
  assert.ok(report.errors.some(e => e.error.includes('Duplicate SHA-256')))
  assert.ok(report.errors.some(e => e.error.includes('filename')))
  assert.ok(report.errors.some(e => e.error.includes('transparent and opaque')))
})

test('manifest registers seven inspected files and catches missing or changed metadata', async () => {
  const inspection = await checkAssets()
  assert.deepEqual(checkManifestFiles(assetManifest, inspection), { registeredFiles: 7, errors: [] })
  for (const [field, value] of [['width', 1], ['height', 1], ['bytes', 1], ['sha256', 'different']]) {
    const changed = { ...inspection, entries: inspection.entries.map((entry, i) => i === 0 ? { ...entry, [field]: value } : entry) }
    assert.ok(checkManifestFiles(assetManifest, changed).errors.some(error => error.error.includes('metadata mismatch')))
  }
  const missing = { ...inspection, entries: inspection.entries.filter(entry => entry.path !== 'backgrounds/lake-day-mobile.webp') }
  assert.ok(checkManifestFiles(assetManifest, missing).errors.some(error => error.error.includes('missing')))
  const extra = { ...inspection, entries: [...inspection.entries, { ...inspection.entries[0], path: 'fish/unregistered.webp' }] }
  assert.ok(checkManifestFiles(assetManifest, extra).errors.some(error => error.error.includes('no manifest registration')))
})

test('public asset scanner refuses a private directory', async () => {
  const assetRoot = path.join(root, 'private-leak')
  await mkdir(path.join(assetRoot, 'private'), { recursive: true })
  const report = await checkAssets(assetRoot)
  assert.ok(report.errors.some(error => error.path === 'private'))
})

test('scanner catches files outside known categories including root and nested unknown directories', async () => {
  const assetRoot = path.join(root, 'unregistered-directories')
  await mkdir(path.join(assetRoot, 'unknown/nested'), { recursive: true })
  const icon = await readFile(path.join(projectRoot, 'public/assets/icons/reel.svg'))
  await writeFile(path.join(assetRoot, 'rogue.svg'), icon)
  await writeFile(path.join(assetRoot, 'unknown/nested/rogue.svg'), icon)
  const report = await checkAssets(assetRoot)
  assert.equal(report.errors.length, 2)
  assert.ok(report.errors.every(error => error.error.includes('Unsupported public asset directory')))
})

test('file-budget warnings are reported separately without turning valid graphics into errors', async () => {
  const assetRoot = path.join(root, 'warning-only')
  await mkdir(path.join(assetRoot, 'icons'), { recursive: true })
  const icon = (await readFile(path.join(projectRoot, 'public/assets/icons/reel.svg'), 'utf8')).replace('</svg>', `${' '.repeat(14000)}</svg>`)
  await writeFile(path.join(assetRoot, 'icons/large.svg'), icon)
  const report = await checkAssets(assetRoot)
  assert.deepEqual(report.errors, [])
  assert.equal(report.warnings.length, 1)
})

test('public static manifest cannot silently omit integrity metadata', async () => {
  const inspection = await checkAssets()
  for (const field of ['width', 'height', 'sizeBytes', 'sha256']) {
    const metadata = { ...assetManifest['fish.bass.main'] }
    delete metadata[field]
    const manifest = { ...assetManifest, 'fish.bass.main': metadata }
    assert.ok(checkManifestFiles(manifest, inspection).errors.some(error => error.field === field && error.error.includes('missing')))
  }
})
