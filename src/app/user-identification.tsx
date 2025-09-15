'use client'

import { usePostHogIdentify } from '@/hooks/usePostHogIdentify'

interface UserIdentificationProviderProps {
  children: React.ReactNode
}

export function UserIdentificationProvider({ children }: UserIdentificationProviderProps) {
  // Initialize user identification and tracking
  usePostHogIdentify()

  return <>{children}</>
}