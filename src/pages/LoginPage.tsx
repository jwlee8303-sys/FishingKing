import { useState } from 'react'
import { Link } from 'react-router'
import { InputField,Modal,PageTitle,PrimaryButton,SecondaryButton,StatusBadge } from '../components/ui'

export function LoginPage() {
  const [account,setAccount]=useState('')
  const [error,setError]=useState('')
  const [signup,setSignup]=useState(false)
  return (
    <div className="login-card">
      <PageTitle title="로그인" eyebrow="Welcome back" description="다시 만나 반가워요. 계정 없이도 물가에 머물 수 있어요." />
      <div className="panel">
        <StatusBadge tone="muted">로그인 화면 시연</StatusBadge>
        <form className="mt-6 space-y-5" noValidate onSubmit={event => { event.preventDefault(); setError(account.trim()? '아직 인증 서비스가 연결되지 않았어요. 비회원으로 계속할 수 있어요.':'계정 정보를 입력해주세요.') }}>
          <InputField label="계정 정보" name="account" autoComplete="off" value={account} onChange={event => { setAccount(event.target.value); setError('') }} placeholder="시연용 이름을 입력하세요" hint="실제 비밀번호를 입력하지 마세요. 입력값을 전송하거나 저장하지 않아요." error={!account.trim()? error:undefined} />{account.trim()&&error&&<p role="alert" className="text-fk-danger text-sm">{error}</p>}<PrimaryButton type="submit" className="w-full">로그인 화면 확인</PrimaryButton>
        </form>
        <div className="mt-3">
          <Link to="/game" className="button button-secondary w-full">비회원으로 계속</Link>
        </div>
        <SecondaryButton className="mt-3 w-full" onClick={() => setSignup(true)}>회원가입 안내</SecondaryButton>
        <p className="text-sm text-fk-muted mt-5">인증 방식과 회원가입은 다음 인증 단계에서 연결됩니다.</p>
      </div>
      <Link className="button button-secondary mt-5" to="/">← 홈으로 돌아가기</Link>
      <Modal title="회원가입 안내" open={signup} onClose={() => setSignup(false)}>
        <p className="text-fk-muted">회원가입은 준비 중이에요. 지금은 비회원으로 화면을 둘러볼 수 있어요.</p>
        <Link className="button button-primary mt-6 w-full" to="/game">비회원으로 계속</Link>
      </Modal>
    </div>
  )
}
