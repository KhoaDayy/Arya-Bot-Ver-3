const { Events } = require("discord.js");
const { fancyLog } = require("../../utils/consoleLogger");

const IGNORE_KEYWORDS = ["bot", "spam"];
const IGNORED_CHANNEL = process.env.IGNORED_CHANNEL_ID;

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message, client) {
        if (message.author.bot) return;

        // Logging
        if (message.guildId && message.channel.id !== IGNORED_CHANNEL) {
            const chName = (message.channel.name || "").toLowerCase();
            if (!IGNORE_KEYWORDS.some(k => chName.includes(k))) {
                try {
                    fancyLog({
                        serverName: message.guild?.name || "DM",
                        channelName: message.channel.name || "Unknown",
                        userName: message.member?.displayName || message.author.username,
                        content: message.content || "<media>",
                    });
                } catch (e) { /* ignore logging errors */ }
            }
        }
        // Kiểm tra xem có phải lệnh !ask không (chấp nhận !ask hoặc !ask <nội dung>)
        const prefix = "!ask";
        if (!message.content.startsWith(prefix)) return;

        // Đảm bảo sau !ask là khoảng trắng hoặc kết thúc chuỗi (tránh !asking, !askme)
        if (message.content.length > prefix.length && message.content[prefix.length] !== ' ') return;

        const command = client.commands.get("ask");
        if (!command) return;

        // Tách câu hỏi từ tin nhắn (loại bỏ "!ask")
        const prompt = message.content.slice(prefix.length).trim();

        // Nếu không có nội dung và không có ảnh, nhắc người dùng
        if (!prompt && message.attachments.size === 0) {
            return message.reply("Cậu phải hỏi gì đó hoặc gửi ảnh chứ! 😤");
        }

        // Tạo context giả lập Interaction
        const interactionShim = {
            user: message.author,
            member: message.member,
            guildId: message.guildId,
            channel: message.channel,
            options: {
                getString: (name) => {
                    if (name === "prompt") return prompt;
                    return null;
                },
                getAttachment: (name) => {
                    if (name === "image") return message.attachments.first();
                    return null;
                }
            },
            deferReply: async () => {
                await message.channel.sendTyping();
            },
            editReply: async (options) => {
                const content = typeof options === 'string' ? options : options.content;
                if (interactionShim.replyMessage) {
                    await interactionShim.replyMessage.edit(content);
                } else {
                    // Fallback nếu chưa defer (lý thuyết là ask.js luôn defer)
                    interactionShim.replyMessage = await message.reply(content);
                }
            },
            deleteReply: async () => {
                if (interactionShim.replyMessage) {
                    await interactionShim.replyMessage.delete().catch(() => { });
                    interactionShim.replyMessage = null;
                }
            },
            followUp: async (options) => {
                const content = typeof options === 'string' ? options : options.content;
                const isEphemeral = typeof options !== 'string' && options.ephemeral;

                // Gửi tin nhắn
                const sentMessage = await message.channel.send(content);

                // Nếu là tin nhắn ephemeral (ví dụ: thông báo lỗi), tự động xóa sau 10s
                if (isEphemeral) {
                    setTimeout(() => {
                        sentMessage.delete().catch(() => { });
                    }, 10000);
                }

                return sentMessage;
            }
        };

        try {
            await command.execute(interactionShim);
        } catch (error) {
            console.error("Error executing !ask command:", error);
            message.reply("❌ Có lỗi xảy ra khi xử lý yêu cầu của cậu.");
        }
    },
};
