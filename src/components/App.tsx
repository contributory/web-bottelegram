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
        <div className="relative flex h-screen overflow-hidden bg-background text-foreground">
          <Sidebar />
          <ChatArea />
          <CallbackNotification />
        </div>
      </Suspense>
    </ThemeProvider>
  )
}