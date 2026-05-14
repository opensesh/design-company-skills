import type { ReactNode } from 'react'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ItemProps {
  prefix?: ReactNode
  title: ReactNode
  meta?: ReactNode
  badge?: ReactNode
  href?: string
}

export function ItemList({ children }: { children: ReactNode }) {
  return <ul className="flex flex-col gap-1">{children}</ul>
}

export function Item({ prefix, title, meta, badge, href }: ItemProps) {
  const titleNode = href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-aperol transition-colors inline-flex items-center gap-1 group"
    >
      <span className="truncate">{title}</span>
      <ExternalLink className="size-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
    </a>
  ) : (
    <span className="truncate">{title}</span>
  )

  return (
    <li className="group flex items-start gap-3 px-2 py-1.5 -mx-2 rounded-md hover:bg-muted/60 transition">
      {prefix !== undefined && (
        <span className={cn('shrink-0 min-w-[40px] text-[11px] font-mono text-muted-foreground pt-0.5')}>
          {prefix}
        </span>
      )}
      <span className="flex-1 min-w-0">
        <span className="block text-[13px] font-medium text-foreground truncate leading-snug">
          {titleNode}
        </span>
        {meta && (
          <span className="block text-[11px] text-muted-foreground truncate mt-0.5">
            {meta}
          </span>
        )}
      </span>
      {badge && <span className="shrink-0 pt-0.5">{badge}</span>}
    </li>
  )
}
