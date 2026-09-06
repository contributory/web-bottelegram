import { Bot, GrammyError, HttpError, InputFile } from "grammy";

export interface BotConfig {
    token: string;
    proxyPrefix?: string;
}

export interface TelegramUpdate {
    update_id: number;
    message?: any;
    edited_message?: any;
    channel_post?: any;
    edited_channel_post?: any;
    callback_query?: any;
}

export class BotService {
    private bot: Bot | null = null;
    private config: BotConfig | null = null;
    private isRunning = false;
    private updateCallback: ((updates: TelegramUpdate[]) => void) | null = null;
    private statusCallback:
        | ((
              status: "idle" | "polling" | "error",
              error?: string | null,
          ) => void)
        | null = null;

    constructor() {}

    setConfig(config: BotConfig) {
        this.config = config;
        if (this.bot) {
            this.stop();
        }

        // Create bot with custom API root for CORS proxy support
        const botOptions: any = {};

        if (config.proxyPrefix) {
            // Format: proxy should forward to https://api.telegram.org
            // e.g., proxyPrefix = "https://cors-proxy.example.com"
            // will call: https://cors-proxy.example.com/bot{token}/method
            const apiRoot = config.proxyPrefix.replace(/\/+$/, "");
            botOptions.client = {
                apiRoot: apiRoot,
            };
            console.debug("[BotService] Using proxy apiRoot:", apiRoot);
        }

        this.bot = new Bot(config.token, botOptions);
        this.setupBot();
    }

    private setupBot() {
        if (!this.bot) return;

        // Handle all updates via middleware
        this.bot.on("message", (ctx) => {
            if (this.updateCallback) {
                const update: TelegramUpdate = {
                    update_id: ctx.update.update_id,
                    message: ctx.update.message,
                };
                this.updateCallback([update]);
            }
        });

        this.bot.on("edited_message", (ctx) => {
            if (this.updateCallback) {
                const update: TelegramUpdate = {
                    update_id: ctx.update.update_id,
                    edited_message: ctx.update.edited_message,
                };
                this.updateCallback([update]);
            }
        });

        this.bot.on("channel_post", (ctx) => {
            if (this.updateCallback) {
                const update: TelegramUpdate = {
                    update_id: ctx.update.update_id,
                    channel_post: ctx.update.channel_post,
                };
                this.updateCallback([update]);
            }
        });

        this.bot.on("edited_channel_post", (ctx) => {
            if (this.updateCallback) {
                const update: TelegramUpdate = {
                    update_id: ctx.update.update_id,
                    edited_channel_post: ctx.update.edited_channel_post,
                };
                this.updateCallback([update]);
            }
        });

        this.bot.on("callback_query", (ctx) => {
            if (this.updateCallback) {
                const update: TelegramUpdate = {
                    update_id: ctx.update.update_id,
                    callback_query: ctx.update.callback_query,
                };
                this.updateCallback([update]);
            }
        });

        // Error handler
        this.bot.catch((err) => {
            const ctx = err.ctx;
            console.error(
                `[BotService] Error while handling update ${ctx.update.update_id}:`,
            );
            const e = err.error;
            if (e instanceof GrammyError) {
                console.error("[BotService] Grammy error:", e.description);
                if (this.statusCallback) {
                    this.statusCallback("error", e.description);
                }
            } else if (e instanceof HttpError) {
                console.error("[BotService] HTTP error:", e);
                if (this.statusCallback) {
                    this.statusCallback("error", e.message);
                }
            } else {
                console.error("[BotService] Unknown error:", e);
                if (this.statusCallback) {
                    this.statusCallback("error", String(e));
                }
            }
        });
    }

    async getUpdates(
        offset?: number,
        timeout = 30,
    ): Promise<{
        ok: boolean;
        result?: TelegramUpdate[];
        description?: string;
        error_code?: number;
    }> {
        if (!this.bot) throw new Error("Bot not initialized");

        try {
            const updates = await this.bot.api.getUpdates({
                offset,
                timeout,
                allowed_updates: [
                    "message",
                    "edited_message",
                    "channel_post",
                    "edited_channel_post",
                ],
            });
            return { ok: true, result: updates };
        } catch (error: any) {
            return {
                ok: false,
                description:
                    error.description || error.message || "Unknown error",
                error_code: error.error_code || 0,
            };
        }
    }

    async getMe() {
        if (!this.bot) throw new Error("Bot not initialized");

        try {
            const me = await this.bot.api.getMe();
            return { ok: true, result: me };
        } catch (error) {
            return {
                ok: false,
                description:
                    error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async sendMessage(
        chatId: number | string,
        text: string,
        options?: {
            parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
            reply_to_message_id?: number;
            reply_markup?: {
                inline_keyboard: Array<Array<{
                    text: string;
                    callback_data?: string;
                    url?: string;
                    web_app?: { url: string };
                }>>;
            };
        },
    ) {
        if (!this.bot) throw new Error("Bot not initialized");

        try {
            const message = await this.bot.api.sendMessage(chatId, text, {
                parse_mode: options?.parse_mode,
                reply_parameters: options?.reply_to_message_id
                    ? { message_id: options.reply_to_message_id }
                    : undefined,
                reply_markup: options?.reply_markup as any,
            });
            return { ok: true, result: message };
        } catch (error) {
            return {
                ok: false,
                description:
                    error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async sendPhoto(
        chatId: number | string,
        photo: string | File,
        options?: { caption?: string; reply_to_message_id?: number },
    ) {
        if (!this.bot) throw new Error("Bot not initialized");

        try {
            let input;
            if (typeof photo === "string") {
                input = photo;
            } else {
                // Use File object directly for browser compatibility
                
                
                input = new InputFile(photo, photo.name || "photo.jpg");
            }
            const message = await this.bot.api.sendPhoto(chatId, input, {
                caption: options?.caption,
                reply_parameters: options?.reply_to_message_id
                    ? { message_id: options.reply_to_message_id }
                    : undefined,
            });
            return { ok: true, result: message };
        } catch (error) {
            return {
                ok: false,
                description:
                    error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async sendVideo(
        chatId: number | string,
        video: string | File,
        options?: { caption?: string; reply_to_message_id?: number },
    ) {
        if (!this.bot) throw new Error("Bot not initialized");

        try {
            let input;
            if (typeof video === "string") {
                input = video;
            } else {
                
                
                input = new InputFile(video, video.name || "video.mp4");
            }
            const message = await this.bot.api.sendVideo(chatId, input, {
                caption: options?.caption,
                reply_parameters: options?.reply_to_message_id
                    ? { message_id: options.reply_to_message_id }
                    : undefined,
            });
            return { ok: true, result: message };
        } catch (error) {
            return {
                ok: false,
                description:
                    error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async sendAudio(
        chatId: number | string,
        audio: string | File,
        options?: { caption?: string; reply_to_message_id?: number },
    ) {
        if (!this.bot) throw new Error("Bot not initialized");

        try {
            let input;
            if (typeof audio === "string") {
                input = audio;
            } else {
                
                
                input = new InputFile(audio, audio.name || "audio.mp3");
            }
            const message = await this.bot.api.sendAudio(chatId, input, {
                caption: options?.caption,
                reply_parameters: options?.reply_to_message_id
                    ? { message_id: options.reply_to_message_id }
                    : undefined,
            });
            return { ok: true, result: message };
        } catch (error) {
            return {
                ok: false,
                description:
                    error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async sendDocument(
        chatId: number | string,
        document: string | File,
        options?: { caption?: string; reply_to_message_id?: number },
    ) {
        if (!this.bot) throw new Error("Bot not initialized");

        try {
            let input;
            if (typeof document === "string") {
                input = document;
            } else {
                
                
                input = new InputFile(document, document.name || "document");
            }
            const message = await this.bot.api.sendDocument(chatId, input, {
                caption: options?.caption,
                reply_parameters: options?.reply_to_message_id
                    ? { message_id: options.reply_to_message_id }
                    : undefined,
            });
            return { ok: true, result: message };
        } catch (error) {
            return {
                ok: false,
                description:
                    error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async editMessageText(
        chatId: number | string,
        messageId: number,
        text: string,
        options?: {
            parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
            reply_markup?: {
                inline_keyboard: Array<Array<{
                    text: string;
                    callback_data?: string;
                    url?: string;
                    web_app?: { url: string };
                }>>;
            };
        },
    ) {
        if (!this.bot) throw new Error("Bot not initialized");

        try {
            const result = await this.bot.api.editMessageText(
                chatId,
                messageId,
                text,
                {
                    parse_mode: options?.parse_mode,
                    reply_markup: options?.reply_markup as any,
                },
            );
            return { ok: true, result };
        } catch (error) {
            return {
                ok: false,
                description:
                    error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async sendSticker(chatId: number | string, sticker: string) {
        if (!this.bot) throw new Error("Bot not initialized");

        try {
            const message = await this.bot.api.sendSticker(chatId, sticker);
            return { ok: true, result: message };
        } catch (error) {
            return {
                ok: false,
                description:
                    error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async deleteMessage(chatId: number | string, messageId: number) {
        if (!this.bot) throw new Error("Bot not initialized");

        try {
            const result = await this.bot.api.deleteMessage(chatId, messageId);
            return { ok: true, result };
        } catch (error) {
            return {
                ok: false,
                description:
                    error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async sendChatAction(
        chatId: number | string,
        action:
            | "typing"
            | "upload_photo"
            | "upload_video"
            | "upload_voice"
            | "upload_document",
    ) {
        if (!this.bot) throw new Error("Bot not initialized");

        try {
            const result = await this.bot.api.sendChatAction(chatId, action);
            return { ok: true, result };
        } catch (error) {
            return {
                ok: false,
                description:
                    error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async getFile(fileId: string) {
        if (!this.bot) throw new Error("Bot not initialized");

        try {
            const file = await this.bot.api.getFile(fileId);
            return { ok: true, result: file };
        } catch (error) {
            return {
                ok: false,
                description:
                    error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async getChat(chatId: number | string) {
        if (!this.bot) throw new Error("Bot not initialized");

        try {
            const chat = await this.bot.api.getChat(chatId);
            return { ok: true, result: chat };
        } catch (error) {
            return {
                ok: false,
                description:
                    error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async getChatAdministrators(chatId: number | string) {
        if (!this.bot) throw new Error("Bot not initialized");

        try {
            const admins = await this.bot.api.getChatAdministrators(chatId);
            return { ok: true, result: admins };
        } catch (error) {
            return {
                ok: false,
                description:
                    error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async banChatMember(
        chatId: number | string,
        userId: number,
        untilDate?: number,
    ) {
        if (!this.bot) throw new Error("Bot not initialized");

        try {
            const result = await this.bot.api.banChatMember(chatId, userId, {
                until_date: untilDate,
            });
            return { ok: true, result };
        } catch (error) {
            return {
                ok: false,
                description:
                    error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async promoteChatMember(
        chatId: number | string,
        userId: number,
        isAdmin: boolean,
    ) {
        if (!this.bot) throw new Error("Bot not initialized");

        try {
            const result = await this.bot.api.promoteChatMember(
                chatId,
                userId,
                {
                    can_manage_chat: isAdmin,
                    can_delete_messages: isAdmin,
                    can_manage_video_chats: isAdmin,
                    can_restrict_members: isAdmin,
                    can_promote_members: false,
                    can_change_info: isAdmin,
                    can_invite_users: isAdmin,
                    can_pin_messages: isAdmin,
                    is_anonymous: false,
                },
            );
            return { ok: true, result };
        } catch (error) {
            return {
                ok: false,
                description:
                    error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async deleteWebhook(dropPendingUpdates = false) {
        if (!this.bot) throw new Error("Bot not initialized");

        try {
            const result = await this.bot.api.deleteWebhook({
                drop_pending_updates: dropPendingUpdates,
            });
            return { ok: true, result };
        } catch (error) {
            return {
                ok: false,
                description:
                    error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async getMyCommands() {
        if (!this.bot) throw new Error("Bot not initialized");

        try {
            const commands = await this.bot.api.getMyCommands();
            return { ok: true, result: commands };
        } catch (error) {
            return {
                ok: false,
                description:
                    error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async setMyCommands(
        commands: Array<{ command: string; description: string }>,
    ) {
        if (!this.bot) throw new Error("Bot not initialized");

        try {
            const result = await this.bot.api.setMyCommands(commands);
            return { ok: true, result };
        } catch (error) {
            return {
                ok: false,
                description:
                    error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async setMyName(name?: string) {
        if (!this.bot) throw new Error("Bot not initialized");

        try {
            const result = await this.bot.api.setMyName(name || "");
            return { ok: true, result };
        } catch (error) {
            return {
                ok: false,
                description:
                    error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async setMyDescription(description?: string) {
        if (!this.bot) throw new Error("Bot not initialized");

        try {
            const result = await this.bot.api.setMyDescription(
                description || "",
            );
            return { ok: true, result };
        } catch (error) {
            return {
                ok: false,
                description:
                    error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async setMyShortDescription(shortDescription?: string) {
        if (!this.bot) throw new Error("Bot not initialized");

        try {
            const result = await this.bot.api.setMyShortDescription(
                shortDescription || "",
            );
            return { ok: true, result };
        } catch (error) {
            return {
                ok: false,
                description:
                    error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async getMyDescription() {
        if (!this.bot) throw new Error("Bot not initialized");

        try {
            const result = await this.bot.api.getMyDescription();
            return { ok: true, result };
        } catch (error) {
            return {
                ok: false,
                description:
                    error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async getMyShortDescription() {
        if (!this.bot) throw new Error("Bot not initialized");

        try {
            const result = await this.bot.api.getMyShortDescription();
            return { ok: true, result };
        } catch (error) {
            return {
                ok: false,
                description:
                    error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async answerCallbackQuery(
        callbackQueryId: string,
        options?: {
            text?: string;
            show_alert?: boolean;
            url?: string;
            cache_time?: number;
        },
    ) {
        if (!this.bot) throw new Error("Bot not initialized");

        try {
            const result = await this.bot.api.answerCallbackQuery(
                callbackQueryId,
                options,
            );
            return { ok: true, result };
        } catch (error) {
            return {
                ok: false,
                description:
                    error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    getFileUrl(filePath: string): string {
        if (!this.config) throw new Error("Bot not configured");

        // Use proxy if configured, otherwise direct Telegram URL
        if (this.config.proxyPrefix) {
            const proxyBase = this.config.proxyPrefix.replace(/\/+$/, "");
            return `${proxyBase}/file/bot${this.config.token}/${filePath}`;
        }

        const baseUrl = `https://api.telegram.org/file/bot${this.config.token}`;
        return `${baseUrl}/${filePath}`;
    }

    /**
     * Start polling for updates using grammy's built-in bot.start()
     */
    async start(
        updateCallback?: (updates: TelegramUpdate[]) => void,
        statusCallback?: (
            status: "idle" | "polling" | "error",
            error?: string | null,
        ) => void,
    ) {
        if (!this.bot) throw new Error("Bot not initialized");
        if (this.isRunning) {
            console.debug("[BotService] Bot is already running");
            return;
        }

        this.updateCallback = updateCallback || null;
        this.statusCallback = statusCallback || null;
        this.isRunning = true;

        console.debug(
            "[BotService] Starting grammy polling with bot.start()...",
        );

        if (statusCallback) statusCallback("polling");

        // Start grammy's built-in polling (non-blocking)
        this.bot.start({
            allowed_updates: [
                "message",
                "edited_message",
                "channel_post",
                "edited_channel_post",
                "callback_query",
            ],
            onStart: (botInfo) => {
                console.debug("[BotService] Bot started:", botInfo.username);
            },
        });
    }

    /**
     * Stop the bot gracefully
     */
    async stop() {
        if (!this.isRunning) return;

        console.debug("[BotService] Stopping bot...");
        this.isRunning = false;

        if (this.bot) {
            try {
                await this.bot.stop();
                console.debug("[BotService] Bot stopped successfully");
            } catch (error) {
                console.error("[BotService] Error stopping bot:", error);
            }
        }

        if (this.statusCallback) {
            this.statusCallback("idle");
        }
    }

    /**
     * Check if the bot is currently running
     */
    isPolling(): boolean {
        return this.isRunning;
    }

    /**
     * Alias for isPolling for backward compatibility
     */
    isActive(): boolean {
        return this.isRunning;
    }
}

// Global instance
export const botService = new BotService();
