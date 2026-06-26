'use client'

import { ToneOption, TONE_OPTIONS, TONE_LABELS } from '@/lib/types'

interface TonePickerProps {
  selected: ToneOption
  onChange: (tone: ToneOption) => void
}

export function TonePicker({ selected, onChange }: TonePickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-gray-700">Choose a tone</p>
      <div className="flex flex-col sm:flex-row gap-2">
        {TONE_OPTIONS.map((tone) => {
          const { label, description } = TONE_LABELS[tone]
          const isActive = selected === tone
          return (
            <button
              key={tone}
              onClick={() => onChange(tone)}
              className={`flex-1 text-left rounded-lg border px-4 py-3 transition-all duration-150 ${
                isActive
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <p className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-gray-900'}`}>
                {label}
              </p>
              <p className={`text-xs mt-0.5 ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                {description}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
