import { useEffect,useId,useRef } from 'react'
import type { ButtonHTMLAttributes,InputHTMLAttributes,ReactNode } from 'react'
import { Link } from 'react-router'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary'|'secondary'|'icon'
}
export function PrimaryButton({ className='',variant='primary',type='button',...props }: ButtonProps) {
  return (
    <button type={type} className={`button button-${variant} ${className}`} {...props} />
  )
}
export function SecondaryButton(props: ButtonProps) {
  return (
    <PrimaryButton {...props} variant="secondary" />
  )
}
export function IconButton(props: ButtonProps) {
  return (
    <PrimaryButton {...props} variant="icon" />
  )
}
export function StatusBadge({ children,tone='primary' }: { children: ReactNode; tone?: 'primary'|'gold'|'muted' }) {
  return (
    <span className={`status-badge badge-${tone}`}>{children}</span>
  )
}
export function PageTitle({ title,description,eyebrow }: { title: string; description: string; eyebrow: string }) {
  return (
    <div className="mb-8">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="page-heading">{title}</h1>
      <p className="mt-3 text-fk-muted">{description}</p>
    </div>
  )
}
export function LoadingState({ label='불러오는 중…' }: { label?: string }) {
  return (
    <div className="panel space-y-4" role="status" aria-busy="true">
      <p>{label}</p>
      <div className="skeleton" />
      <div className="skeleton w-2/3" />
      <p className="text-sm text-fk-muted">화면 상태 시연입니다.</p>
    </div>
  )
}
export function EmptyState({ title,children,action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="panel empty-state">
      <span className="empty-symbol" aria-hidden="true">≈</span>
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-3 text-fk-muted">{children}</div>{action&&<div className="mt-6">{action}</div>}</div>
  )
}
export function InputField({ label,error,hint,id: providedId,...props }: InputHTMLAttributes<HTMLInputElement>&{ label: string; error?: string; hint?: string }) {
  const generatedId=useId()
  const id=providedId??generatedId
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={error? true:undefined} aria-describedby={error||hint? `${id}-hint`:undefined} {...props} />{(error||hint)&&<p id={`${id}-hint`} role={error? 'alert':undefined} className={error? 'text-fk-danger':'text-fk-muted'}>{error||hint}</p>}</div>
  )
}
export function Modal({ open,title,onClose,children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const dialogRef=useRef<HTMLDialogElement>(null)
  const heading=useId()
  useEffect(() => {
    if(!open) return
    const dialog=dialogRef.current
    const trigger=document.activeElement instanceof HTMLElement? document.activeElement:null
    dialog?.showModal()
    const old=document.body.style.overflow
    document.body.style.overflow='hidden'
    return () => { dialog?.close(); document.body.style.overflow=old; trigger?.focus() }
  },[open])
  return (
    <dialog ref={dialogRef} aria-labelledby={heading} className="modal" onCancel={event => { event.preventDefault(); onClose() }}>
      <div className="flex items-center justify-between gap-4">
        <h2 id={heading} className="text-xl font-bold">{title}</h2>
        <IconButton aria-label="닫기" onClick={onClose}>×</IconButton>
      </div>
      <div className="mt-6">{children}</div>
    </dialog>
  )
}
export function ProfileCard({ exampleSignedIn=false }: { exampleSignedIn?: boolean }) {
  return (
    <section className="panel">
      <div className="flex items-center gap-4">
        <div className="avatar" aria-hidden="true">◉</div>
        <div>
          <StatusBadge tone="muted">{exampleSignedIn? '로그인 상태 예시 · UI 시연':'비회원'}</StatusBadge>
          <h2 className="mt-2 text-2xl font-bold">{exampleSignedIn? '플레이어 A':'물가의 여행자'}</h2>
        </div>
      </div>
      <p className="my-5 text-fk-muted">현재 탭에서 UI를 둘러보고 있어요. 실제 계정과 기록은 아직 연결되지 않았어요.</p>{exampleSignedIn? <PrimaryButton disabled className="w-full">계정 관리 · 준비 중</PrimaryButton>:<Link to="/login" className="button button-primary w-full">로그인</Link>}</section>
  )
}
