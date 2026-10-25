import { readFileSync, writeFileSync } from 'node:fs'
import { URL } from 'node:url'

// Manual snapshot sync: never contacts or writes to Penpot.
const source = JSON.parse(readFileSync(new URL('../docs/design/tokens.draft.json', import.meta.url), 'utf8'))
const variables = source.tokens.map(({ name, type, value }) => {
  let css = String(value)
  if (type === 'fontFamilies') css = `${(Array.isArray(value) ? value : [value]).map(v => JSON.stringify(v)).join(', ')}, system-ui, sans-serif`
  if (type === 'shadow') css = value.map(s => `${s.inset ? 'inset ' : ''}${s.offsetX}px ${s.offsetY}px ${s.blur}px ${s.spread}px ${s.color}`).join(', ')
  if (name.startsWith('fk.motion.')) css += 'ms'
  return `  --${name.replaceAll('.', '-').replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}: ${css};`
})
const output = `/* Generated from docs/design/tokens.draft.json (${variables.length} tokens).\n   Refresh manually: node scripts/sync-design-tokens.mjs */\n:root {\n${variables.join('\n')}\n}\n`
const target = new URL('../src/styles/tokens.css', import.meta.url)
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== output) throw new Error('Design token CSS is out of sync')
} else writeFileSync(target, output, 'utf8')
console.log(`${variables.length} design tokens ${process.argv.includes('--check') ? 'verified' : 'generated'}`)
