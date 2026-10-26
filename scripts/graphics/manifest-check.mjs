/** Compares the registry with the existing, already-decoded 3-05 inspection. No downloads. */
export function checkManifestFiles(manifest, inspection) {
  const actual = new Map(inspection.entries.map(entry => [entry.path, entry]))
  const registered = new Set(), errors = []
  for (const metadata of Object.values(manifest)) {
    if (metadata.access !== 'public') continue
    for (const file of [metadata, ...(metadata.variants ?? [])]) {
      const inspected = actual.get(file.path)
      registered.add(file.path)
      if (!inspected) { errors.push({ id: metadata.id, variant: file.key ?? 'default', error: 'Registered public file is missing or failed inspection.' }); continue }
      const contentType = inspected.path.endsWith('.svg') ? 'image/svg+xml' : 'image/webp'
      if (file.contentType !== contentType) errors.push({ id: metadata.id, error: 'MIME metadata mismatch.' })
      for (const field of ['width', 'height', 'sizeBytes', 'sha256']) {
        const measured = inspected[field === 'sizeBytes' ? 'bytes' : field]
        if (file[field] === undefined) errors.push({ id: metadata.id, variant: file.key ?? 'default', field, error: 'Static file integrity metadata is missing.' })
        else if (file[field] !== measured) errors.push({ id: metadata.id, variant: file.key ?? 'default', field, error: 'File metadata mismatch.' })
      }
    }
  }
  for (const file of actual.keys()) if (!registered.has(file)) errors.push({ path: file, error: 'Deployable image has no manifest registration.' })
  return { registeredFiles: registered.size, errors }
}
