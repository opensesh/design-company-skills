import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PillarProps {
  letter: 'O' | 'D' | 'A'
  label: string
  children: ReactNode
  defaultOpen?: boolean
}

export function Pillar({ letter, label, children, defaultOpen = true }: PillarProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="flex flex-col rounded-xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-muted/60 transition select-none cursor-pointer text-left"
      >
        <h2 className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.08em] text-foreground/80">
          <span
            aria-hidden
            className="grid place-items-center size-6 rounded-md bg-primary text-primary-foreground text-[11px] font-bold font-mono"
          >
            {letter}
          </span>
          {label}
        </h2>
        <ChevronDown
          className={cn(
            'size-4 text-muted-foreground transition-transform',
            !open && 'rotate-180'
          )}
        />
      </button>
      {open && (
        <div className="flex flex-col gap-3 px-5 pb-5">{children}</div>
      )}
    </section>
  )
}
