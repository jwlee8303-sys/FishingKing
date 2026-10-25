export type AssetDirectory = 'images' | 'fish' | 'backgrounds' | 'icons' | 'audio'

/** Path relative to public/assets; keep filenames independent of the hosting provider. */
export type AssetPath = `${AssetDirectory}/${string}`
