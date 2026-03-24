'use client'

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력하세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
})

const signupSchema = z.object({
  name: z.string().min(1, '이름을 입력하세요'),
  email: z.string().email('올바른 이메일을 입력하세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
  passwordConfirm: z.string(),
}).refine(data => data.password === data.passwordConfirm, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['passwordConfirm'],
})

type LoginInput = z.infer<typeof loginSchema>
type SignupInput = z.infer<typeof signupSchema>

type AuthTab = 'social' | 'email'
type EmailMode = 'login' | 'signup'

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

function PasswordInput({ label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="block text-sm font-medium text-[#374151] mb-1">{label}</label>
      <div className="relative">
        <input
          {...props}
          type={show ? 'text' : 'password'}
          className="w-full px-3 py-2.5 pr-10 border border-[#E2E8F0] rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8]"
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

export default function AuthPage() {
  const router = useRouter()
  const supabase = createClient()
  const [authTab, setAuthTab] = useState<AuthTab>('social')
  const [emailMode, setEmailMode] = useState<EmailMode>('login')
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard')
    })
  }, [])

  // Google OAuth
  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: [
          'https://www.googleapis.com/auth/contacts',
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/drive',
        ].join(' '),
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    setGoogleLoading(false)
  }

  // 이메일 로그인 폼
  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const handleEmailLogin = loginForm.handleSubmit(async (data) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) {
      toast.error('이메일 또는 비밀번호가 올바르지 않습니다')
    } else {
      router.push('/dashboard')
    }
  })

  // 이메일 회원가입 폼
  const signupForm = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  })

  const handleSignup = signupForm.handleSubmit(async (data) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { name: data.name, full_name: data.name } },
    })
    if (error) {
      toast.error(error.message)
    } else {
      // 기본 파이프라인 단계 생성
      await fetch('/api/v1/init', { method: 'POST' })
      toast.success('회원가입이 완료됐습니다!')
      router.push('/dashboard')
    }
  })

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* 로고 */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center">
              <span className="text-[#38BDF8] font-bold text-lg">S1</span>
            </div>
            <span className="text-2xl font-bold text-[#0F172A]">SalesONE</span>
          </div>
          <p className="text-[#64748B] text-sm">모든 영업인의 고객 관리를, 하나의 흐름으로</p>
        </div>

        {/* 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
          {/* 탭 헤더 */}
          <div className="flex border-b border-[#E2E8F0]">
            <button
              onClick={() => setAuthTab('social')}
              className={cn(
                'flex-1 py-3 text-sm font-medium transition-colors',
                authTab === 'social'
                  ? 'text-[#0F172A] border-b-2 border-[#38BDF8] -mb-px'
                  : 'text-[#94A3B8] hover:text-[#64748B]'
              )}
            >
              소셜 로그인
            </button>
            <button
              onClick={() => setAuthTab('email')}
              className={cn(
                'flex-1 py-3 text-sm font-medium transition-colors',
                authTab === 'email'
                  ? 'text-[#0F172A] border-b-2 border-[#38BDF8] -mb-px'
                  : 'text-[#94A3B8] hover:text-[#64748B]'
              )}
            >
              이메일
            </button>
          </div>

          <div className="p-6">
            {/* ── 소셜 로그인 탭 ── */}
            {authTab === 'social' && (
              <div className="space-y-4">
                <div className="text-center">
                  <h1 className="text-lg font-semibold text-[#1E293B]">시작하기</h1>
                  <p className="text-sm text-[#64748B] mt-1">Google 계정으로 바로 시작하세요</p>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#1E293B] font-medium hover:bg-[#F8FAFC] transition-colors disabled:opacity-50 shadow-sm"
                >
                  {googleLoading
                    ? <Loader2 className="w-5 h-5 animate-spin text-[#94A3B8]" />
                    : <GoogleIcon />
                  }
                  {googleLoading ? '로그인 중...' : 'Google로 계속하기'}
                </button>

                <p className="text-xs text-[#94A3B8] text-center">
                  구글 주소록·캘린더·드라이브 연동 포함
                </p>
              </div>
            )}

            {/* ── 이메일 탭 ── */}
            {authTab === 'email' && (
              <>
                {emailMode === 'login' ? (
                  /* 로그인 폼 */
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div>
                      <h1 className="text-lg font-semibold text-[#1E293B]">로그인</h1>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-1">이메일</label>
                      <input
                        {...loginForm.register('email')}
                        type="email"
                        placeholder="example@email.com"
                        className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8]"
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-xs text-red-500 mt-1">{loginForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <PasswordInput
                      label="비밀번호"
                      {...loginForm.register('password')}
                      placeholder="8자 이상"
                      error={loginForm.formState.errors.password?.message}
                    />

                    <button
                      type="submit"
                      disabled={loginForm.formState.isSubmitting}
                      className="w-full py-2.5 bg-[#0F172A] text-white rounded-xl text-sm font-medium hover:bg-[#1e293b] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loginForm.formState.isSubmitting && <Loader2 size={14} className="animate-spin" />}
                      로그인
                    </button>

                    <p className="text-center text-sm text-[#64748B]">
                      계정이 없으신가요?{' '}
                      <button
                        type="button"
                        onClick={() => { setEmailMode('signup'); loginForm.reset() }}
                        className="text-[#38BDF8] font-medium hover:underline"
                      >
                        회원가입
                      </button>
                    </p>
                  </form>
                ) : (
                  /* 회원가입 폼 */
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                      <h1 className="text-lg font-semibold text-[#1E293B]">회원가입</h1>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-1">이름</label>
                      <input
                        {...signupForm.register('name')}
                        placeholder="홍길동"
                        className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8]"
                      />
                      {signupForm.formState.errors.name && (
                        <p className="text-xs text-red-500 mt-1">{signupForm.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-1">이메일</label>
                      <input
                        {...signupForm.register('email')}
                        type="email"
                        placeholder="example@email.com"
                        className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8]"
                      />
                      {signupForm.formState.errors.email && (
                        <p className="text-xs text-red-500 mt-1">{signupForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <PasswordInput
                      label="비밀번호 (8자 이상)"
                      {...signupForm.register('password')}
                      placeholder="8자 이상"
                      error={signupForm.formState.errors.password?.message}
                    />

                    <PasswordInput
                      label="비밀번호 확인"
                      {...signupForm.register('passwordConfirm')}
                      placeholder="비밀번호 재입력"
                      error={signupForm.formState.errors.passwordConfirm?.message}
                    />

                    <button
                      type="submit"
                      disabled={signupForm.formState.isSubmitting}
                      className="w-full py-2.5 bg-[#0F172A] text-white rounded-xl text-sm font-medium hover:bg-[#1e293b] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {signupForm.formState.isSubmitting && <Loader2 size={14} className="animate-spin" />}
                      회원가입
                    </button>

                    <p className="text-center text-sm text-[#64748B]">
                      이미 계정이 있으신가요?{' '}
                      <button
                        type="button"
                        onClick={() => { setEmailMode('login'); signupForm.reset() }}
                        className="text-[#38BDF8] font-medium hover:underline"
                      >
                        로그인
                      </button>
                    </p>
                  </form>
                )}
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-[#94A3B8]">
          로그인 시 서비스 이용약관에 동의하게 됩니다
        </p>
      </div>
    </div>
  )
}
