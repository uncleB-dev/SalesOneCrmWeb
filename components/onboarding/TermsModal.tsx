'use client'

import { X } from 'lucide-react'

interface Props {
  title: string
  content: string
  isOpen: boolean
  onClose: () => void
}

export default function TermsModal({ title, content, isOpen, onClose }: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0] flex-shrink-0">
          <h3 className="font-semibold text-[#1E293B]">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#F8FAFC] text-[#94A3B8]">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-5 flex-1">
          <pre className="text-xs text-[#475569] whitespace-pre-wrap leading-relaxed font-sans">
            {content}
          </pre>
        </div>
        <div className="px-5 py-4 border-t border-[#E2E8F0] flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#0F172A] text-white rounded-xl text-sm font-medium hover:bg-[#1e293b]"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  )
}
