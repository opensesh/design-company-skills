import { Moon, RefreshCw, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/use-theme'
import { cn } from '@/lib/utils'

const ASCII_LOGO = `██████╗ ███████╗███████╗██╗ ██████╗ ███╗   ██╗     ██████╗ ██████╗ ███████╗
██╔══██╗██╔════╝██╔════╝██║██╔════╝ ████╗  ██║    ██╔═══██╗██╔══██╗██╔════╝
██║  ██║█████╗  ███████╗██║██║  ███╗██╔██╗ ██║    ██║   ██║██████╔╝███████╗
██║  ██║██╔══╝  ╚════██║██║██║   ██║██║╚██╗██║    ██║   ██║██╔═══╝ ╚════██║
██████╔╝███████╗███████║██║╚██████╔╝██║ ╚████║    ╚██████╔╝██║     ███████║
╚═════╝ ╚══════╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝     ╚═════╝ ╚═╝     ╚══════╝`

interface HeaderProps {
  onRefresh: () => void
  lastRefresh: Date
  isRefreshing: boolean
}

export function Header({ onRefresh, lastRefresh, isRefreshing }: HeaderProps) {
  const { theme, toggle } = useTheme()

  return (
    <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border bg-card">
      <div className="flex items-center gap-4 min-w-0">
        <pre className="hidden xl:block text-aperol font-mono text-[6px] leading-[1.05] tracking-tighter select-none">
          {ASCII_LOGO}
        </pre>
        <div className="xl:hidden flex items-center gap-3">
          <span className="text-aperol font-bold tracking-[0.12em] text-lg font-mono">
            DESIGN-OPS
          </span>
        </div>
        <span className="hidden sm:inline-block text-[13px] text-muted-foreground pl-4 border-l border-border">
          Live Dashboard
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="hidden sm:inline text-[11px] text-muted-foreground tabular-nums">
          Updated {lastRefresh.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={toggle}
          aria-label="Toggle theme"
          className="size-9"
        >
          {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          aria-label="Refresh"
          className="size-9"
        >
          <RefreshCw className={cn('size-4', isRefreshing && 'animate-spin')} />
        </Button>
      </div>
    </header>
  )
}
