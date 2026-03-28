'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import OnboardingLayout from '@/components/onboarding/OnboardingLayout'
import TermsStep, { type TermsAgreement } from '@/components/onboarding/TermsStep'
import ProfileStep from '@/components/onboarding/ProfileStep'
import type { JobType } from '@/lib/onboarding'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [termsAgreement, setTermsAgreement] = useState<TermsAgreement | null>(null)

  const handleTermsNext = (agreement: TermsAgreement) => {
    setTermsAgreement(agreement)
    setStep(2)
  }

  const handleProfileComplete = async (profile: {
    name: string
    phone_number: string
    job_type: JobType
  }) => {
    if (!termsAgreement) return

    const res = await fetch('/api/v1/onboarding/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...profile, ...termsAgreement }),
    })
    const result = await res.json()

    if (!result.success) {
      toast.error(result.error || '온보딩 완료에 실패했습니다')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <OnboardingLayout step={step}>
      {step === 1 ? (
        <TermsStep onNext={handleTermsNext} />
      ) : (
        <ProfileStep onComplete={handleProfileComplete} />
      )}
    </OnboardingLayout>
  )
}
