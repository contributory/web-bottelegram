import { useEffect, lazy, Suspense } from 'react'
import { useBotStore } from '@/store/botStore'
import { useBotConnection } from '@/hooks/useBotConnection'
import { ThemeProvider } from '@/components/ThemeProvider'
import { LoadingSpinner } from '@/components/LoadingSpinner'

// Lazy load components that aren't needed immediately
const Sidebar = lazy(() => import('@/components/Sidebar').then(m => ({ default: m.Sidebar })))
const ChatArea = lazy(() => import('@/components/ChatArea').then(m => ({ default: m.ChatArea })))
const CallbackNotification = lazy(() => import('@/components/CallbackNotification').then(m => ({ default: m.CallbackNotification })))

export function App() {
  const { theme } = useBotStore()
  
  // Initialize bot connection and polling
  useBotConnection()

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement
    
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.setAttribute('data-theme', isDark ? 'dark' : 'light')
    } else {
      root.setAttribute('data-theme', theme)
    }
  }, [theme])

  return (
    <ThemeProvider>
      <Suspense fallback={
        <div className="flex h-screen items-center justify-center bg-background">
          <LoadingSpinner />
        </div>
      }>
        <div className="grid h-screen grid-cols-1 gap-3 overflow-hidden bg-background p-3 text-foreground md:grid-cols-[320px_1fr] md:p-4">
          <Sidebar className="h-full rounded-2xl" />
          <section className="relative flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/45 shadow-[0_0_0_1px_hsl(var(--primary)/0.2),0_20px_70px_hsl(var(--background)/0.75)]">
            <ChatArea />
            <CallbackNotification />
          </section>
        </div>
      </Suspense>
    </ThemeProvider>
  )
}
