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
      <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      <p className="text-sm text-gray-500 transition-opacity duration-300">{messages[index]}</p>
    </div>
  )
}
