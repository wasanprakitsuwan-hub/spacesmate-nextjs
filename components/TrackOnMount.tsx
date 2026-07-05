'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

export default function TrackOnMount({ eventName, params }: {
  eventName: string
  params?: Record<string, unknown>
}) {
  useEffect(() => {
    trackEvent(eventName, params)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
