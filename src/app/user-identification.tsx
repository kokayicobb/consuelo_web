'use client'

import { usePostHogIdentify } from '@/hooks/usePostHogIdentify'
import { Suspense } from 'react'

interface UserIdentificationProviderProps {
  children: React.ReactNode
}

function UserIdentificationContent({ children }: UserIdentificationProviderProps) {
  // Initialize user identification and tracking
  usePostHogIdentify()

  return <>{children}</>
}

export function UserIdentificationProvider({ children }: UserIdentificationProviderProps) {
  return (
    <Suspense fallback={null}>
      <UserIdentificationContent>{children}</UserIdentificationContent>
    </Suspense>
  )
}