const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { z } = require("zod");
const { Conversation } = require("../db/schemas");
const { PromptTemplate } = require("@langchain/core/prompts");

// Khởi tạo model Gemini qua LangChain
const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0.2,
    maxOutputTokens: 2048, // Tăng token để tránh JSON bị cắt giữa chừng
    modelKwargs: {
        responseMimeType: "application/json" // Ép buộc trả về JSON hợp lệ
    }
});

// Định nghĩa schema cho output (Structured Output)
const MemoryUpdateSchema = z.object({
    summary: z.string().describe("Tóm tắt cập nhật về người dùng (User Profile), ngắn gọn, súc tích, bao gồm các thông tin chính và diễn biến quan hệ với AI."),
    facts: z.array(z.string()).describe("Danh sách TOÀN BỘ các sự kiện (facts) quan trọng về người dùng. Bao gồm cả facts cũ (nếu còn đúng) và facts mới. Loại bỏ facts sai hoặc lỗi thời."),
});

// Tạo Model có khả năng trả về JSON theo schema
const structuredModel = model.withStructuredOutput(MemoryUpdateSchema);

/**
 * Hàm cập nhật bộ nhớ dài hạn (Long-term Memory) cho User sử dụng LangChain
 * @param {string} userId - ID người dùng Discord
 * @param {Array} recentExchanges - Các cặp tin nhắn mới nhất (User + AI)
 */
async function updateLayeredMemory(userId, recentExchanges) {
    try {
        const conversation = await Conversation.findOne({ userId });
        if (!conversation) return;

        const currentSummary = conversation.summary || "Chưa có thông tin.";
        const currentFacts = conversation.facts || [];

        // Log input để debug
        // console.log(`[Memory] Processing ${recentExchanges.length} messages for ${userId}`);

        const promptTemplate = PromptTemplate.fromTemplate(`
Bạn là Memory Manager cho AI Chatbot Alya. Nhiệm vụ của bạn là chắt lọc thông tin quan trọng để xây dựng trí nhớ dài hạn về người dùng.

DỮ LIỆU HIỆN CÓ:
- Tóm tắt cũ: "{current_summary}"
- Facts đã biết: {current_facts}

HỘI THOẠI MỚI NHẤT:
{chat_history}

YÊU CẦU QUAN TRỌNG (ĐỌC KỸ):
1. **Cập nhật Tóm tắt (Summary):** Viết một đoạn văn ngắn mô tả người dùng là ai, tính cách thế nào, và mối quan hệ hiện tại với Alya (thân thiết, trêu chọc, xa lạ...).
2. **Cập nhật Sự kiện (Facts):**
   - **CHỈ LƯU:** Thông tin bền vững, có giá trị lâu dài.
     + Tên, biệt danh, tuổi, ngày sinh.
     + Sở thích, đam mê, ghét cái gì (rõ ràng).
     + Công việc, nơi ở, chuyên môn.
     + Mối quan hệ quan trọng với người khác.
     + Những sự kiện lớn trong đời (đỗ đại học, chia tay, kết hôn...).
   - **TUYỆT ĐỐI BỎ QUA:** Tin rác, cảm xúc nhất thời, hội thoại xã giao.
     + "User đang buồn ngủ", "User vừa ăn cơm", "User đang chán".
     + "User khen Alya xinh" (Trừ khi khen dồn dập thành thói quen).
     + Những câu đùa cợt không rõ nghĩa.

VÍ DỤ:
- Tốt: "User thích chơi Genshin Impact", "User là lập trình viên Node.js", "User thường gọi Alya là Bé Heo".
- Tệ (XÓA NGAY): "User đang đói", "User chào buổi sáng", "User hỏi mấy giờ rồi".

HÃY KHẮT KHE. Số lượng fact tối đa là 50. Nếu fact cũ sai hoặc không còn quan trọng, hãy xóa hoặc sửa lại.

Output JSON theo schema.
        `);

        // Format chat history
        const chatHistoryText = recentExchanges
            .map(msg => `${msg.role === 'user' ? 'User' : 'Alya'}: ${msg.content}`)
            .join('\n');

        const formattedPrompt = await promptTemplate.format({
            current_summary: currentSummary,
            current_facts: JSON.stringify(currentFacts),
            chat_history: chatHistoryText
        });

        // Gọi LangChain Agent
        const memoryUpdate = await structuredModel.invoke(formattedPrompt);

        // Debug kết quả từ AI
        // console.log("[Memory Update Result]", memoryUpdate);

        // Cập nhật Database
        if (memoryUpdate) {
            const updateFields = {};
            if (memoryUpdate.summary) updateFields.summary = memoryUpdate.summary;

            // Logic facts: AI đã trả về danh sách TOÀN BỘ, nên ta ghi đè luôn
            if (memoryUpdate.facts && Array.isArray(memoryUpdate.facts)) {
                updateFields.facts = memoryUpdate.facts.slice(0, 50); // Hard limit 50 để an toàn
            }

            if (Object.keys(updateFields).length > 0) {
                await Conversation.findOneAndUpdate(
                    { userId },
                    { $set: updateFields },
                    { new: true }
                );
                console.log(`[Memory] Successfully updated via LangChain for User ${userId}`);
            }
        }

    } catch (error) {
        console.error("[Memory] LangChain Error:", error);
    }
}

module.exports = { updateLayeredMemory };
