const { Events, EmbedBuilder } = require("discord.js");
const { fancyLog } = require("../../utils/consoleLogger");
const { GuildFaqConfig } = require("../../db/schemas");

const IGNORE_KEYWORDS = ["bot", "spam"];
const IGNORED_CHANNEL = process.env.IGNORED_CHANNEL_ID;

const DEFAULT_GUILD_FAQ_KEYWORDS = [
    "guild",
    "bang hội",
    "club",
    "hoạt động guild",
    "content guild",
];

const DEFAULT_GUILD_FAQ_EMBED = {
    title: "Sau 21h30 – Party Guild",
    description:
        "Chỉ cần vào treo trong guild cùng mọi người là được.\n" +
        "Sẽ nhận điểm cống hiến guild và xu / phần thưởng khác.\n\n" +
        "**Các hoạt động khác của Guild:**\n" +
        "1. **Breaking Army**\n" +
        "Thời gian: 17h Thứ 7 & Chủ Nhật\n" +
        "Hình thức: solo đánh boss\n" +
        "Chỉ cần đánh qua được boss là nhận quà và điểm cửa hàng guild.\n\n" +
        "2. **Guild War**\n" +
        "Thời gian: 19h30 Thứ 7 & Chủ Nhật\n" +
        "Hình thức: 30 người guild mình vs 30 người guild khác\n" +
        "Thường phải vào Discord để nghe call chiến thuật, chia đường giống game MOBA.\n" +
        "Cũng nhận điểm cửa hàng guild.\n\n" +
        "3. **Solo PvP**\n" +
        "Thời gian: 22h Thứ 7 & Chủ Nhật\n" +
        "Đấu PvP với thành viên trong guild.\n\n" +
        "4. **Guild Boss**\n" +
        "Giống boss tuần, đánh boss nhận quà và điểm cửa hàng guild.",
    color: "#A855F7",
    footer: "Hỏi thêm tại Discord nếu cần hỗ trợ.",
    thumbnailUrl: "",
};

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

        const messageText = (message.content || '').trim();
        const messageLower = messageText.toLowerCase();

        if (message.guildId && messageText && !messageText.startsWith('!')) {
            try {
                const config = await GuildFaqConfig.findOne({ guildId: message.guildId });
                if (config?.isActive) {
                    const channelMatch = !config.channelId || config.channelId === message.channel.id;
                    if (channelMatch) {
                        const keywords = (config.keywords && config.keywords.length > 0)
                            ? config.keywords
                            : DEFAULT_GUILD_FAQ_KEYWORDS;
                        const matched = keywords.some((keyword) =>
                            keyword && messageLower.includes(String(keyword).toLowerCase())
                        );

                        if (matched) {
                            const embedConfig = { ...DEFAULT_GUILD_FAQ_EMBED, ...(config.embed || {}) };
                            const embed = new EmbedBuilder()
                                .setColor(embedConfig.color || DEFAULT_GUILD_FAQ_EMBED.color)
                                .setTitle(embedConfig.title || DEFAULT_GUILD_FAQ_EMBED.title)
                                .setDescription(embedConfig.description || DEFAULT_GUILD_FAQ_EMBED.description);

                            if (embedConfig.footer) {
                                embed.setFooter({ text: embedConfig.footer });
                            }
                            if (embedConfig.thumbnailUrl) {
                                embed.setThumbnail(embedConfig.thumbnailUrl);
                            }

                            await message.channel.send({ embeds: [embed] });
                            return;
                        }
                    }
                }
            } catch (error) {
                console.error("[GuildFAQ] Failed to respond:", error);
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
