'use client'

import { useState } from 'react'
import { Users, User, Bot, Loader2, Check, CheckCircle2, Link2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import TeamPageClient from '@/app/dashboard/team/TeamPageClient'
import { createClient } from '@/lib/supabase'

interface Props {
  userId: string
  initialName: string
  email: string
  avatarUrl: string | null
  isGoogleConnected: boolean
  googleEmail: string | null
}

type Tab = 'team' | 'profile'

export default function SettingsClient({
  userId,
  initialName,
  email,
  avatarUrl,
  isGoogleConnected,
  googleEmail,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('team')
  const [name, setName] = useState(initialName)
  const [saving, setSaving] = useState(false)
  const [connectingGoogle, setConnectingGoogle] = useState(false)
  const supabase = createClient()

  const handleSaveName = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/v1/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      toast.success('이름이 저장되었습니다')
    } catch (e: any) {
      toast.error(e.message || '저장에 실패했습니다')
    } finally {
      setSaving(false)
    }
  }

  const handleGoogleConnect = async () => {
    setConnectingGoogle(true)
    try {
      const { error } = await supabase.auth.linkIdentity({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: [
            'https://www.googleapis.com/auth/contacts',
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/drive',
          ].join(' '),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      } as any)
      if (error) throw error
    } catch (e: any) {
      toast.error('구글 계정 연동에 실패했습니다')
      setConnectingGoogle(false)
    }
  }

  const initials = name?.charAt(0)?.toUpperCase() || 'U'

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1E293B]">설정</h1>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-[#E2E8F0] mb-6">
        <TabBtn active={activeTab === 'team'} onClick={() => setActiveTab('team')}>
          <Users size={15} />
          팀 관리
        </TabBtn>
        <TabBtn active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
          <User size={15} />
          프로필
        </TabBtn>
      </div>

      {/* 팀 관리 탭 */}
      {activeTab === 'team' && (
        <div className="-mx-4 md:mx-0">
          <TeamPageClient currentUserId={userId} />
        </div>
      )}

      {/* 프로필 탭 */}
      {activeTab === 'profile' && (
        <div className="space-y-6 max-w-lg">
          {/* 아바타 + 기본 정보 */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 space-y-4">
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="프로필"
                  className="w-14 h-14 rounded-full object-cover border border-[#E2E8F0]"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#0F172A] flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{initials}</span>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-[#1E293B]">{name || email}</p>
                <p className="text-xs text-[#94A3B8] mt-0.5">{email}</p>
              </div>
            </div>

            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">이름</label>
              <div className="flex gap-2">
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-[#E2E8F0] rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30"
                  placeholder="이름을 입력하세요"
                />
                <button
                  onClick={handleSaveName}
                  disabled={saving || !name.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0F172A] text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-[#1e293b]"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  저장
                </button>
              </div>
            </div>

            {/* 이메일 (읽기 전용) */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">이메일</label>
              <input
                value={email}
                readOnly
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed"
              />
            </div>
          </div>

          {/* 구글 계정 연동 */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center">
                <GoogleColorIcon />
              </div>
              <p className="text-sm font-semibold text-[#1E293B]">구글 계정 연동</p>
            </div>

            <p className="text-xs text-[#64748B] mb-4 leading-relaxed">
              구글 서비스(주소록·캘린더·드라이브)를 사용하려면 구글 계정 연동이 필요합니다.
            </p>

            {isGoogleConnected ? (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg">
                <CheckCircle2 size={16} className="text-[#16A34A] flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[#16A34A]">연동됨</p>
                  {googleEmail && (
                    <p className="text-xs text-[#15803D]">{googleEmail}</p>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={handleGoogleConnect}
                disabled={connectingGoogle}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC] disabled:opacity-50 transition-colors"
              >
                {connectingGoogle
                  ? <Loader2 size={16} className="animate-spin text-[#94A3B8]" />
                  : <Link2 size={16} className="text-[#64748B]" />
                }
                {connectingGoogle ? '연동 중...' : '구글 계정 연결하기'}
              </button>
            )}
          </div>

          {/* AI 통화 요약 안내 */}
          <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <p className="text-sm font-semibold text-[#1E293B]">AI 통화 요약</p>
            </div>
            <p className="text-sm text-[#64748B] leading-relaxed">
              AI 통화 요약 기능은 <span className="font-semibold text-[#1E293B]">SalesONE 모바일 앱</span>에서
              설정합니다. 앱에서 Gemini API 키를 등록하면, 통화 후 자동으로 요약이 기록 탭에 쌓입니다.
            </p>
            <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg">
              <p className="text-xs text-amber-700 font-medium">앱 출시 예정</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function GoogleColorIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
        active
          ? 'border-[#38BDF8] text-[#0F172A]'
          : 'border-transparent text-[#94A3B8] hover:text-[#64748B]'
      )}
    >
      {children}
    </button>
  )
}
