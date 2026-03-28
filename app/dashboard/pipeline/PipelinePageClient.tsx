'use client'

import { useState } from 'react'
import { Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import KanbanBoard from '@/components/pipeline/KanbanBoard'
import PipelineStagesEditor from '@/components/settings/PipelineStagesEditor'
import type { KanbanColumn, PipelineStage } from '@/types'

interface Props {
  initialPipeline: KanbanColumn[]
  initialEscape: KanbanColumn[]
  allStages: PipelineStage[]
  customerCountByStage: Record<string, number>
  reminderMap: Record<string, string>
}

export default function PipelinePageClient({
  initialPipeline,
  initialEscape,
  allStages,
  customerCountByStage,
  reminderMap,
}: Props) {
  const router = useRouter()
  const [showEditor, setShowEditor] = useState(false)

  return (
    <div className="h-[calc(100vh-48px)] flex flex-col p-4 md:p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-[#1E293B]">파이프라인</h1>
          <p className="text-sm text-[#94A3B8]">고객을 드래그해서 단계를 변경하세요</p>
        </div>
        <button
          onClick={() => setShowEditor(true)}
          className="flex items-center gap-2 px-3 py-2 min-h-[44px] border border-[#E2E8F0] rounded-lg text-sm text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
        >
          <Settings size={15} />
          <span className="hidden sm:inline">단계 관리</span>
        </button>
      </div>

      {/* 칸반 보드 */}
      <div className="flex-1 min-h-0">
        <KanbanBoard
          initialPipeline={initialPipeline}
          initialEscape={initialEscape}
          reminders={reminderMap}
        />
      </div>

      {/* 단계 관리 모달 */}
      {showEditor && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => { router.refresh(); setShowEditor(false) }}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
              <div>
                <h2 className="text-lg font-semibold text-[#1E293B]">파이프라인 단계 관리</h2>
                <p className="text-sm text-[#94A3B8]">드래그로 순서 변경, 클릭으로 이름 수정</p>
              </div>
              <button
                onClick={() => { router.refresh(); setShowEditor(false) }}
                className="p-2 rounded-lg hover:bg-[#F8FAFC] text-[#64748B]"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <PipelineStagesEditor
                initialStages={allStages}
                customerCountByStage={customerCountByStage}
                onSaved={() => { router.refresh(); setShowEditor(false) }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
