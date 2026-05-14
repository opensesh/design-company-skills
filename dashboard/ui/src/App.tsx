import { useEffect, useState } from 'react'

const ASCII_LOGO = `██████╗ ███████╗███████╗██╗ ██████╗ ███╗   ██╗     ██████╗ ██████╗ ███████╗
██╔══██╗██╔════╝██╔════╝██║██╔════╝ ████╗  ██║    ██╔═══██╗██╔══██╗██╔════╝
██║  ██║█████╗  ███████╗██║██║  ███╗██╔██╗ ██║    ██║   ██║██████╔╝███████╗
██║  ██║██╔══╝  ╚════██║██║██║   ██║██║╚██╗██║    ██║   ██║██╔═══╝ ╚════██║
██████╔╝███████╗███████║██║╚██████╔╝██║ ╚████║    ╚██████╔╝██║     ███████║
╚═════╝ ╚══════╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝     ╚═════╝ ╚═╝     ╚══════╝`

type ThemeMode = 'light' | 'dark'

function getInitialTheme(): ThemeMode {
  const stored = localStorage.getItem('theme') as ThemeMode | null
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <pre className="text-aperol font-mono text-[6px] leading-none select-none hidden xl:block">
          {ASCII_LOGO}
        </pre>
        <h1 className="xl:hidden text-aperol font-bold tracking-widest text-lg">
          DESIGN-OPS
        </h1>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted transition"
        >
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </header>

      <main className="flex-1 grid place-items-center p-6">
        <div className="max-w-md text-center space-y-3">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">
            Scaffold ready
          </p>
          <h2 className="text-2xl font-semibold">
            React + Vite + Tailwind + shadcn
          </h2>
          <p className="text-sm text-muted-foreground">
            Brand tokens wired. Proxy to <code className="font-mono">/api</code>{' '}
            forwards to Fastify on 3847. Next: port the dashboard panels.
          </p>
        </div>
      </main>

      <footer className="px-6 py-3 border-t border-border bg-card text-xs text-muted-foreground">
        Open Session · DESIGN-OPS
      </footer>
    </div>
  )
}
