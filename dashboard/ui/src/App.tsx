import { Header } from '@/components/dashboard/header'
import { Footer } from '@/components/dashboard/footer'
import { Pillar } from '@/components/dashboard/pillar'
import { CalendarCard } from '@/components/dashboard/cards/calendar-card'
import { TasksCard } from '@/components/dashboard/cards/tasks-card'
import { EmailCard } from '@/components/dashboard/cards/email-card'
import { CommitsCard } from '@/components/dashboard/cards/commits-card'
import { PRsCard } from '@/components/dashboard/cards/prs-card'
import { DeploymentsCard } from '@/components/dashboard/cards/deployments-card'
import { LinksCard } from '@/components/dashboard/cards/links-card'
import { InstagramCard } from '@/components/dashboard/cards/instagram-card'
import { useRefresh } from '@/hooks/use-refresh'

export default function App() {
  const { token, refresh, lastRefresh } = useRefresh()

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header onRefresh={refresh} lastRefresh={lastRefresh} isRefreshing={false} />

      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
        <Pillar letter="O" label="Operations">
          <CalendarCard refreshToken={token} />
          <TasksCard refreshToken={token} />
          <EmailCard refreshToken={token} />
        </Pillar>

        <Pillar letter="D" label="Design">
          <CommitsCard refreshToken={token} />
          <PRsCard refreshToken={token} />
        </Pillar>

        <Pillar letter="A" label="Analytics">
          <DeploymentsCard refreshToken={token} />
          <LinksCard refreshToken={token} />
          <InstagramCard refreshToken={token} />
        </Pillar>
      </main>

      <Footer refreshToken={token} />
    </div>
  )
}
