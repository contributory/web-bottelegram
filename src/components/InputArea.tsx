import React, { useState, useRef, useEffect } from "react";
import { useBotStore } from "@/store/botStore";
import { botService } from "@/services/botService";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Smile, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { StickerPanel } from "@/components/input/StickerPanel";
import { useSendFiles } from "@/components/input/useSendFiles";
import { useSendSticker } from "@/components/input/useSendSticker";

interface InputAreaProps {
    className?: string;
    isDraggingGlobal?: boolean;
}

// Helper to check if file is image
const isImageFile = (file: File) => {
    return file.type.startsWith("image/");
};

// Helper to check if file is video
const isVideoFile = (file: File) => {
    return file.type.startsWith("video/");
};

// Helper to check if file is audio
const isAudioFile = (file: File) => {
    return file.type.startsWith("audio/");
};

// Helper to get file icon
const getFileIcon = (file: File): string => {
    if (isImageFile(file)) return "🖼️";
    if (isVideoFile(file)) return "🎬";
    if (isAudioFile(file)) return "🎵";
    if (file.type.includes("pdf")) return "📕";
    if (file.type.includes("zip") || file.type.includes("rar") || file.type.includes("7z")) return "📦";
    if (file.type.includes("text")) return "📝";
    if (file.type.includes("word") || file.name.endsWith(".doc") || file.name.endsWith(".docx")) return "📘";
    if (file.type.includes("excel") || file.name.endsWith(".xls") || file.name.endsWith(".xlsx")) return "📊";
    if (file.type.includes("powerpoint") || file.name.endsWith(".ppt") || file.name.endsWith(".pptx")) return "📙";
    return "📄";
};

// Helper to format file size
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};

// Helper to create object URL for preview
const getFilePreviewUrl = (file: File): string | null => {
    if (isImageFile(file)) {
        return URL.createObjectURL(file);
    }
    return null;
};

export function InputArea({ className, isDraggingGlobal = false }: InputAreaProps) {
    const [message, setMessage] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [showKeyboardBuilder, setShowKeyboardBuilder] = useState(false);
    const [inlineKeyboard, setInlineKeyboard] = useState<Array<Array<{ text: string; callback_data?: string; url?: string }>>>([]);
    const chatActionTimer = useRef<number | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const stickerPanelRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    const {
        getCurrentActiveChatId,
        getCurrentChats,
        replyTo,
        setReplyTo,
        editingMessageId,
        setEditingMessageId,
        isConnected,
        addMessage,
        updateMessage,
        preferences,
    } = useBotStore();

    const activeChatId = getCurrentActiveChatId();
    const chats = getCurrentChats();
    const activeChat = activeChatId ? chats?.get(activeChatId) : null;

    const replyMessage =
        replyTo && activeChat
            ? activeChat.messages.find((m: any) => m.id.toString() === replyTo)
            : null;

    const editingMsg =
        editingMessageId && activeChat
            ? activeChat.messages.find(
                  (m: any) => m.id.toString() === editingMessageId,
              )
            : null;

    // File sending hook
    const {
        selectedFiles,
        setSelectedFiles,
        isSendingFiles,
        sendSelectedFiles,
    } = useSendFiles({
        activeChatId,
        isConnected,
        replyTo,
        replyMessage,
        setReplyTo,
        message,
        setMessage,
    });

    // Sticker sending hook
    const {
        showStickerPanel,
        setShowStickerPanel,
        stickerFileId,
        setStickerFileId,
        isSendingSticker,
        recentStickers,
        favoriteStickers,
        isStickerFavorite,
        toggleFavoriteSticker,
        handleSendStickerById,
        handleSendStickerFromRecent,
        toggleStickerPanel,
    } = useSendSticker({
        activeChatId,
        isConnected,
        replyTo,
        replyMessage,
        setReplyTo,
    });

    // Set message when editing
    useEffect(() => {
        if (editingMsg && editingMsg.text != null) {
            setMessage(editingMsg.text);
            // Load existing keyboard if any
            if (editingMsg.reply_markup && editingMsg.reply_markup.length > 0) {
                setInlineKeyboard(editingMsg.reply_markup);
                setShowKeyboardBuilder(true);
            } else {
                setInlineKeyboard([]);
                setShowKeyboardBuilder(false);
            }
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
                textareaRef.current.style.height =
                    Math.min(textareaRef.current.scrollHeight, 120) + "px";
                textareaRef.current.focus();
            }
            setIsFocused(true);
        } else {
            // Reset keyboard when not editing
            if (!editingMessageId) {
                setInlineKeyboard([]);
                setShowKeyboardBuilder(false);
            }
        }
    }, [editingMessageId, editingMsg]);

    // Debug: Log selectedFiles changes
    useEffect(() => {
        console.log('[InputArea] selectedFiles changed:', selectedFiles.length, selectedFiles);
    }, [selectedFiles]);

    // Sync Telegram chat action "typing" while input is focused
    useEffect(() => {
        if (!isConnected || !activeChatId) return;

        if (chatActionTimer.current) {
            clearInterval(chatActionTimer.current);
            chatActionTimer.current = null;
        }

        if (isFocused) {
            const send = () => {
                botService.sendChatAction(activeChatId, "typing");
            };
            send();
            chatActionTimer.current = window.setInterval(send, 4000);
        }

        return () => {
            if (chatActionTimer.current) {
                clearInterval(chatActionTimer.current);
                chatActionTimer.current = null;
            }
        };
    }, [isFocused, isConnected, activeChatId]);

    // Close sticker panel on outside click
    useEffect(() => {
        const onDocMouseDown = (e: MouseEvent) => {
            const target = e.target as Node;
            const insideSticker =
                stickerPanelRef.current?.contains(target) ?? false;
            if (!insideSticker && showStickerPanel) {
                setShowStickerPanel(false);
            }
        };
        document.addEventListener("mousedown", onDocMouseDown);
        return () => document.removeEventListener("mousedown", onDocMouseDown);
    }, [showStickerPanel]);

    // Handle paste for clipboard images
    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        const files: File[] = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === "file") {
                const file = item.getAsFile();
                if (file) {
                    files.push(file);
                }
            }
        }

        if (files.length > 0) {
            e.preventDefault();
            setSelectedFiles((prev) => [...prev, ...files]);
        }
    };

    // Drag and drop handlers - simplified
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const files = Array.from(e.dataTransfer.files);
        console.log('[InputArea] Files dropped:', files.length, files);
        if (files.length > 0) {
            setSelectedFiles((prev) => {
                const newFiles = [...prev, ...files];
                console.log('[InputArea] Updated selectedFiles:', newFiles.length);
                return newFiles;
            });
        }
    };

    const handleSend = async () => {
        console.log('[InputArea] handleSend called, selectedFiles:', selectedFiles.length, 'message:', message.trim(), 'inlineKeyboard:', inlineKeyboard.length);
        
        // If there are files, send files with caption
        if (selectedFiles.length > 0) {
            console.log('[InputArea] Sending files...');
            await sendSelectedFiles();
            return;
        }

        const textToSend = message.trim();
        if (!textToSend || !activeChatId || !isConnected) {
            console.log('[InputArea] Cannot send - textToSend:', textToSend, 'activeChatId:', activeChatId, 'isConnected:', isConnected);
            return;
        }

        // If editing
        if (editingMessageId) {
            const msgId = parseInt(editingMessageId);
            
            // Always send reply_markup - use empty array to remove keyboard
            const replyMarkup = inlineKeyboard.length > 0 
                ? { inline_keyboard: inlineKeyboard } 
                : { inline_keyboard: [] };

            let response = await botService.editMessageText(
                activeChatId,
                msgId,
                textToSend,
                {
                    parse_mode: preferences.parseMode !== 'None' ? preferences.parseMode : undefined,
                    reply_markup: replyMarkup,
                }
            );

            // If failed with parse mode, retry without it
            if (!response.ok && preferences.parseMode !== 'None') {
                console.log('[InputArea] Edit failed with parse mode, retrying without parse mode...');
                response = await botService.editMessageText(
                    activeChatId,
                    msgId,
                    textToSend,
                    {
                        reply_markup: replyMarkup,
                    }
                );
            }

            if (response.ok) {
                updateMessage(activeChatId, msgId, { 
                    text: textToSend,
                    reply_markup: inlineKeyboard.length > 0 ? inlineKeyboard : undefined,
                });
                setReplyTo(null);
            } else {
                console.error('[InputArea] Failed to edit message:', response);
                alert(`Không thể sửa tin nhắn: ${response.description || 'Unknown error'}`);
            }
            
            setEditingMessageId(null);
            setMessage("");
            setInlineKeyboard([]);
            setShowKeyboardBuilder(false);
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
            return;
        }

        // Clear input immediately
        setMessage("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        const replyToId = replyTo ? parseInt(replyTo) : undefined;

        try {
            console.log('[InputArea] Sending message with options:', {
                chatId: activeChatId,
                text: textToSend,
                replyToId,
                inlineKeyboard,
                parseMode: preferences.parseMode !== 'None' ? preferences.parseMode : undefined
            });
            
            let response = await botService.sendMessage(
                activeChatId,
                textToSend,
                {
                    reply_to_message_id: replyToId,
                    reply_markup: inlineKeyboard.length > 0 ? { inline_keyboard: inlineKeyboard } : undefined,
                    parse_mode: preferences.parseMode !== 'None' ? preferences.parseMode : undefined,
                },
            );

            // If failed with parse mode, retry without it
            if (!response.ok && preferences.parseMode !== 'None') {
                console.log('[InputArea] Failed with parse mode, retrying without parse mode...');
                response = await botService.sendMessage(
                    activeChatId,
                    textToSend,
                    {
                        reply_to_message_id: replyToId,
                        reply_markup: inlineKeyboard.length > 0 ? { inline_keyboard: inlineKeyboard } : undefined,
                    },
                );
            }

            console.log('[InputArea] Response from sendMessage:', response);

            if (response.ok && response.result) {
                console.log('[InputArea] Message sent successfully:', response.result);
                const sentMessage = response.result;
                const newMessage = {
                    id: sentMessage.message_id,
                    type: "text" as const,
                    side: "right" as const,
                    text: sentMessage.text,
                    date: sentMessage.date * 1000,
                    fromId: sentMessage.from?.id,
                    fromName: sentMessage.from?.first_name || t("chat.you"),
                    reply_to: replyToId,
                    reply_preview: replyMessage?.text?.substring(0, 50),
                    reply_markup: inlineKeyboard.length > 0 ? inlineKeyboard : undefined,
                };
                addMessage(activeChatId, newMessage);
                setReplyTo(null);
                setInlineKeyboard([]);
                setShowKeyboardBuilder(false);
            } else {
                console.error('[InputArea] Failed to send message:', response);
                alert(`Không thể gửi tin nhắn: ${response.description || 'Unknown error'}`);
                // Restore message so user can edit
                setMessage(textToSend);
            }
        } catch (error) {
            console.error("[InputArea] Error sending message:", error);
            alert(`Lỗi khi gửi tin nhắn: ${error instanceof Error ? error.message : 'Unknown error'}`);
            // Restore message so user can edit
            setMessage(textToSend);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleTextareaChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
        setMessage(e.target.value);

        // Auto-resize textarea
        const textarea = e.target;
        textarea.style.height = "auto";
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    };

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const selected = Array.from(files);
        setSelectedFiles((prev) => [...prev, ...selected]);
        // Reset input so selecting the same file again still triggers change
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeSelectedFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const clearSelectedFiles = () => {
        setSelectedFiles([]);
    };

    const cancelReply = () => {
        setReplyTo(null);
    };

    const addKeyboardRow = () => {
        setInlineKeyboard([...inlineKeyboard, [{ text: "Nút mới", callback_data: "action" }]]);
    };

    const addKeyboardButton = (rowIndex: number) => {
        const newKeyboard = [...inlineKeyboard];
        if (!newKeyboard[rowIndex]) {
            newKeyboard[rowIndex] = [];
        }
        newKeyboard[rowIndex] = [...newKeyboard[rowIndex], { text: "Nút mới", callback_data: "action" }];
        setInlineKeyboard(newKeyboard);
    };

    const updateKeyboardButton = (rowIndex: number, btnIndex: number, field: 'text' | 'callback_data' | 'url', value: string) => {
        const newKeyboard = [...inlineKeyboard];
        newKeyboard[rowIndex][btnIndex] = { ...newKeyboard[rowIndex][btnIndex], [field]: value };
        setInlineKeyboard(newKeyboard);
    };

    const removeKeyboardButton = (rowIndex: number, btnIndex: number) => {
        const newKeyboard = [...inlineKeyboard];
        newKeyboard[rowIndex].splice(btnIndex, 1);
        if (newKeyboard[rowIndex].length === 0) {
            newKeyboard.splice(rowIndex, 1);
        }
        setInlineKeyboard(newKeyboard);
    };

    return (
        <div
            ref={dropZoneRef}
            className={cn(
                "border-t border-border/80 bg-background/72 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55 relative",
                className,
            )}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* Global Drag overlay - covers entire chat area */}
            {isDraggingGlobal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-sm pointer-events-none">
                    <div className="text-center pointer-events-none">
                        <Paperclip className="h-12 w-12 mx-auto mb-3 text-primary animate-bounce" />
                        <p className="text-lg font-medium text-primary">
                            Thả file vào đây để gửi
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Hỗ trợ tất cả loại file
                        </p>
                    </div>
                </div>
            )}

            {/* Reply Context */}
            {replyTo && replyMessage && (
                <div className="flex items-center gap-2 px-4 py-2 border-b border-border/70 bg-muted/35">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">
                            {t("chat.replyingTo")}
                        </p>
                        <p className="text-sm truncate">{replyMessage.text}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={cancelReply}
                        className="h-6 w-6 p-0"
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            )}

            {/* Editing Context */}
            {editingMessageId && editingMsg && (
                <div className="flex items-center gap-2 px-4 py-2 border-b border-border/70 bg-muted/35">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">
                            {t("chat.editing")}
                            {editingMsg.reply_markup && editingMsg.reply_markup.length > 0 && 
                                <span className="ml-2 text-primary">• Có {editingMsg.reply_markup.reduce((sum, row) => sum + row.length, 0)} nút</span>
                            }
                        </p>
                        <p className="text-sm truncate">{editingMsg.text}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setEditingMessageId(null);
                            setInlineKeyboard([]);
                            setShowKeyboardBuilder(false);
                        }}
                        className="h-6 w-6 p-0"
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            )}

            {/* Inline Keyboard Builder */}
            {showKeyboardBuilder && (
                <div className="px-4 py-3 border-b bg-muted/30">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <span className="text-sm font-semibold">Inline Keyboard</span>
                            <p className="text-xs text-muted-foreground">Thêm nút tương tác vào tin nhắn</p>
                        </div>
                        <div className="flex gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={addKeyboardRow}
                                className="h-8 px-3 text-xs"
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                Thêm hàng
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setShowKeyboardBuilder(false);
                                    setInlineKeyboard([]);
                                }}
                                className="h-8 px-2"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {inlineKeyboard.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground text-sm">
                                <span className="text-2xl block mb-2">⌨️</span>
                                Chưa có nút nào. Click "Thêm hàng" để bắt đầu.
                            </div>
                        ) : (
                            inlineKeyboard.map((row, rowIdx) => (
                                <div key={rowIdx} className="space-y-2 p-3 border rounded-lg bg-background/50">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            Hàng {rowIdx + 1}
                                        </span>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addKeyboardButton(rowIdx)}
                                                className="h-6 px-2 text-xs"
                                            >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Nút
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const newKeyboard = [...inlineKeyboard];
                                                    newKeyboard.splice(rowIdx, 1);
                                                    setInlineKeyboard(newKeyboard);
                                                }}
                                                className="h-6 px-2 text-xs text-destructive"
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {row.map((btn, btnIdx) => (
                                            <div key={btnIdx} className="flex flex-col gap-1.5 p-2 border rounded-md bg-card min-w-[200px]">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-medium">Nút {btnIdx + 1}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeKeyboardButton(rowIdx, btnIdx)}
                                                        className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div>
                                                        <label className="text-xs text-muted-foreground">Văn bản hiển thị</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Ví dụ: Xem thêm"
                                                            value={btn.text}
                                                            onChange={(e) => updateKeyboardButton(rowIdx, btnIdx, 'text', e.target.value)}
                                                            onKeyDown={(e) => e.stopPropagation()}
                                                            className="w-full px-2 py-1.5 text-sm border rounded bg-background"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-muted-foreground">Loại nút</label>
                                                        <select
                                                            value={btn.url ? 'url' : 'callback'}
                                                            onChange={(e) => {
                                                                const newKeyboard = [...inlineKeyboard];
                                                                if (e.target.value === 'url') {
                                                                    newKeyboard[rowIdx][btnIdx] = { text: btn.text, url: '' };
                                                                } else {
                                                                    newKeyboard[rowIdx][btnIdx] = { text: btn.text, callback_data: '' };
                                                                }
                                                                setInlineKeyboard(newKeyboard);
                                                            }}
                                                            className="w-full px-2 py-1.5 text-sm border rounded bg-background"
                                                        >
                                                            <option value="callback">Callback (Xử lý bởi bot)</option>
                                                            <option value="url">Link (Mở URL)</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-muted-foreground">
                                                            {btn.url ? 'URL' : 'Callback Data'}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder={btn.url ? "https://example.com" : "action_name"}
                                                            value={btn.callback_data || btn.url || ''}
                                                            onChange={(e) => {
                                                                const field = btn.url ? 'url' : 'callback_data';
                                                                updateKeyboardButton(rowIdx, btnIdx, field, e.target.value);
                                                            }}
                                                            onKeyDown={(e) => e.stopPropagation()}
                                                            className="w-full px-2 py-1.5 text-sm border rounded bg-background font-mono"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* File Preview Area - Integrated into input */}
            {selectedFiles.length > 0 && (
                <div className="px-3 pt-3 border-b bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                            {selectedFiles.length} tệp đã chọn
                        </span>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleFileSelect}
                                className="h-7 px-2 text-xs"
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                Thêm
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearSelectedFiles}
                                className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                            >
                                Xóa hết
                            </Button>
                        </div>
                    </div>

                    {/* File thumbnails */}
                    <div className="flex gap-2 pb-3 overflow-x-auto">
                        {selectedFiles.map((file, idx) => {
                            const isImage = isImageFile(file);
                            const previewUrl = isImage
                                ? getFilePreviewUrl(file)
                                : null;
                            const fileIcon = getFileIcon(file);
                            const fileSize = formatFileSize(file.size);

                            return (
                                <div
                                    key={`${file.name}-${idx}`}
                                    className="relative group flex-shrink-0"
                                >
                                    {isImage && previewUrl ? (
                                        <div className="w-20 h-20 rounded-lg overflow-hidden border bg-muted">
                                            <img
                                                src={previewUrl}
                                                alt={file.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 rounded-lg border bg-muted flex flex-col items-center justify-center p-2">
                                            <span className="text-2xl mb-1">{fileIcon}</span>
                                            <p className="text-[9px] text-center truncate w-full font-medium">
                                                {file.name.length > 10
                                                    ? file.name.substring(0, 10) + "..."
                                                    : file.name}
                                            </p>
                                            <p className="text-[8px] text-muted-foreground">
                                                {fileSize}
                                            </p>
                                        </div>
                                    )}
                                    {/* Remove button */}
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="absolute -top-1 -right-1 h-5 w-5 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeSelectedFile(idx)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                    {/* File name tooltip on hover */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white text-[8px] p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity truncate">
                                        {file.name}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Typing Indicator */}
            {isFocused &&
                isConnected &&
                activeChatId &&
                !selectedFiles.length && (
                    <div className="px-4 py-1 border-b flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                            {t("chat.composing")}
                        </p>
                        <span className="text-xs text-muted-foreground">
                            {preferences.parseMode !== 'None' && (
                                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-medium">
                                    {preferences.parseMode}
                                </span>
                            )}
                        </span>
                    </div>
                )}

            <div className="relative flex items-end gap-2 p-3 md:p-4">
                <div
                    className={cn(
                        "flex items-end gap-2 w-full bg-card/60 border rounded-2xl px-2 py-2 shadow-sm transition-all",
                        isFocused
                            ? "ring-2 ring-ring ring-offset-2 ring-offset-background"
                            : "hover:shadow-md",
                    )}
                >
                    {/* Attach Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleFileSelect}
                        disabled={!isConnected || !activeChatId}
                        className="shrink-0"
                    >
                        <Paperclip className="h-4 w-4" />
                    </Button>

                    {/* Message Input */}
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={handleTextareaChange}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onPaste={handlePaste}
                            placeholder={
                                selectedFiles.length > 0
                                    ? "Thêm chú thích (tùy chọn)..."
                                    : editingMessageId
                                      ? t("chat.editing")
                                      : !isConnected
                                        ? t("chat.disconnected")
                                        : !activeChatId
                                          ? t("chat.selectChat")
                                          : t("chat.typeMessage")
                            }
                            disabled={!isConnected || !activeChatId}
                            className={cn(
                                "w-full min-h-[40px] max-h-[120px] px-0 py-1 bg-transparent text-sm",
                                "placeholder:text-muted-foreground",
                                "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
                                "disabled:cursor-not-allowed disabled:opacity-50",
                                "resize-none",
                            )}
                            rows={1}
                        />
                    </div>

                    {/* Sticker/Emoji Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={!isConnected || !activeChatId}
                        className="shrink-0"
                        onClick={toggleStickerPanel}
                        aria-pressed={showStickerPanel}
                        aria-label="Sticker"
                    >
                        <Smile className="h-4 w-4" />
                    </Button>

                    {/* Keyboard Builder Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={!isConnected || !activeChatId || selectedFiles.length > 0}
                        className="shrink-0"
                        onClick={() => setShowKeyboardBuilder(!showKeyboardBuilder)}
                        aria-pressed={showKeyboardBuilder}
                        aria-label="Inline Keyboard"
                        title="Thêm nút tương tác (Inline Keyboard)"
                    >
                        <span className="text-sm">⌨️</span>
                    </Button>

                    {/* Send Button */}
                    <Button
                        onClick={() => {
                            console.log('[InputArea] Send button clicked');
                            console.log('[InputArea] State:', {
                                message: message.trim(),
                                selectedFiles: selectedFiles.length,
                                isConnected,
                                activeChatId,
                                isSendingFiles
                            });
                            handleSend();
                        }}
                        disabled={
                            (!message.trim() && selectedFiles.length === 0) ||
                            !isConnected ||
                            !activeChatId ||
                            isSendingFiles
                        }
                        size="icon"
                        className="shrink-0"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>

                {/* Sticker Panel */}
                {showStickerPanel && (
                    <div ref={stickerPanelRef}>
                        <StickerPanel
                            recentStickers={recentStickers}
                            favoriteStickers={favoriteStickers}
                            stickerFileId={stickerFileId}
                            setStickerFileId={setStickerFileId}
                            isSendingSticker={isSendingSticker}
                            isConnected={isConnected}
                            activeChatId={activeChatId}
                            onSendSticker={handleSendStickerFromRecent}
                            onSendStickerById={handleSendStickerById}
                            onToggleFavorite={toggleFavoriteSticker}
                            isStickerFavorite={isStickerFavorite}
                        />
                    </div>
                )}
            </div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                multiple
                accept="*/*"
            />
        </div>
    );
}
