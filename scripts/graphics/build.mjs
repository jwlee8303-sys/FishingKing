import { readFile, writeFile, mkdir, rename } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import sharp from 'sharp'
import { assetRoot, projectRoot, decodeImage, hash, imageOptions, within, noSymlinks } from './lib.mjs'

export async function convertImage(recipe, { update = false, cache = {}, sourceRoot = path.join(projectRoot, 'graphics/source'), outputRoot = assetRoot } = {}) {
  const source = path.resolve(projectRoot, recipe.source), output = path.resolve(projectRoot, recipe.output)
  if (!within(projectRoot, sourceRoot) || !within(projectRoot, outputRoot) || !within(sourceRoot, source) || !within(outputRoot, output) || source === output) throw new Error('Source/output path is outside its allowed root')
  await noSymlinks(projectRoot, source); await noSymlinks(projectRoot, output)
  if (path.extname(output) !== '.webp') throw new Error('Output must be .webp')
  if (![recipe.width, recipe.height].every(n => Number.isInteger(n) && n > 0 && n <= 1920) || !['inside', 'cover'].includes(recipe.fit)) throw new Error('Invalid conversion dimensions/fit')
  if (!Number.isInteger(recipe.quality) || recipe.quality < 1 || recipe.quality > 100) throw new Error('Invalid WebP quality')
  const sourceData = await readFile(source)
  const fingerprint = hash(JSON.stringify(recipe) + hash(sourceData) + JSON.stringify(sharp.versions))
  let existing
  try { existing = await readFile(output) } catch (error) { if (error.code !== 'ENOENT') throw error }
  if (existing && cache[recipe.output]?.fingerprint === fingerprint && cache[recipe.output]?.sha256 === hash(existing)) return { output: recipe.output, status: 'skipped', bytes: existing.length }
  const input = await decodeImage(source)
  if (recipe.requireAlpha && (!input.alpha.hasAlpha || !input.alpha.transparent || !input.alpha.opaque)) throw new Error('Source has no usable alpha channel')
  const converted = await sharp(sourceData, imageOptions).autoOrient().resize({ width: recipe.width, height: recipe.height, fit: recipe.fit, withoutEnlargement: true }).toColourspace('srgb').webp({ quality: recipe.quality, alphaQuality: recipe.alphaQuality ?? 100, effort: 6 }).toBuffer()
  const metadata = await sharp(converted).metadata()
  if (recipe.requireAlpha && !metadata.hasAlpha) throw new Error('WebP alpha was lost')
  const sha256 = hash(converted)
  if (existing && hash(existing) !== sha256 && !update) throw new Error('Output already exists with different content; explicit --update required')
  await mkdir(path.dirname(output), { recursive: true })
  if (!existing) await writeFile(output, converted, { flag: 'wx' })
  else if (hash(existing) !== sha256) {
    const temporary = `${output}.tmp-${process.pid}`
    await writeFile(temporary, converted, { flag: 'wx' }); await rename(temporary, output)
  }
  cache[recipe.output] = { fingerprint, sha256 }
  return { output: recipe.output, status: existing && hash(existing) === sha256 ? 'identical' : 'converted', width: metadata.width, height: metadata.height, bytes: converted.length }
}

export async function buildGraphics({ update = false } = {}) {
  const recipes = JSON.parse(await readFile(path.join(projectRoot, 'graphics/recipes.json'), 'utf8'))
  const cacheFile = path.join(projectRoot, '.local/graphics-cache.json')
  let cache = {}
  try { cache = JSON.parse(await readFile(cacheFile, 'utf8')) } catch (error) { if (error.code !== 'ENOENT') throw error }
  const results = [], errors = []
  for (const recipe of recipes.images) {
    try { results.push(await convertImage(recipe, { update, cache })) }
    catch (error) { errors.push({ source: recipe.source, output: recipe.output, error: error.message }) }
  }
  await mkdir(path.dirname(cacheFile), { recursive: true })
  await writeFile(cacheFile, JSON.stringify(cache, null, 2))
  return { results, errors }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = await buildGraphics({ update: process.argv.includes('--update') })
  console.log(JSON.stringify(report, null, 2))
  if (report.errors.length) process.exitCode = 1
}
