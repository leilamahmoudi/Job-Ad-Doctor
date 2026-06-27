'use client'

import { useEffect, useState } from 'react'

interface LoadingStateProps {
  messages: string[]
}

export function LoadingState({ messages }: LoadingStateProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [messages.length])

  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground transition-opacity duration-300">{messages[index]}</p>
    </div>
  )
}
