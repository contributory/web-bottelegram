import { useRef, useState, useEffect } from 'react'
import { useBotStore } from '@/store/botStore'
import { useTranslation } from '@/i18n/useTranslation'
import { MessageList } from '@/components/MessageList'
import { InputArea } from '@/components/InputArea'
import { ChatInfoDialog } from '@/components/ChatInfoDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Wifi, WifiOff, ArrowDown, Paperclip } from 'lucide-react'
import { botService } from '@/services/botService'

export function ChatArea() {
  const [showNewMessageButton, setShowNewMessageButton] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [isDraggingFile, setIsDraggingFile] = useState(false)
  const dragCounterRef = useRef(0)
  const prevActiveChatIdRef = useRef<string | null>(null)
  const prevMessageCountRef = useRef<number>(0)

  const [openChatInput, setOpenChatInput] = useState('')
  const [openChatTitle, setOpenChatTitle] = useState('')
  const [openChatLoading, setOpenChatLoading] = useState(false)
  const [openChatError, setOpenChatError] = useState<string | null>(null)
  
  const {
    getCurrentActiveChatId,
    getCurrentChats,
    getCurrentBotInfo,
    isConnected,
    getOrCreateChat,
    setActiveChatId,
  } = useBotStore()
  
  const { t } = useTranslation()
  const activeChatId = getCurrentActiveChatId()
  const chats = getCurrentChats()
  const botInfo = getCurrentBotInfo()
  const activeChat = activeChatId ? chats?.get(activeChatId) : null

  const scrollToBottom = (smooth = false) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      })
      setShowNewMessageButton(false)
    }
  }

  const handleScroll = () => {
    if (!messagesContainerRef.current) return
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20
    
    if (!isAtBottom && !showNewMessageButton) {
      setShowNewMessageButton(true)
    } else if (isAtBottom && showNewMessageButton) {
      setShowNewMessageButton(false)
    }
  }

  // Auto scroll to bottom when chat opens or changes
  useEffect(() => {
    if (activeChatId && activeChat) {
      // Check if chat actually changed
      const chatChanged = prevActiveChatIdRef.current !== activeChatId
      
      if (chatChanged) {
        // Reset message count when switching chats
        prevMessageCountRef.current = activeChat.messages?.length || 0
        prevActiveChatIdRef.current = activeChatId
        
        // Scroll immediately when chat opens
        scrollToBottom(false)
      }
    }
  }, [activeChatId, activeChat])

  // Auto scroll when new messages arrive
  useEffect(() => {
    if (activeChat?.messages && messagesContainerRef.current) {
      const currentMessageCount = activeChat.messages.length
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100
      
      // Only auto-scroll if user is already near the bottom
      if (isNearBottom) {
        scrollToBottom(true)
        
        // Only play sound if this is a NEW message (not just switching chats)
        // Check if message count increased AND we're on the same chat
        const isNewMessage = currentMessageCount > prevMessageCountRef.current && 
                            prevActiveChatIdRef.current === activeChatId
        
        if (isNewMessage) {
          const lastMessage = activeChat.messages[activeChat.messages.length - 1]
          if (lastMessage && lastMessage.side === 'left') {
            playNotificationSound()
          }
        }
      }
      
      // Update the previous message count
      prevMessageCountRef.current = currentMessageCount
    }
  }, [activeChat?.messages?.length, activeChatId])

  const playNotificationSound = () => {
    // Simple notification sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (e) {
      // Ignore audio errors
    }
  }

  // Global drag and drop handler
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      dragCounterRef.current++
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDraggingFile(true)
      }
    }

    const handleDragLeave = (_e: DragEvent) => {
      dragCounterRef.current--
      if (dragCounterRef.current === 0) {
        setIsDraggingFile(false)
      }
    }

    const handleDragOver = (e: DragEvent) => {
      // Prevent default to allow drop
      e.preventDefault()
    }

    const handleDrop = (_e: DragEvent) => {
      // Reset drag state but don't prevent default - let InputArea handle the actual drop
      dragCounterRef.current = 0
      setIsDraggingFile(false)
    }

    document.addEventListener('dragenter', handleDragEnter)
    document.addEventListener('dragleave', handleDragLeave)
    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('drop', handleDrop)

    return () => {
      document.removeEventListener('dragenter', handleDragEnter)
      document.removeEventListener('dragleave', handleDragLeave)
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('drop', handleDrop)
    }
  }, [])

  const handleOpenChat = async () => {
    setOpenChatError(null)
    const raw = openChatInput.trim()
    if (!raw) return
    setOpenChatLoading(true)
    try {
      let chatId = ''
      let chatData: any = null

      if (raw.startsWith('@') || /[A-Za-z]/.test(raw)) {
        if (!isConnected) {
          throw new Error('Cần kết nối bot để tra cứu @username')
        }
        const uname = raw.startsWith('@') ? raw : `@${raw}`
        const res = await botService.getChat(uname)
        if (res.ok && (res as any).result) {
          const info: any = (res as any).result
          chatId = String(info.id)
          const title =
            info.title ||
            `${(info.first_name || '')} ${(info.last_name || '')}`.trim() ||
            info.username ||
            chatId
          const avatarText = (title || 'U').charAt(0).toUpperCase()
          chatData = {
            type: info.type || 'private',
            title,
            avatarText,
          }
        } else {
          throw new Error((res as any).description || 'Không tìm thấy chat')
        }
      } else {
        chatId = raw
        const title = openChatTitle.trim() || `Chat ${chatId}`
        const avatarText = (title || 'U').charAt(0).toUpperCase()
        chatData = {
          type: 'private',
          title,
          avatarText,
        }
      }

      getOrCreateChat(chatId, chatData)
      setActiveChatId(chatId)
      setOpenChatInput('')
      setOpenChatTitle('')
    } catch (e: any) {
      setOpenChatError(e?.message || 'Không thể mở chat')
    } finally {
      setOpenChatLoading(false)
    }
  }

  if (!activeChat) {
    return (
      <main className="flex min-h-0 flex-1 flex-col p-4 md:p-6">
        <div className="grid flex-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="hud-panel relative rounded-2xl p-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-primary/40 bg-primary/20 hud-glow">
              <span className="text-3xl">🛸</span>
            </div>
            <div className="mt-4 space-y-2">
              <h3 className="text-lg font-medium">{t('chat.noChatSelected')}</h3>
              <p className="text-muted-foreground">{t('chat.noChatSelectedDesc')}</p>
            </div>
            {botInfo.name && (
              <div className="mt-6 p-4 bg-muted/40 border border-border/70 rounded-lg">
                <p className="flex items-center justify-center gap-2 text-sm">
                  {isConnected ? (
                    <>
                      <Wifi className="h-4 w-4 text-green-500" />
                      <span>
                        {t('chat.connectedTo')} <strong>{botInfo.name}</strong>
                      </span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4 text-red-500" />
                      <span>{t('chat.notConnectedToBot')}</span>
                    </>
                  )}
                </p>
                {botInfo.username && (
                  <p className="text-xs text-muted-foreground mt-1">
                    @{botInfo.username}
                  </p>
                )}
              </div>
            )}

            <div className="mt-6 space-y-2 p-4 border border-border/80 rounded-lg text-left bg-background/45">
              <p className="text-sm font-medium">Mở chat mới</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Chat ID hoặc @username"
                  value={openChatInput}
                  onChange={(e) => setOpenChatInput(e.target.value)}
                  disabled={openChatLoading}
                />
                <Input
                  placeholder="Tiêu đề (tùy chọn)"
                  value={openChatTitle}
                  onChange={(e) => setOpenChatTitle(e.target.value)}
                  disabled={openChatLoading}
                />
                <Button
                  onClick={handleOpenChat}
                  disabled={openChatLoading || !openChatInput.trim()}
                >
                  {openChatLoading ? 'Đang mở...' : 'Mở chat'}
                </Button>
              </div>
              {openChatError && (
                <p className="text-xs text-destructive">{openChatError}</p>
              )}
              <p className="text-[10px] text-muted-foreground">
                Gợi ý: Nhập @channel/@group hoặc ID số. Với người dùng, bot chỉ nhắn nếu họ đã start bot.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border/80 bg-background/40 p-5">
              <p className="hud-title text-xs text-primary">Navigation</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Dùng panel bên trái để chuyển hội thoại nhanh, hoặc mở chat mới bằng ID/@username.
              </p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-background/40 p-5">
              <p className="hud-title text-xs text-primary">Transmission tips</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• Enter để gửi nhanh, Shift+Enter xuống dòng.</li>
                <li>• Kéo thả file vào khung chat để gửi media.</li>
                <li>• Có thể sửa/tạo inline keyboard cho tin nhắn.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative flex min-h-0 flex-1 flex-col p-3 md:p-4">
      {/* Global Drag Overlay */}
      {isDraggingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/45 backdrop-blur-sm pointer-events-none">
          <div className="text-center">
            <Paperclip className="h-16 w-16 mx-auto mb-4 text-primary animate-bounce" />
            <p className="text-2xl font-semibold text-primary mb-2">
              Thả file vào đây để gửi
            </p>
            <p className="text-sm text-muted-foreground">
              Hỗ trợ tất cả loại file
            </p>
          </div>
        </div>
      )}

      {/* Chat Header */}
      <div className="z-20 mb-3 flex items-center justify-between rounded-xl border border-border/80 bg-background/65 px-4 py-3 backdrop-blur-xl shadow-[0_6px_24px_hsl(var(--background)/0.55)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/90 text-primary-foreground rounded-md flex items-center justify-center font-semibold shadow-[0_0_18px_hsl(var(--primary)/0.5)]">
            {activeChat.avatarText}
          </div>
          <div>
            <h2 className="font-medium">{activeChat.title}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3 text-green-500" />
                  <span>{t('chat.active')}</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-red-500" />
                  <span>{t('chat.notConnected')}</span>
                </>
              )}
              <span>•</span>
              <span>
                {activeChat.members.size} {t('chat.members')}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ChatInfoDialog />
        </div>
      </div>

      {/* Messages Container */}
      <section className="relative min-h-0 flex-1 rounded-2xl border border-border/70 bg-background/35">
        <div
          ref={messagesContainerRef}
          className="h-full overflow-y-auto px-3 py-4 md:px-4 md:py-6"
          onScroll={handleScroll}
        >
          {activeChatId && <MessageList chatId={activeChatId} />}
        </div>
      </section>

      {/* New Message Overlay + Button */}
      {showNewMessageButton && (
        <>
          <div className="pointer-events-none absolute bottom-20 left-0 right-0 h-16 bg-gradient-to-t from-background/90 via-background/60 to-transparent" />
          <Button
            className="fixed bottom-24 right-4 md:right-6 rounded-full shadow-lg z-30 animate-slideIn hud-glow"
            onClick={() => scrollToBottom(true)}
            size="sm"
            aria-label={t('chat.newMessage')}
          >
            <ArrowDown className="h-4 w-4 mr-2" />
            {t('chat.newMessage')}
          </Button>
        </>
      )}

      {/* Input Area */}
      <div className="mt-3 overflow-hidden rounded-xl border border-border/80 bg-background/45">
        <InputArea isDraggingGlobal={isDraggingFile} />
      </div>
    </main>
  )
}
