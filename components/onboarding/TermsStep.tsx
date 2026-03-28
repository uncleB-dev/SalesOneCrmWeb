'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import TermsModal from './TermsModal'
import {
  TERMS_SERVICE,
  TERMS_PRIVACY,
  TERMS_CONSIGNMENT,
  TERMS_MARKETING,
} from '@/lib/terms-content'

export interface TermsAgreement {
  agreed_terms: boolean
  agreed_privacy: boolean
  agreed_consignment: boolean
  agreed_marketing: boolean
}

interface Props {
  onNext: (agreement: TermsAgreement) => void
}

type ModalKey = 'terms' | 'privacy' | 'consignment' | 'marketing' | null

const MODAL_CONTENT: Record<Exclude<ModalKey, null>, { title: string; content: string }> = {
  terms:       { title: '서비스 이용약관', content: TERMS_SERVICE },
  privacy:     { title: '개인정보 처리방침', content: TERMS_PRIVACY },
  consignment: { title: '개인정보 처리 위탁 동의', content: TERMS_CONSIGNMENT },
  marketing:   { title: '마케팅 정보 수신 동의', content: TERMS_MARKETING },
}

interface TermItem {
  key: keyof TermsAgreement
  label: string
  required: boolean
  modalKey: Exclude<ModalKey, null>
}

const TERM_ITEMS: TermItem[] = [
  { key: 'agreed_terms',       label: '서비스 이용약관 동의',       required: true,  modalKey: 'terms' },
  { key: 'agreed_privacy',     label: '개인정보 처리방침 동의',      required: true,  modalKey: 'privacy' },
  { key: 'agreed_consignment', label: '개인정보 처리 위탁 동의',     required: true,  modalKey: 'consignment' },
  { key: 'agreed_marketing',   label: '마케팅 정보 수신 동의',       required: false, modalKey: 'marketing' },
]

export default function TermsStep({ onNext }: Props) {
  const [agreement, setAgreement] = useState<TermsAgreement>({
    agreed_terms: false,
    agreed_privacy: false,
    agreed_consignment: false,
    agreed_marketing: false,
  })
  const [activeModal, setActiveModal] = useState<ModalKey>(null)

  const allRequired = agreement.agreed_terms && agreement.agreed_privacy && agreement.agreed_consignment
  const allChecked = allRequired && agreement.agreed_marketing

  const toggleAll = () => {
    const next = !allChecked
    setAgreement({
      agreed_terms: next,
      agreed_privacy: next,
      agreed_consignment: next,
      agreed_marketing: next,
    })
  }

  const toggle = (key: keyof TermsAgreement) => {
    setAgreement(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1E293B]">약관 동의</h2>
        <p className="text-sm text-[#64748B] mt-1">서비스 이용을 위해 약관에 동의해주세요</p>
      </div>

      <div className="space-y-3">
        {/* 전체 동의 */}
        <button
          onClick={toggleAll}
          className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-[#E2E8F0] hover:border-[#38BDF8] transition-colors"
        >
          <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
            allChecked ? 'bg-[#38BDF8]' : 'border-2 border-[#CBD5E1]'
          }`}>
            {allChecked && <Check size={12} className="text-white" strokeWidth={3} />}
          </div>
          <span className="font-semibold text-[#1E293B] text-left">전체 동의</span>
        </button>

        <div className="border-t border-[#E2E8F0]" />

        {/* 개별 항목 */}
        {TERM_ITEMS.map(item => (
          <div key={item.key} className="flex items-center gap-3">
            <button
              onClick={() => toggle(item.key)}
              className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                agreement[item.key] ? 'bg-[#38BDF8]' : 'border-2 border-[#CBD5E1]'
              }`}
            >
              {agreement[item.key] && <Check size={12} className="text-white" strokeWidth={3} />}
            </button>
            <span
              className="flex-1 text-sm text-[#374151] text-left cursor-pointer"
              onClick={() => toggle(item.key)}
            >
              {item.required ? '[필수] ' : '[선택] '}
              {item.label}
            </span>
            <button
              onClick={() => setActiveModal(item.modalKey)}
              className="text-xs text-[#94A3B8] hover:text-[#64748B] underline flex-shrink-0"
            >
              보기
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => onNext(agreement)}
        disabled={!allRequired}
        className="w-full py-3 bg-[#0F172A] text-white rounded-xl font-medium hover:bg-[#1e293b] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        다음
      </button>

      {activeModal && (
        <TermsModal
          title={MODAL_CONTENT[activeModal].title}
          content={MODAL_CONTENT[activeModal].content}
          isOpen={true}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  )
}
