'use client'

import { ToneOption, TONE_OPTIONS, TONE_LABELS } from '@/lib/types'

interface TonePickerProps {
  selected: ToneOption
  onChange: (tone: ToneOption) => void
}

export function TonePicker({ selected, onChange }: TonePickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-foreground">Choose a tone</p>
      <div className="flex gap-2 items-center">
        {TONE_OPTIONS.map((tone) => {
          const { label, description } = TONE_LABELS[tone]
          const isActive = selected === tone
          return (
            <button
              key={tone}
              onClick={() => onChange(tone)}
              className={`flex-1 rounded-full border-2 px-3 text-center transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.03] py-2.5'
                  : 'border-primary/30 bg-white text-foreground hover:border-primary py-2'
              }`}
            >
              <p className="font-semibold text-sm">{label}</p>
              <p className={`text-xs mt-0.5 hidden md:block ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                {description}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
