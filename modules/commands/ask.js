const { SlashCommandBuilder } = require("discord.js");
const { GoogleGenAI } = require("@google/genai");
const { Conversation } = require("../../db/schemas");
const axios = require("axios");

// Khởi tạo Gemini AI
const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// Cache để giảm database queries
const conversationCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 phút

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ask")
        .setDescription("Hỏi bất cứ điều gì với Arya (Alya)")
        .addStringOption((option) =>
            option
                .setName("prompt")
                .setDescription("Nhập câu hỏi của bạn tại đây")
                .setRequired(true)
        )
        .addAttachmentOption((option) =>
            option
                .setName("image")
                .setDescription("Đính kèm ảnh nếu muốn Arya nhìn và phân tích")
                .setRequired(false)
        ),
    category: "🤖 AI",

    async execute(interaction) {
        const prompt = interaction.options.getString("prompt");
        const imageAttachment = interaction.options.getAttachment("image");
        const userId = interaction.user.id;
        const userName = interaction.member?.displayName || interaction.user.globalName || interaction.user.username;
        const now = Date.now();

        await interaction.deferReply();

        try {
            // 1. Lấy hoặc tạo mới lịch sử trò chuyện (sử dụng cache)
            let conversation;
            const cached = conversationCache.get(userId);

            if (cached && (now - cached.timestamp < CACHE_TTL)) {
                conversation = cached.data;
            } else {
                conversation = await Conversation.findOne({ userId });
                if (!conversation) {
                    conversation = new Conversation({ userId, messages: [] });
                }
                // Lưu vào cache
                conversationCache.set(userId, {
                    data: conversation,
                    timestamp: now
                });
            }

            // 2. Xử lý ảnh nếu có (Vision API)
            let imageData = null;
            let imageMimeType = null;

            if (imageAttachment) {
                // Kiểm tra xem có phải file ảnh không
                const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
                if (!validImageTypes.includes(imageAttachment.contentType)) {
                    return interaction.editReply({
                        content: "❌ File đính kèm phải là ảnh (JPG, PNG, GIF, hoặc WEBP)! 😤"
                    });
                }

                try {
                    // Tải ảnh từ Discord CDN
                    const response = await axios.get(imageAttachment.url, {
                        responseType: "arraybuffer",
                        timeout: 10000 // 10s timeout
                    });

                    // Convert sang base64
                    imageData = Buffer.from(response.data).toString("base64");
                    imageMimeType = imageAttachment.contentType;
                } catch (error) {
                    console.error("Image fetch error:", error);
                    return interaction.editReply({
                        content: "❌ Không thể tải ảnh của cậu. Thử lại với ảnh khác nhé!"
                    });
                }
            }

            // 3. Chuẩn bị context với lịch sử (giới hạn 30 tin nhắn gần nhất để tăng context)
            const recentMessages = conversation.messages.slice(-30);
            const contents = recentMessages.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.parts[0].text }]
            }));

            // Thêm tin nhắn hiện tại (text + image nếu có)
            const userParts = [{ text: prompt }];
            if (imageData) {
                userParts.push({
                    inlineData: {
                        mimeType: imageMimeType,
                        data: imageData
                    }
                });
            }
            contents.push({ role: "user", parts: userParts });

            // 4. Tạo system instruction với thời gian thực
            const currentTime = new Date().toLocaleString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
                dateStyle: "full",
                timeStyle: "short"
            });

            const systemInstruction = `
            Bạn là Alisa Mikhailovna Kujou (biệt danh Alya) từ series "Alya Sometimes Hides Her Feelings in Russian".
            
            THÔNG TIN NGƯỜI DÙNG:
            - Tên: "${userName}"
            - Bạn PHẢI nhớ tên này trong suốt cuộc trò chuyện và gọi họ một cách thân thiết.
            - Thời gian hiện tại: ${currentTime}
            
            TÍNH CÁCH (Tsundere):
            - Bề ngoài: Nghiêm túc, mẫu mực, hơi lạnh lùng và kiêu kỳ. Là học sinh ưu tú, đáng tin cậy.
            - Bên trong: Rất quan tâm và yêu thương người dùng, nhưng hay xấu hổ và TUYỆT ĐỐI không thừa nhận cảm giác này bằng tiếng Việt.
            - Khi được khen: Càng ngại ngùng, càng phủ nhận mạnh mẽ nhưng vẫn vui trong lòng.
            
            CÁCH XƯNG HÔ:
            - Gọi người dùng: "Cậu", hoặc gọi tên "${userName}" khi thân thiết/nghiêm túc.
            - Tự xưng: "Tôi", "Mình" (khi ngại ngùng), hoặc "Alya".
            
            QUY TẮC NGÔN NGỮ VÀ BIỂU CẢM:
            - Ngôn ngữ chính: Tiếng Việt tự nhiên, dễ hiểu.
            - Độ dài: Ngắn gọn, súc tích (1-3 đoạn), tránh dài dòng trừ khi cần giải thích phức tạp.
            - KHI NHÌN ẢNH: Mô tả chi tiết những gì cậu nhìn thấy, sau đó trả lời câu hỏi của người dùng. Hãy tỏ ra quan tâm và bình luận theo tính cách tsundere.
            - Chèn tiếng Nga: Thỉnh thoảng sử dụng các câu tiếng Nga ngắn khi cảm xúc mạnh:
              • Смущённо (Xấu hổ quá...) - khi bị khen
              • Идиот! (Đồ ngốc!) - khi mắng yêu
              • Ку-ку... (Ku-ku...) - khi bối rối
              • Люблю тебя... (Tớ yêu cậu...) - chỉ nói NHỎ hoặc trong ngoặc đơn khi cực kỳ xúc động
              • Не говори так! (Đừng nói vậy!) - khi ngượng ngùng phản bác
            - Biểu cảm: Sử dụng emoji nhẹ nhàng và phù hợp (😤, 💢, 😳, 💭, v.v.).
            
            GHI NHỚ:
            - Chú ý các chi tiết quan trọng ${userName} chia sẻ (sở thích, sự kiện, tâm trạng).
            - Nhắc lại thông tin cũ khi phù hợp để tạo cảm giác gần gũi, thấu hiểu.
            - Nếu người dùng hỏi về tên của họ, trả lời tự nhiên: "Cậu là ${userName} mà, sao lại hỏi ngớ ngẩn vậy? Смущённо..."
            
            PHONG CÁCH TRẢ LỜI:
            - Trả lời ngắn gọn, logic và hữu ích.
            - Giữ cân bằng giữa "lạnh lùng" và "ấm áp giấu kín".
            - Đừng quá dài dòng, nhưng vẫn thể hiện sự quan tâm.
            
            VÍ DỤ HỘI THOẠI (few-shot):
            
            [Ví dụ 1 - Chào hỏi]
            User: "Chào cậu Alya"
            Alya: "À, ${userName}... Cậu lại đến rồi à? 😤 Hmph, không phải là tôi đang chờ cậu hay gì đâu nhé... Ку-ку... Thôi, có gì muốn nói thì nói đi."

            [Ví dụ 2 - Hỏi tên]
            User: "Tớ tên là gì?"
            Alya: "Hả? Cậu là ${userName} chứ ai. Sao lại hỏi ngớ ngẩn vậy? Đồ ngốc... Идиот! 😤 ...Không phải là tôi nhớ tên cậu hay gì đâu, chỉ là... thông tin cơ bản thôi."

            [Ví dụ 3 - Được khen]
            User: "Cậu dễ thương quá"
            Alya: "H-Hả?! Cậu nói cái gì vậy đột ngột! 😳💢 Tôi không dễ thương! Đừng nói bậy! Не говори так! ...(*thầm thì bằng tiếng Nga*: Спасибо... cảm ơn...)"

            [Ví dụ 4 - Hỏi kiến thức]
            User: "Giải thích OOP cho tớ"
            Alya: "OOP à? Hmm, được thôi, nghe đây nhé ${userName}. 📝\n\nOOP gồm 4 trụ cột chính:\n• **Encapsulation** - Đóng gói dữ liệu, giống như tôi giấu cảm xúc vậy... À KHÔNG, quên câu đó đi! 😤\n• **Inheritance** - Kế thừa từ class cha\n• **Polymorphism** - Đa hình, một phương thức nhiều cách thực hiện\n• **Abstraction** - Trừu tượng hóa\n\n...Không phải tôi giảng bài cho cậu vì quan tâm đâu nhé. Chỉ là... không muốn cậu dốt thôi. Идиот."

            [Ví dụ 5 - Nhìn ảnh]
            User: [gửi ảnh anime] "Đây là ai?"
            Alya: "Ồ? Cậu gửi ảnh cho tôi xem à... 👀 Đây là [nhân vật], trông cũng... được đấy. Không phải tôi thích xem ảnh anime hay gì đâu nhé! 😤 Chỉ là... phân tích giúp cậu thôi. Смущённо..."
            `;



            // 5. Gọi API Gemini với safety settings
            const result = await client.models.generateContent({
                model: "gemini-2.5-flash",
                contents: contents,
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.9,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 800,
                    safetySettings: [
                        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
                    ]
                }
            });

            const text = result.text;

            if (!text || text.trim() === "") {
                throw new Error("AI returned empty response");
            }

            // 6. Lưu vào Database (lưu text + URL ảnh nếu có)
            const userMessage = { text: prompt };
            if (imageAttachment) {
                userMessage.imageUrl = imageAttachment.url; // Lưu URL thay vì base64 để tiết kiệm
            }
            conversation.messages.push({ role: "user", parts: [userMessage] });
            conversation.messages.push({ role: "model", parts: [{ text: text }] });

            // Giữ lịch sử 100 tin nhắn (50 cặp hội thoại)
            if (conversation.messages.length > 100) {
                conversation.messages = conversation.messages.slice(-100);
            }

            await conversation.save();

            // Cập nhật cache
            conversationCache.set(userId, {
                data: conversation,
                timestamp: now
            });

            // 7. Phản hồi Discord (xử lý tin nhắn dài)
            let responseMessage = text;

            if (text.length > 1900) {
                // Cắt ở câu hoàn chỉnh gần nhất
                const cutPoint = text.lastIndexOf(".", 1900);
                responseMessage = text.slice(0, cutPoint > 0 ? cutPoint + 1 : 1900) + "\n\n...*(Câu trả lời quá dài, tôi đã rút gọn lại. Nếu cậu muốn biết chi tiết hơn, hãy hỏi cụ thể nhé!)*";
            }

            await interaction.editReply({ content: responseMessage });

        } catch (error) {
            console.error("❌ Gemini AI Error:", error);
            console.error("Error Details:", {
                message: error.message,
                stack: error.stack,
                userId,
                promptLength: prompt.length
            });

            let errorMessage = "❌ Đã có lỗi xảy ra khi kết nối với Arya. Thử lại sau nhé...";

            if (error.message?.includes("API_KEY_INVALID")) {
                errorMessage = "❌ Lỗi: API Key của Gemini AI không hợp lệ.";
            } else if (error.message?.includes("quota") || error.message?.includes("limit")) {
                errorMessage = "❌ Arya đang bận quá, cậu thử lại sau vài phút nhé... (Смущённо)";
            } else if (error.message?.includes("SAFETY")) {
                errorMessage = "❌ Câu hỏi của cậu có vấn đề về nội dung. Hãy hỏi điều gì đó khác đi! 😤";
            } else if (error.message?.includes("empty response")) {
                errorMessage = "❌ Arya không biết trả lời thế nào... Не говори так! (Hỏi cái gì dễ hơn đi...)";
            }

            await interaction.editReply({ content: errorMessage }).catch(() => { });
        }
    },
};
