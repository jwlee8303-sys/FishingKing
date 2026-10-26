import { createHash } from 'node:crypto'
import { readFile, readdir, lstat, realpath } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import sharp from 'sharp'
import { DOMParser } from '@xmldom/xmldom'

export const projectRoot = fileURLToPath(new URL('../../', import.meta.url))
export const assetRoot = path.join(projectRoot, 'public/assets')
export const hash = data => createHash('sha256').update(data).digest('hex')
export const imageOptions = { failOn: 'warning', limitInputPixels: 16_777_216 }

export function within(root, target) {
  const relative = path.relative(root, target)
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))
}

export async function noSymlinks(root, target) {
  if (!within(root, target)) throw new Error('Path escapes its allowed root')
  let current = root
  for (const segment of path.relative(root, target).split(path.sep).filter(Boolean)) {
    current = path.join(current, segment)
    try { if ((await lstat(current)).isSymbolicLink()) throw new Error('Symlinks are not allowed') }
    catch (error) { if (error.code !== 'ENOENT') throw error }
  }
}

export function inspectSvg(text) {
  if (/<!DOCTYPE|<!ENTITY|<\?/i.test(text)) throw new Error('SVG declarations/entities are not allowed')
  const errors = []
  const doc = new DOMParser({ errorHandler: { warning: m => errors.push(m), error: m => errors.push(m), fatalError: m => errors.push(m) } }).parseFromString(text, 'image/svg+xml')
  if (errors.length || doc.documentElement?.localName !== 'svg') throw new Error('Invalid SVG XML')
  if (doc.documentElement.namespaceURI !== 'http://www.w3.org/2000/svg') throw new Error('Invalid SVG namespace')
  const box = doc.documentElement.getAttribute('viewBox').trim().split(/[\s,]+/).map(Number)
  if (box.length !== 4 || !box.every(Number.isFinite) || box[2] <= 0 || box[3] <= 0 || box[2] > 4096 || box[3] > 4096) throw new Error('Invalid SVG viewBox')
  const tags = new Set(['svg', 'g', 'path', 'line', 'polyline', 'polygon', 'rect', 'circle', 'ellipse', 'title', 'desc'])
  const attrs = new Set(['xmlns', 'viewBox', 'width', 'height', 'fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-opacity', 'd', 'points', 'x', 'y', 'x1', 'x2', 'y1', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'transform', 'opacity'])
  for (const el of Array.from(doc.getElementsByTagName('*'))) {
    if (!tags.has(el.tagName) || el.namespaceURI !== 'http://www.w3.org/2000/svg') throw new Error(`Unsupported SVG element: ${el.tagName}`)
    for (const attr of Array.from(el.attributes)) {
      if (!attrs.has(attr.name) || attr.value.includes('\\') || /url\s*\(|(?:https?:|data:|javascript:|file:)/i.test(attr.value) && attr.name !== 'xmlns') throw new Error(`Unsafe SVG attribute: ${attr.name}`)
      if (['fill', 'stroke'].includes(attr.name) && !/^(?:none|currentColor|#[0-9a-f]{3,8})$/i.test(attr.value)) throw new Error('SVG paint must be a literal color')
    }
  }
  return { width: box[2], height: box[3] }
}

export async function decodeImage(file) {
  const data = await readFile(file)
  if (data.length > 32 * 1024 * 1024) throw new Error('Image exceeds 32 MiB source limit')
  const extension = path.extname(file).toLowerCase()
  if (extension === '.svg') inspectSvg(data.toString('utf8'))
  const metadata = await sharp(data, imageOptions).metadata()
  const formats = { '.png': 'png', '.jpg': 'jpeg', '.jpeg': 'jpeg', '.webp': 'webp', '.svg': 'svg' }
  if (!formats[extension] || formats[extension] !== metadata.format) throw new Error('Extension does not match actual image format')
  if (extension === '.webp' && (data.toString('ascii', 0, 4) !== 'RIFF' || data.toString('ascii', 8, 12) !== 'WEBP')) throw new Error('Invalid WebP signature')
  if ((metadata.pages ?? 1) !== 1) throw new Error('Animated/multipage sources are not supported')
  const { data: pixels, info } = await sharp(data, imageOptions).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  let transparent = 0, opaque = 0, partial = 0
  for (let i = 3; i < pixels.length; i += 4) { if (pixels[i] === 0) transparent++; else if (pixels[i] === 255) opaque++; else partial++ }
  return { data, metadata, width: info.width, height: info.height, alpha: { hasAlpha: metadata.hasAlpha, transparent, opaque, partial }, sha256: hash(data), bytes: data.length }
}

export async function walkImages(root) {
  await noSymlinks(projectRoot, root)
  if (!within(projectRoot, await realpath(root))) throw new Error('Asset root escapes workspace')
  const files = []
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const target = path.join(root, entry.name)
    if (entry.isSymbolicLink()) throw new Error('Symlinks are not allowed')
    if (entry.isDirectory()) files.push(...await walkImages(target))
    else if (entry.name !== '.gitkeep') files.push(target)
  }
  return files.sort()
}

export async function checkAssets(root = assetRoot) {
  await noSymlinks(projectRoot, root)
  const entries = [], errors = [], warnings = [], seen = new Map()
  try {
    await lstat(path.join(root, 'private'))
    errors.push({ path: 'private', error: 'Private files must not be placed in the public asset root.' })
  } catch (error) { if (error.code !== 'ENOENT') throw error }
  const categories = new Set(['fish', 'backgrounds', 'icons', 'placeholders', 'images'])
  for (const file of await walkImages(root)) {
      const name = path.relative(root, file).replaceAll(path.sep, '/')
      try {
        const category = name.split('/')[0]
        if (!categories.has(category)) throw new Error('Unsupported public asset directory or root file')
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.(svg|webp)$/.test(path.basename(file))) throw new Error('Invalid lowercase-hyphen filename or deployment extension')
        const image = await decodeImage(file)
        const isSvg = path.extname(file) === '.svg'
        const maxBytes = isSvg ? 16_384 : category === 'fish' ? 204_800 : name.includes('mobile') ? 184_320 : 358_400
        if (image.bytes > maxBytes) throw new Error(`File exceeds ${maxBytes} byte budget`)
        if (image.bytes >= maxBytes*0.8) warnings.push({ path: name,warning: 'Image uses at least 80% of its file budget.' })
        const maxWidth = isSvg ? 256 : category === 'fish' ? 1024 : name.includes('mobile') ? 720 : 1920
        const maxHeight = isSvg ? 256 : 1080
        if (image.width > maxWidth || image.height > (category === 'fish' ? 1024 : maxHeight)) throw new Error('Image exceeds dimension budget')
        if (category === 'fish' && (!image.alpha.hasAlpha || !image.alpha.transparent || !image.alpha.opaque)) throw new Error('Fish sprite must contain transparent and opaque pixels')
        if (seen.has(image.sha256)) throw new Error(`Duplicate SHA-256: ${seen.get(image.sha256)}`)
        seen.set(image.sha256, name)
        entries.push({ path: name, width: image.width, height: image.height, bytes: image.bytes, sha256: image.sha256, alpha: image.alpha, decodedRgbaBytesEstimate: image.width * image.height * 4 })
      } catch (error) { errors.push({ path: name, error: error.message }) }
  }
  if (!entries.length && !errors.length) errors.push({ path: '.', error: 'No deployable graphics found' })
  return { entries, errors, warnings }
}
