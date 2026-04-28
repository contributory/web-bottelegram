export type Language = "vi" | "en";

export interface Translation {
    // App
    app: {
        initializing: string;
    };

    // Common
    common: {
        ok: string;
        cancel: string;
        save: string;
        delete: string;
        edit: string;
        search: string;
        loading: string;
        error: string;
        success: string;
        warning: string;
        info: string;
        confirm: string;
        close: string;
        back: string;
        next: string;
        previous: string;
        settings: string;
    };

    // Navigation
    nav: {
        chats: string;
        settings: string;
        about: string;
    };

    // Sidebar
    sidebar: {
        jumpToChannel: string;
        navigation: string;
        navigationDesc: string;
        transmissionTips: string;
        tipEnterSend: string;
        tipDragDrop: string;
        tipInlineKeyboard: string;
        openChat: string;
        chatIdPlaceholder: string;
        chatTitlePlaceholder: string;
        openButton: string;
        openButtonLoading: string;
        hintChatIdOrUsername: string;
        hintBotChat: string;
    };

    // Connection
    connection: {
        connected: string;
        disconnected: string;
        connecting: string;
        failed: string;
        testConnection: string;
        saveConnection: string;
    };

    // Bot
    bot: {
        token: string;
        tokenPlaceholder: string;
        tokenRequired: string;
        tokenFromBotFather: string;
        currentBot: string;
        botName: string;
        botUsername: string;
        botDescription: string;
        botShortDescription: string;
        botCommands: string;
        status: string;
        deleteWebhook: string;
        clearAllData: string;
    };

    // Chat
    chat: {
        searchChats: string;
        noChats: string;
        noChatsDesc: string;
        typeMessage: string;
        sendMessage: string;
        replyTo: string;
        cancelReply: string;
        editing: string;
        cancelEdit: string;
        attachFile: string;
        sendPhoto: string;
        sendDocument: string;
        emoji: string;
        newMessage: string;
        noChatSelected: string;
        noChatSelectedDesc: string;
        connectedTo: string;
        notConnectedToBot: string;
        active: string;
        notConnected: string;
        members: string;
        member: string;
        manageMembers: string;
        moreOptions: string;
        deleteChat: string;
        deleteChatConfirm: string;
        clearHistory: string;
        clearHistoryConfirm: string;
        enterChatId: string;
        noToken: string;
        toggleTheme: string;
        replyingTo: string;
        disconnected: string;
        selectChat: string;
        composing: string;
        you: string;
        // Message actions
        reply: string;
        edit: string;
        copy: string;
        forward: string;
        pin: string;
        select: string;
        cancel: string;
        selectAll: string;
        selectedCount: string;
        confirmDeleteSelected: string;
        confirmDeleteSelectedForAll: string;
        deleteForMe: string;
        deleteForAll: string;
        confirmDeleteForAll: string;
        // Chat info
        info: string;
        groupInfo: string;
        userInfo: string;
        type: string;
        openChat: string;
        dropFileToSend: string;
        supportedFileTypes: string;
    };

    // Settings
    settings: {
        title: string;
        description: string;
        connection: string;
        appearance: string;
        preferences: string;
        about: string;

        // Connection tab
        botConfig: string;
        botConfigDesc: string;
        proxy: string;
        proxyPlaceholder: string;
        proxyDesc: string;
        connectionNotes: string;
        connectionNote1: string;
        connectionNote2: string;
        connectionNote3: string;

        // Connection helpers
        quickSwitchBots: string;
        selectSavedBot: string;
        switchBot: string;

        // Bot profile editor
        botProfile: string;
        botProfileDesc: string;

        // Appearance tab
        theme: string;
        themeDesc: string;
        themeLight: string;
        themeDark: string;
        themeSystem: string;
        themeLightDesc: string;
        themeDarkDesc: string;
        themeSystemDesc: string;
        language: string;

        // Preferences tab
        appPreferences: string;
        appPreferencesDesc: string;
        autoScroll: string;
        autoScrollDesc: string;
        sound: string;
        soundDesc: string;
        push: string;
        pushDesc: string;
        dangerZone: string;
        dangerZoneDesc: string;
        clearAllDataDesc: string;

        // Bot History tab
        botHistory: string;
        botHistoryDesc: string;
        manageBotData: string;
        botTokens: string;
        noBotsFound: string;
        clearBotData: string;
        clearBotDataDesc: string;
        confirmClearBotData: string;

        // About tab
        aboutApp: string;
        version: string;
        framework: string;
        botApi: string;
        pollingStatus: string;
        polling: string;
        stopped: string;
        copyright: string;
        builtWith: string;
    };

    // Messages
    messages: {
        connectionSaved: string;
        connectionTesting: string;
        connectionSuccess: string;
        connectionFailed: string;
        webhookDeleting: string;
        webhookDeleted: string;
        webhookDeleteFailed: string;
        allDataCleared: string;
        confirmClearData: string;
        enterToken: string;
        enterTokenToTest: string;
        botInfoUpdated: string;
        botInfoUpdateFailed: string;
        switchedBot: string;
    };
}

export const translations: Record<Language, Translation> = {
    vi: {
        app: {
            initializing: "Đang khởi tạo ứng dụng...",
        },

        common: {
            ok: "OK",
            cancel: "Hủy",
            save: "Lưu",
            delete: "Xóa",
            edit: "Sửa",
            search: "Tìm kiếm",
            loading: "Đang tải...",
            error: "Lỗi",
            success: "Thành công",
            warning: "Cảnh báo",
            info: "Thông tin",
            confirm: "Xác nhận",
            close: "Đóng",
            back: "Quay lại",
            next: "Tiếp theo",
            previous: "Trước đó",
            settings: "Cài đặt",
        },

        nav: {
            chats: "Cuộc trò chuyện",
            settings: "Cài đặt",
            about: "Thông tin",
        },

        sidebar: {
            jumpToChannel: "Chuyển đến kênh",
            navigation: "Điều hướng",
            navigationDesc: "Dùng panel bên trái để chuyển hội thoại nhanh, hoặc mở chat mới bằng ID/@username.",
            transmissionTips: "Mẹo sử dụng",
            tipEnterSend: "Enter để gửi nhanh, Shift+Enter xuống dòng.",
            tipDragDrop: "Kéo thả file vào khung chat để gửi media.",
            tipInlineKeyboard: "Có thể sửa/tạo inline keyboard cho tin nhắn.",
            openChat: "Mở chat mới",
            chatIdPlaceholder: "Chat ID hoặc @username",
            chatTitlePlaceholder: "Tiêu đề (tùy chọn)",
            openButton: "Mở chat",
            openButtonLoading: "Đang mở...",
            hintChatIdOrUsername: "Nhập @channel/@group hoặc ID số.",
            hintBotChat: "Với người dùng, bot chỉ nhắn nếu họ đã start bot.",
            dropFileToSend: "Thả file vào đây để gửi",
            supportedFileTypes: "Hỗ trợ tất cả loại file",
        },

        connection: {
            connected: "Đã kết nối",
            disconnected: "Chưa kết nối",
            connecting: "Đang kết nối",
            failed: "Kết nối thất bại",
            testConnection: "Kiểm tra kết nối",
            saveConnection: "Lưu & Kết nối",
        },

        bot: {
            token: "Bot Token",
            tokenPlaceholder: "bot123456789:ABCDefghijklmnopqrstuvwxyz...",
            tokenRequired: "Vui lòng nhập Bot Token",
            tokenFromBotFather: "Nhận token từ @BotFather trên Telegram",
            currentBot: "Bot hiện tại",
            botName: "Tên",
            botUsername: "Username",
            botDescription: "Mô tả",
            botShortDescription: "Mô tả ngắn",
            botCommands: "Danh sách lệnh",
            status: "Trạng thái",
            deleteWebhook: "Xóa webhook",
            clearAllData: "Xóa tất cả dữ liệu",
        },

        chat: {
            searchChats: "Tìm kiếm cuộc trò chuyện...",
            noChats: "Chưa có cuộc trò chuyện nào",
            noChatsDesc: "Khi có tin nhắn đến, cuộc trò chuyện sẽ hiện ở đây.",
            typeMessage: "Nhập tin nhắn...",
            sendMessage: "Gửi tin nhắn",
            replyTo: "Trả lời",
            cancelReply: "Hủy trả lời",
            attachFile: "Đính kèm file",
            sendPhoto: "Gửi ảnh",
            sendDocument: "Gửi tài liệu",
            emoji: "Emoji",
            newMessage: "Tin mới",
            noChatSelected: "Chưa chọn cuộc trò chuyện",
            noChatSelectedDesc:
                "Chọn một cuộc trò chuyện từ danh sách bên trái hoặc tạo cuộc trò chuyện mới để bắt đầu",
            connectedTo: "Đã kết nối với",
            notConnectedToBot: "Chưa kết nối với bot",
            active: "Đang hoạt động",
            notConnected: "Không kết nối",
            members: "thành viên",
            member: "thành viên",
            manageMembers: "Quản lý thành viên",
            moreOptions: "Thêm tùy chọn",
            deleteChat: "Xóa cuộc trò chuyện",
            deleteChatConfirm: "Xóa cuộc trò chuyện này?",
            clearHistory: "Xóa lịch sử",
            clearHistoryConfirm:
                "Xóa toàn bộ lịch sử chat của cuộc trò chuyện này?",
            enterChatId: "Nhập chat ID hoặc @username",
            noToken: "Chưa có token",
            toggleTheme: "Đổi giao diện",
            replyingTo: "Đang trả lời",
            editing: "Đang sửa",
            cancelEdit: "Hủy sửa",
            disconnected: "Chưa kết nối...",
            selectChat: "Chọn cuộc trò chuyện...",
            composing: "Đang soạn...",
            you: "Bạn",
            reply: "Trả lời",
            edit: "Sửa",
            copy: "Sao chép",
            forward: "Chuyển tiếp",
            pin: "Ghim",
            select: "Chọn",
            deleteForMe: "Xóa phía tôi",
            deleteForAll: "Xóa tất cả",
            cancel: "Hủy",
            selectAll: "Chọn tất cả",
            selectedCount: "Đã chọn {{count}} tin nhắn",
            confirmDeleteSelected: "Xóa {{count}} tin nhắn đã chọn?",
            confirmDeleteSelectedForAll:
                "Xóa {{count}} tin nhắn đã chọn cho tất cả?",
            confirmDeleteForAll:
                "Bạn có chắc muốn xóa tin nhắn này ở cả 2 phía?",
            info: "Thông tin cuộc trò chuyện",
            groupInfo: "Thông tin nhóm",
            userInfo: "Thông tin người dùng",
            type: "Loại",
            openChat: "Mở cuộc trò chuyện",
        },

        settings: {
            title: "Trung tâm cài đặt",
            description:
                "Cấu hình bot Telegram và tùy chỉnh giao diện ứng dụng",
            connection: "Kết nối",
            appearance: "Giao diện",
            preferences: "Tùy chọn",
            about: "Thông tin",

            botConfig: "Cấu hình Bot",
            botConfigDesc:
                "Nhập token và proxy để kết nối với Telegram Bot API",
            proxy: "CORS Proxy (tùy chọn)",
            proxyPlaceholder: "https://cors-anywhere.herokuapp.com/",
            proxyDesc: "Sử dụng proxy nếu gặp lỗi CORS khi truy cập API",
            connectionNotes: "Lưu ý:",
            connectionNote1:
                "Nếu nhận lỗi 409 khi polling, hãy xóa webhook trước",
            connectionNote2: "Nếu bị lỗi CORS, hãy thêm proxy prefix",
            connectionNote3:
                "Token sẽ được lưu trong localStorage của trình duyệt",

            quickSwitchBots: "Chuyển nhanh giữa các bot đã lưu",
            selectSavedBot: "Chọn bot đã lưu",
            switchBot: "Chuyển bot",

            botProfile: "Hồ sơ bot",
            botProfileDesc: "Đổi tên, mô tả và mô tả ngắn của bot",

            theme: "Chế độ hiển thị",
            themeDesc: "Tùy chỉnh màu sắc và ngôn ngữ hiển thị",
            themeLight: "Sáng",
            themeDark: "Tối",
            themeSystem: "Hệ thống",
            themeLightDesc: "Giao diện màu sáng",
            themeDarkDesc: "Giao diện màu tối",
            themeSystemDesc: "Theo cài đặt hệ thống",
            language: "Ngôn ngữ",

            appPreferences: "Tùy chọn ứng dụng",
            appPreferencesDesc: "Cấu hình hành vi và thông báo của ứng dụng",
            autoScroll: "Tự động cuộn",
            autoScrollDesc: "Tự động cuộn đến tin nhắn mới nhất khi có tin mới",
            sound: "Âm báo thông báo",
            soundDesc: "Phát âm thanh khi có tin nhắn mới hoặc thông báo",
            push: "Thông báo đẩy",
            pushDesc: "Hiển thị thông báo desktop khi tab không hoạt động",
            dangerZone: "Vùng nguy hiểm",
            dangerZoneDesc: "Các thao tác không thể hoàn tác",
            clearAllDataDesc:
                "Xóa token, chat history, và tất cả cài đặt đã lưu",

            botHistory: "Lịch sử Bot",
            botHistoryDesc: "Quản lý dữ liệu và lịch sử chat của từng bot",
            manageBotData: "Quản lý dữ liệu Bot",
            botTokens: "Danh sách Bot đã lưu",
            noBotsFound: "Chưa có bot nào được lưu",
            clearBotData: "Xóa dữ liệu bot này",
            clearBotDataDesc:
                "Xóa toàn bộ chat history và thông tin của bot này",
            confirmClearBotData:
                "Bạn có chắc muốn xóa tất cả dữ liệu của bot này? Thao tác này không thể hoàn tác.",

            aboutApp: "Về ứng dụng",
            version: "Phiên bản:",
            framework: "Framework:",
            botApi: "Bot API:",
            pollingStatus: "Trạng thái polling:",
            polling: "Đang hoạt động",
            stopped: "Đã dừng",
            copyright: "© 2024 Telegram Bot Client",
            builtWith: "Phát triển với React, TypeScript và shadcn/ui",
        },

        messages: {
            connectionSaved: "Đã lưu cài đặt kết nối thành công!",
            connectionTesting: "Đang kiểm tra kết nối...",
            connectionSuccess: "Kết nối thành công!",
            connectionFailed: "Không thể kết nối đến Telegram API",
            webhookDeleting: "Đang xóa webhook...",
            webhookDeleted: "Đã xóa webhook thành công!",
            webhookDeleteFailed: "Lỗi khi xóa webhook",
            allDataCleared: "Đã xóa tất cả dữ liệu",
            confirmClearData:
                "Bạn có chắc muốn xóa tất cả dữ liệu? Thao tác này không thể hoàn tác.",
            enterToken: "Vui lòng nhập Bot Token",
            enterTokenToTest: "Vui lòng nhập Bot Token để kiểm tra",
            botInfoUpdated: "Đã cập nhật thông tin bot!",
            botInfoUpdateFailed: "Cập nhật thông tin bot thất bại",
            switchedBot: "Đã chuyển bot",
        },
    },

    en: {
        app: {
            initializing: "Initializing application...",
        },

        common: {
            ok: "OK",
            cancel: "Cancel",
            save: "Save",
            delete: "Delete",
            edit: "Edit",
            search: "Search",
            loading: "Loading...",
            error: "Error",
            success: "Success",
            warning: "Warning",
            info: "Info",
            confirm: "Confirm",
            close: "Close",
            back: "Back",
            next: "Next",
            previous: "Previous",
            settings: "Settings",
        },

        nav: {
            chats: "Chats",
            settings: "Settings",
            about: "About",
        },

        sidebar: {
            jumpToChannel: "Jump to channel",
            navigation: "Navigation",
            navigationDesc: "Use the left panel to switch conversations quickly, or open a new chat by ID/@username.",
            transmissionTips: "Transmission tips",
            tipEnterSend: "Press Enter to send quickly, Shift+Enter for new line.",
            tipDragDrop: "Drag and drop files into the chat to send media.",
            tipInlineKeyboard: "You can edit/create inline keyboard for messages.",
            openChat: "Open new chat",
            chatIdPlaceholder: "Chat ID or @username",
            chatTitlePlaceholder: "Title (optional)",
            openButton: "Open chat",
            openButtonLoading: "Opening...",
            hintChatIdOrUsername: "Enter @channel/@group or numeric ID.",
            hintBotChat: "For users, the bot can only message if they have started the bot.",
            dropFileToSend: "Drop file here to send",
            supportedFileTypes: "All file types supported",
        },

        connection: {
            connected: "Connected",
            disconnected: "Disconnected",
            connecting: "Connecting",
            failed: "Connection failed",
            testConnection: "Test Connection",
            saveConnection: "Save & Connect",
        },

        bot: {
            token: "Bot Token",
            tokenPlaceholder: "bot123456789:ABCDefghijklmnopqrstuvwxyz...",
            tokenRequired: "Please enter Bot Token",
            tokenFromBotFather: "Get token from @BotFather on Telegram",
            currentBot: "Current Bot",
            botName: "Name",
            botUsername: "Username",
            botDescription: "Description",
            botShortDescription: "Short description",
            botCommands: "Commands",
            status: "Status",
            deleteWebhook: "Delete webhook",
            clearAllData: "Clear all data",
        },

        chat: {
            searchChats: "Search chats...",
            noChats: "No chats yet",
            noChatsDesc: "Chats will appear here when messages arrive.",
            typeMessage: "Type a message...",
            sendMessage: "Send message",
            replyTo: "Reply to",
            cancelReply: "Cancel reply",
            attachFile: "Attach file",
            sendPhoto: "Send photo",
            sendDocument: "Send document",
            emoji: "Emoji",
            newMessage: "New message",
            noChatSelected: "No chat selected",
            noChatSelectedDesc:
                "Select a chat from the left sidebar or create a new chat to get started",
            connectedTo: "Connected to",
            notConnectedToBot: "Not connected to bot",
            active: "Active",
            notConnected: "Not connected",
            members: "members",
            member: "member",
            manageMembers: "Manage members",
            moreOptions: "More options",
            deleteChat: "Delete chat",
            deleteChatConfirm: "Delete this chat?",
            clearHistory: "Clear history",
            clearHistoryConfirm:
                "Clear all chat history for this conversation?",
            enterChatId: "Enter chat ID or @username",
            noToken: "No token",
            toggleTheme: "Toggle theme",
            replyingTo: "Replying to",
            editing: "Editing",
            cancelEdit: "Cancel edit",
            disconnected: "Not connected...",
            selectChat: "Select a chat...",
            composing: "Composing...",
            you: "You",
            reply: "Reply",
            edit: "Edit",
            copy: "Copy",
            forward: "Forward",
            pin: "Pin",
            select: "Select",
            cancel: "Cancel",
            selectAll: "Select all",
            selectedCount: "{{count}} messages selected",
            confirmDeleteSelected: "Delete {{count}} selected messages?",
            confirmDeleteSelectedForAll:
                "Delete {{count}} selected messages for everyone?",
            deleteForMe: "Delete for me",
            deleteForAll: "Delete for everyone",
            confirmDeleteForAll:
                "Are you sure you want to delete this message on both sides?",
            info: "Chat Info",
            groupInfo: "Group information",
            userInfo: "User information",
            type: "Type",
            openChat: "Open Chat",
        },

        settings: {
            title: "Settings Center",
            description:
                "Configure Telegram bot and customize application interface",
            connection: "Connection",
            appearance: "Appearance",
            preferences: "Preferences",
            about: "About",

            botConfig: "Bot Configuration",
            botConfigDesc:
                "Enter token and proxy to connect to Telegram Bot API",
            proxy: "CORS Proxy (optional)",
            proxyPlaceholder: "https://cors-anywhere.herokuapp.com/",
            proxyDesc:
                "Use proxy if encountering CORS errors when accessing API",
            connectionNotes: "Notes:",
            connectionNote1:
                "If you get 409 error while polling, delete webhook first",
            connectionNote2: "If you encounter CORS errors, add proxy prefix",
            connectionNote3: "Token will be saved in browser localStorage",

            quickSwitchBots: "Quickly switch between saved bots",
            selectSavedBot: "Select saved bot",
            switchBot: "Switch bot",

            botProfile: "Bot profile",
            botProfileDesc:
                "Change bot name, description and short description",

            theme: "Display Mode",
            themeDesc: "Customize colors and display language",
            themeLight: "Light",
            themeDark: "Dark",
            themeSystem: "System",
            themeLightDesc: "Light color interface",
            themeDarkDesc: "Dark color interface",
            themeSystemDesc: "Follow system settings",
            language: "Language",

            appPreferences: "Application Preferences",
            appPreferencesDesc:
                "Configure application behavior and notifications",
            autoScroll: "Auto Scroll",
            autoScrollDesc:
                "Automatically scroll to latest message when new message arrives",
            sound: "Notification Sound",
            soundDesc: "Play sound when new message or notification arrives",
            push: "Push Notifications",
            pushDesc: "Show desktop notifications when tab is inactive",
            dangerZone: "Danger Zone",
            dangerZoneDesc: "Irreversible actions",
            clearAllDataDesc:
                "Delete token, chat history, and all saved settings",

            botHistory: "Bot History",
            botHistoryDesc: "Manage data and chat history for each bot",
            manageBotData: "Manage Bot Data",
            botTokens: "Saved Bots List",
            noBotsFound: "No bots saved yet",
            clearBotData: "Delete this bot data",
            clearBotDataDesc:
                "Delete all chat history and information for this bot",
            confirmClearBotData:
                "Are you sure you want to delete all data for this bot? This action cannot be undone.",

            aboutApp: "About Application",
            version: "Version:",
            framework: "Framework:",
            botApi: "Bot API:",
            pollingStatus: "Polling status:",
            polling: "Active",
            stopped: "Stopped",
            copyright: "© 2024 Telegram Bot Client",
            builtWith: "Built with React, TypeScript and shadcn/ui",
        },

        messages: {
            connectionSaved: "Connection settings saved successfully!",
            connectionTesting: "Testing connection...",
            connectionSuccess: "Connection successful!",
            connectionFailed: "Unable to connect to Telegram API",
            webhookDeleting: "Deleting webhook...",
            webhookDeleted: "Webhook deleted successfully!",
            webhookDeleteFailed: "Error deleting webhook",
            allDataCleared: "All data cleared",
            confirmClearData:
                "Are you sure you want to delete all data? This action cannot be undone.",
            enterToken: "Please enter Bot Token",
            enterTokenToTest: "Please enter Bot Token to test",
            botInfoUpdated: "Bot info updated!",
            botInfoUpdateFailed: "Failed to update bot info",
            switchedBot: "Switched bot",
        },
    },
};
