import { useEffect, lazy, Suspense, useState } from 'react'
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
  // Track sidebar visibility to dynamically adjust grid
  const [sidebarHidden, setSidebarHidden] = useState(false)
  
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
        <div className={`
          grid h-screen gap-3 overflow-hidden bg-background p-3 text-foreground md:p-4
          ${sidebarHidden ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-[320px_1fr]'}
        `}>
          <Sidebar 
            className="h-full rounded-2xl" 
            onToggle={(hidden) => setSidebarHidden(hidden)} 
          />
          <section className="relative flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/45 shadow-[0_0_0_1px_hsl(var(--primary)/0.2),0_20px_70px_rgba(0,0,0,0.3)]">
            <ChatArea />
            <CallbackNotification />
          </section>
        </div>
      </Suspense>
    </ThemeProvider>
  )
}
