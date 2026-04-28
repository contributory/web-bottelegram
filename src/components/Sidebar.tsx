import { useState, useEffect } from "react";
import { useBotStore } from "@/store/botStore";
import { useBotConnection } from "@/hooks/useBotConnection";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatList } from "@/components/ChatList";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Sun, Moon, Monitor, Menu, X, MessageSquare } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  // Default to hidden on small screens
  const [isHidden, setIsHidden] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768; // md breakpoint
    }
    return false;
  });

  // Update isHidden when window is resized
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsHidden(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [openChatInput, setOpenChatInput] = useState("");
  const { theme, setTheme } = useTheme();
  const { isConnected, pollingStatus, lastError, botInfo } = useBotConnection();
  const { token } = useBotStore();
  const { t } = useTranslation();

  const handleOpenChat = async () => {
    const chatId = openChatInput.trim();
    if (!chatId) return;

    console.log("Opening chat:", chatId);
    setOpenChatInput("");
  };

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getThemeIcon = () => {
    if (theme === "light") return <Sun className="h-4 w-4" />;
    if (theme === "dark") return <Moon className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <>
      {/* Toggle button - always visible */}
      {isHidden && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 hud-glow border border-border/70 bg-card/80 backdrop-blur-md"
          onClick={() => setIsHidden(false)}
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}

      <aside
        className={cn(
          "w-full hud-panel relative flex flex-col transition-transform duration-300 ease-in-out",
          "absolute inset-y-0 left-0 z-40 md:relative md:inset-auto",
          isHidden && "-translate-x-full",
          className
        )}
      >
        {/* Header */}
        <div className="border-b border-border/80 p-4">
          <div className="flex items-center justify-between">
            <div className="relative">
              <MessageSquare className="h-5 w-5 text-primary" />
              {/* Connection indicator */}
              <div
                className={cn(
                  "absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-background transition-colors duration-300",
                  pollingStatus === "polling"
                    ? "bg-green-500 animate-pulse"
                    : pollingStatus === "error"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                )}
                title={lastError || pollingStatus}
              />
            </div>
            <h1 className="font-semibold text-lg hud-title">
              {botInfo.name || "Bottlegram"}
            </h1>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsHidden(true)}
              title="Close sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-3 rounded-lg border border-border/70 bg-background/45 p-3">
            {token && (
              <p className="text-xs text-muted-foreground">
                {isConnected
                  ? botInfo.name
                    ? `${t("connection.connected")}: ${botInfo.name}`
                    : t("connection.connected")
                  : pollingStatus === "error"
                  ? lastError || "Error"
                  : t("connection.connecting")}
              </p>
            )}
            {!token && (
              <p className="text-xs text-red-500">{t("chat.noToken")}</p>
            )}
          </div>

          <div className="mt-3 flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={t("chat.toggleTheme")}
            >
              {getThemeIcon()}
            </Button>

            <SettingsDialog />
          </div>
        </div>

        {/* Open Chat Section */}
        <div className="border-b border-border/80 p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-primary/85">
            Jump to channel
          </p>
          <div className="flex gap-2">
            <Input
              placeholder={t("chat.enterChatId")}
              value={openChatInput}
              onChange={(e) => setOpenChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleOpenChat();
                }
              }}
              className="flex-1"
            />
            <Button
              onClick={handleOpenChat}
              size="sm"
              disabled={!openChatInput.trim()}
            >
              →
            </Button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-hidden p-2">
          <ChatList />
        </div>
      </aside>

      {/* Overlay when sidebar is open on small screens */}
      {!isHidden && (
        <div
          className="fixed inset-0 bg-background/75 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsHidden(true)}
        />
      )}
    </>
  );
}
