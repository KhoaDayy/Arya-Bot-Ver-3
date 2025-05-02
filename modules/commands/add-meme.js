const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");
const FormData = require("form-data");
const path = require("path");

const LIST_ID = process.env.LIST_ID;
const OWNER_ID = process.env.OWNER_ID;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-meme")
    .setDescription("Thêm meme mới vào danh sách")
    .addAttachmentOption((option) =>
      option
        .setName("image")
        .setDescription("Tải lên tệp ảnh (PNG/JPEG/GIF)")
        .setRequired(true)
    ),

  async execute(interaction) {
    // 1) Kiểm tra quyền: chỉ LIST_ID hoặc OWNER_ID mới được phép
    if (![LIST_ID, OWNER_ID].includes(interaction.user.id)) {
      return interaction.reply({
        content:
          "❌ Chỉ những người có trong danh sách mới có thể add meme cho bot.",
        ephemeral: true,
      });
    }

    // 2) Lấy attachment và validate
    const attachment = interaction.options.getAttachment("image");
    if (!attachment || !attachment.contentType.startsWith("image/")) {
      return interaction.reply({
        content: "❌ Vui lòng đính kèm tệp ảnh hợp lệ (PNG, JPEG hoặc GIF).",
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    try {
      // 3) Download ảnh về dưới dạng buffer
      const downloadRes = await axios.get(attachment.url, {
        responseType: "arraybuffer",
      });
      const buffer = Buffer.from(downloadRes.data);

      // 4) Tạo FormData để gửi lên API
      const form = new FormData();
      form.append("image", buffer, {
        filename: path.basename(attachment.url),
        contentType: attachment.contentType,
      });

      // 5) Gửi request POST multipart/form-data
      const uploadRes = await axios.post(
        "https://api.hasukatsu.online/upload-meme",
        form,
        { headers: form.getHeaders() }
      );

      const { success, url } = uploadRes.data;
      if (!success || !url) {
        throw new Error("Upload API trả về thất bại");
      }

      // 6) Phản hồi thành công với link mới
      return interaction.editReply({
        content: `✅ Đã thêm meme thành công! URL: ${url}`,
      });
    } catch (error) {
      console.error("Add-meme error:", error);
      return interaction.editReply({
        content: "❌ Có lỗi xảy ra khi upload meme. Vui lòng thử lại sau.",
        ephemeral: true,
      });
    }
  },
};

