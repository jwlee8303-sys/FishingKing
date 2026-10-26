import type { AssetManifest } from '../types/assets'

/** Data only: Node's graphics checker also reads this table via native TS stripping. */
function freeze<const T extends AssetManifest>(manifest: T): T {
  for (const entry of Object.values(manifest)) {
    for (const variant of entry.variants ?? []) Object.freeze(variant)
    if (entry.variants) Object.freeze(entry.variants)
    Object.freeze(entry)
  }
  return Object.freeze(manifest)
}

export const assetManifest = freeze({
  'fish.bass.main': {
    id: 'fish.bass.main', type: 'fish', access: 'public',
    path: 'fish/bass-main.webp', contentType: 'image/webp',
    width: 1024, height: 512, sizeBytes: 138258,
    sha256: '188e0672f2c02bbdad34d96d834b0d6a0e4c512f2c912bead8be29f54bbcc8aa',
    fallbackId: 'placeholder.image', version: '1', attribution: 'graphics/PROVENANCE.md',
  },
  'background.lake.day': {
    id: 'background.lake.day', type: 'background', access: 'public',
    path: 'backgrounds/lake-day.webp', contentType: 'image/webp',
    width: 1600, height: 900, sizeBytes: 150364,
    sha256: '2c1e1a3781c872b1465f7ec8bdaf8988388df19eb6a943763250bb5ada4bc26a',
    fallbackId: 'placeholder.image', version: '1', attribution: 'graphics/PROVENANCE.md',
    variants: [{
      key: 'mobile-portrait', layout: 'mobile-portrait', pixelRatio: 1,
      path: 'backgrounds/lake-day-mobile.webp', contentType: 'image/webp',
      width: 720, height: 1080, sizeBytes: 79746,
      sha256: '591254038f281f99a59184795652f27c5b1e5716e64ff8f3dc70e0610853a27a',
    }],
  },
  'icon.fishing.rod': {
    id: 'icon.fishing.rod', type: 'icon', access: 'public',
    path: 'icons/fishing-rod.svg', contentType: 'image/svg+xml',
    width: 24, height: 24, sizeBytes: 283,
    sha256: '2aa7b58591646fea9877122d50b81cb53a87e6ef4f5b28c4ff71ad1b87306b1c',
    fallbackId: 'placeholder.image', version: '1', attribution: 'graphics/PROVENANCE.md',
  },
  'icon.fishing.reel': {
    id: 'icon.fishing.reel', type: 'icon', access: 'public',
    path: 'icons/reel.svg', contentType: 'image/svg+xml',
    width: 24, height: 24, sizeBytes: 287,
    sha256: '8b062a457e1927c7f9268b8f8d75c13513403a7957a25874b62cef96262c9724',
    fallbackId: 'placeholder.image', version: '1', attribution: 'graphics/PROVENANCE.md',
  },
  'icon.fishing.hook': {
    id: 'icon.fishing.hook', type: 'icon', access: 'public',
    path: 'icons/hook.svg', contentType: 'image/svg+xml',
    width: 24, height: 24, sizeBytes: 309,
    sha256: '9cbb6eaeec038767b17d763fcbfe6d008327569980eeb1e6875f7211a5d8fc6b',
    fallbackId: 'placeholder.image', version: '1', attribution: 'graphics/PROVENANCE.md',
  },
  'placeholder.image': {
    id: 'placeholder.image', type: 'placeholder', access: 'public',
    path: 'placeholders/image-missing.svg', contentType: 'image/svg+xml',
    width: 64, height: 64, sizeBytes: 427,
    sha256: '6b3743c5c33700ac437136e0299a0252621da073903c88bc2f57582f0ca28d40',
    version: '1', attribution: 'graphics/PROVENANCE.md',
  },
} as const satisfies AssetManifest)
