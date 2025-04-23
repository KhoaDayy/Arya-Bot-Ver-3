const { SlashCommandBuilder } = require("discord.js");
const { GoogleGenAI, Modality } = require("@google/genai");
const { AttachmentBuilder } = require("discord.js");
require("dotenv").config();
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

async function ImageGenerate(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-exp-image-generation",
    contents: prompt,
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });

  let imageBuffer;

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const imageData = part.inlineData.data;
      imageBuffer = Buffer.from(imageData, "base64");
      break;
    }
  }

  if (imageBuffer) {
    const attachment = new AttachmentBuilder(imageBuffer, {
      name: "gemini-image.png",
    });
    return attachment;
  } else {
    return null;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("imagine")
    .setDescription("Tool xử lý hình ảnh với A.I🤖")
    .addSubcommand((sub) =>
      sub
        .setName("upscale")
        .setDescription("Tăng độ phân giải hình ảnh")
        .addAttachmentOption((option) =>
          option
            .setName("image")
            .setDescription("Tải lên ảnh cần upscale")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("generate")
        .setDescription("Tạo hình ảnh từ văn bản")
        .addStringOption((option) =>
          option
            .setName("prompt")
            .setDescription("Promt để generate ảnh")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === "upscale") {
      await interaction.reply({
        content:
          "Đang deo tìm đc api free cho ae dùng nên tạm thời chưa có chức năng này nhé🐧",
        ephemeral: true,
      });
    } else if (sub === "generate") {
      await interaction.reply({
        content: "🔄 Đang tạo hình ảnh, vui lòng đợi...",
        ephemeral: true,
      });
      const prompt = interaction.options.getString("prompt");
      const attachment = await ImageGenerate(prompt);

      if (attachment) {
        const embed = {
          author: {
            name: interaction.user.username,
            icon_url: interaction.user.displayAvatarURL(),
          },
          title: "🖼️ Ảnh được tạo từ A.I",
          description: `**Prompt:** ${prompt}`,
          image: { url: "attachment://gemini-image.png" },
          color: 0x00aaff,
          footer: { text: `Requested by ${interaction.user.username}` },
        };

        await interaction.editReply({ embeds: [embed], files: [attachment] });
      } else {
        await interaction.editReply(
          "❌ Không thể tạo ảnh từ prompt đã cho hoặc ảnh không trả về đúng."
        );
      }
    }
  },
};
