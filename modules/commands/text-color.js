const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// Color Utility Functions
function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }
    return {
        r: parseInt(hex.substr(0, 2), 16),
        g: parseInt(hex.substr(2, 2), 16),
        b: parseInt(hex.substr(4, 2), 16)
    };
}

function rgbToHex(r, g, b) {
    const toHex = (n) => {
        const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function interpolateColors(colorArray, numSteps) {
    if (numSteps <= 0) return [];
    if (numSteps === 1) return [colorArray[0]];
    if (colorArray.length === 1) return Array(numSteps).fill(colorArray[0]);

    const result = [];
    const numSegments = colorArray.length - 1;
    const stepsPerSegment = (numSteps - 1) / numSegments;

    for (let i = 0; i < numSteps; i++) {
        const segmentFloat = stepsPerSegment > 0 ? i / stepsPerSegment : 0;
        const segment = Math.min(Math.floor(segmentFloat), numSegments - 1);
        const localT = segmentFloat - segment;

        const color1 = hexToRgb(colorArray[segment]);
        const color2 = hexToRgb(colorArray[Math.min(segment + 1, colorArray.length - 1)]);

        const r = color1.r + (color2.r - color1.r) * localT;
        const g = color1.g + (color2.g - color1.g) * localT;
        const b = color1.b + (color2.b - color1.b) * localT;

        result.push(rgbToHex(r, g, b));
    }

    return result;
}

const PRESETS = {
    "Rainbow": ["#ff0000", "#ff8800", "#ffff00", "#00ff00", "#0088ff", "#8800ff"],
    "Sunset": ["#ff6b6b", "#feca57", "#ff9ff3"],
    "Ocean": ["#0077b6", "#00b4d8", "#90e0ef"],
    "Fire": ["#ff0000", "#ff5500", "#ffaa00"],
    "Aurora": ["#00c9ff", "#92fe9d"],
    "Sakura": ["#ff69b4", "#ffb7c5", "#ffffff"],
    "Cyberpunk": ["#00ffff", "#ff00ff", "#ffff00"],
    "Vaporwave": ["#ff71ce", "#01cdfe", "#05ffa1"],
    "Electric": ["#00f5ff", "#0080ff", "#8000ff"],
    "Neon": ["#ff006e", "#8338ec", "#3a86ff"],
    "Tropical": ["#f72585", "#7209b7", "#4cc9f0"],
    "Candy": ["#ff6b6b", "#ffd93d", "#6bcb77"],
    "Cotton Candy": ["#ffb7d5", "#c5a3ff", "#a3d5ff"],
    "Peach": ["#ffcdb2", "#ffb4a2", "#e5989b"],
    "Mint": ["#b8f2e6", "#aed9e0", "#89c2d9"],
    "Lavender": ["#e0aaff", "#c77dff", "#9d4edd"],
    "Autumn": ["#ff6b35", "#f7931e", "#f9c74f"],
    "Forest": ["#134e5e", "#4a7c59", "#71b280"],
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("text-color")
        .setDescription("Tạo text màu gradient cho game WWM")
        .addStringOption(option =>
            option.setName("text")
                .setDescription("Nội dung text cần tạo màu")
                .setRequired(true)
                .setMaxLength(100))
        .addStringOption(option =>
            option.setName("colors")
                .setDescription("Danh sách mã màu hex (cách nhau bởi dấu phẩy, ví dụ: #ff0000, #00ff00)"))
        .addStringOption(option =>
            option.setName("preset")
                .setDescription("Chọn mẫu màu gradient có sẵn")
                .addChoices(
                    ...Object.keys(PRESETS).map(name => ({ name: name, value: name }))
                )),

    async execute(interaction) {
        const text = interaction.options.getString("text");
        const colorsInput = interaction.options.getString("colors");
        const presetName = interaction.options.getString("preset");

        let colorsToUse = [];

        if (presetName && PRESETS[presetName]) {
            colorsToUse = PRESETS[presetName];
        } else if (colorsInput) {
            // Parse colors separated by comma or space
            colorsToUse = colorsInput.split(/[,\s]+/).map(c => c.trim()).filter(c => /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(c));
            // Ensure hex starts with # and is correctly formatted
            colorsToUse = colorsToUse.map(c => c.startsWith('#') ? c.toLowerCase() : '#' + c.toLowerCase());
        }

        if (colorsToUse.length === 0) {
            // Default to Rainbow if no valid colors provided
            colorsToUse = PRESETS["Rainbow"];
        }

        // Processing text
        const allChars = text.split('').filter(c => c !== ' ');
        const gradient = allChars.length > 0 ? interpolateColors(colorsToUse, allChars.length) : [];

        let result = '';
        let charIndex = 0;
        let lastColor = null;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === ' ') {
                result += ' ';
            } else {
                const currentColor = gradient[charIndex];
                // Only add color code if it's different from the last one to save characters
                if (currentColor && currentColor !== lastColor) {
                    result += currentColor + char;
                    lastColor = currentColor;
                } else {
                    result += char;
                }
                charIndex++;
            }
        }

        const embed = new EmbedBuilder()
            .setTitle("✨ Kết quả tạo text màu")
            .setColor(colorsToPrepareEmbed(colorsToUse[0]))
            .setDescription(`Dưới đây là mã màu cho text của bạn. Hãy copy phần text trong khung để dán vào game.`)
            .addFields(
                { name: "📝 Mã màu (Copy ở đây)", value: `\`\`\`\n${result}\n\`\`\`` },
                { name: "📏 Độ dài", value: `**${result.length}**/300 ký tự`, inline: true }
            )
            .setFooter({ text: `Người yêu cầu: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        if (result.length > 300) {
            embed.addFields({ name: "⚠️ Cảnh báo", value: "Độ dài vượt quá 300 ký tự, có thể không dùng được trong game!", inline: false });
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
    category: "🎮 Game (WWM)",
};

// Helper for Embed color (must be decimal or hex string without # in some cases, but Discord.js handles hex strings)
function colorsToPrepareEmbed(hex) {
    return hex.startsWith('#') ? hex : '#' + hex;
}
