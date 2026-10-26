import { useEffect, useMemo, useRef, useState } from 'react'
import type { ImgHTMLAttributes } from 'react'
import type { AssetId, AssetResolveContext, ResolvedAsset } from '../types/assets'
import type { AssetResolver } from '../services/assetResolver'
import { assetResolver } from '../services/assetRuntime'
import { AssetError } from '../services/assetErrors'
import { canFallback, diagnoseImageFailure, ImageLoadError } from '../services/imageFailures'

interface AssetImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>,'src'|'onError'|'onLoad'> {
  assetId: AssetId | string
  alt: string
  context?: AssetResolveContext
  resolver?: AssetResolver<AssetId>
  fallback?: boolean
}
interface ImageState { key: string; result?: ResolvedAsset; ready?: boolean; error?: AssetError; terminal?: boolean }
export function AssetImage({ assetId, alt, context, resolver = assetResolver, fallback = true, className, ...props }: AssetImageProps) {
  const contextKey = JSON.stringify(context ?? {})
  const stableContext = useMemo<AssetResolveContext>(() => JSON.parse(contextKey),[contextKey])
  const key = JSON.stringify([assetId,contextKey,fallback])
  const [state,setState] = useState<ImageState>({ key: '' })
  const generation = useRef(0)
  const fallbackAttempt = useRef(false)
  const failingUrls = useRef(new Set<string>())
  const lifetime = useRef<AbortController | null>(null)
  useEffect(() => {
    const current = ++generation.current
    const controller = new AbortController()
    lifetime.current = controller
    const hide = (event: PageTransitionEvent) => { if(!event.persisted) { generation.current=current+1; controller.abort() } }
    window.addEventListener('pagehide',hide)
    fallbackAttempt.current = false
    failingUrls.current.clear()
    const update = (value: ImageState) => { if (generation.current === current) setState(value) }
    void resolver.resolveExternalAsset(assetId,{ ...stableContext, signal: controller.signal, fallback: 'none' }).then(result => update({ key,result })).catch(async (error: unknown) => {
      if (generation.current !== current) return
      const safe = error instanceof AssetError ? error : new AssetError('ASSET_RESOLVE_FAILED','Image URL resolution failed.')
      if (fallback && canFallback(safe)) {
        fallbackAttempt.current = true
        try { const result = await resolver.resolveExternalAsset('placeholder.image',{ signal: controller.signal }); update({ key,result,error: safe }); return } catch { /* terminal */ }
      }
      update({ key,error: safe,terminal: true })
    })
    return () => { generation.current = current + 1; controller.abort(); window.removeEventListener('pagehide',hide) }
  },[key,resolver,assetId,stableContext,fallback])
  const visible = state.key === key ? state : undefined
  const renderedGeneration = generation.current
  const failed = async () => {
    if (!visible?.result) return
    if (generation.current !== renderedGeneration || failingUrls.current.has(visible.result.url)) return
    failingUrls.current.add(visible.result.url)
    const current = generation.current
    const original = visible.result
    const error = await diagnoseImageFailure(original.url,lifetime.current?.signal)
    if (current !== generation.current) return
    if (fallback && !fallbackAttempt.current && original.assetId !== 'placeholder.image') {
      fallbackAttempt.current = true
      try {
        const result = await resolver.resolveFallback(original.assetId,{ ...stableContext,signal: lifetime.current?.signal })
        if (current === generation.current) setState({ key,result,error })
        return
      } catch { /* terminal placeholder failure */ }
    }
    if (current === generation.current) setState({ key,error,terminal: true })
  }
  return <span className={`asset-image-frame ${className ?? ''}`} data-asset-id={assetId} data-state={visible?.terminal ? 'error' : visible?.ready ? 'ready' : 'loading'} data-error-code={visible?.error?.code} data-error-kind={visible?.error instanceof ImageLoadError ? visible.error.kind : undefined}>
    {visible?.result && !visible.terminal && <img {...props} key={visible.result.url} src={visible.result.url} alt={alt} loading={props.loading ?? 'lazy'} decoding={props.decoding ?? 'async'} onLoad={() => { if (generation.current === renderedGeneration) setState(previous => ({ ...previous,ready: true })) }} onError={() => { void failed() }} />}
    {!visible?.ready && <span role="status">{visible?.terminal ? visible.error?.code === 'ACCESS_DENIED' ? '이미지 접근이 허용되지 않았어요' : '이미지를 표시할 수 없어요' : '이미지 불러오는 중…'}</span>}
  </span>
}
