const mongoose = require('mongoose');
const { Schema } = mongoose;


const voiceTemplateSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  templateId: { type: String, required: true }
});

const voiceParentSchema = new Schema({
  channelId: { type: String, required: true, unique: true },
  parentId: { type: String, required: true }
});

const voiceUserSchema = new Schema({
  guildId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  channelName: { type: String, required: true }
}, { timestamps: true });

voiceUserSchema.index({ guildId: 1, userId: 1 }, { unique: true });

const facePresetSchema = new Schema({
  id: { type: String, required: true, unique: true },
  data: { type: Object, required: true },
  postedChannels: { type: [String], default: [] }
}, { timestamps: true });

const guildConfigSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  faceForumId: { type: String, default: null }
}, { timestamps: true });

const conversationSchema = new Schema({
  userId: { type: String, required: true, index: true },
  summary: { type: String, default: "" }, // Tóm tắt dài hạn về người dùng
  facts: [{ type: String }], // Các sự kiện quan trọng (tên, sở thích, nơi ở...)
  messages: [{
    role: { type: String, enum: ['user', 'model'], required: true },
    parts: [{
      text: { type: String, required: true },
      imageUrl: { type: String } // Thêm field imageUrl để lưu link ảnh nếu có
    }]
  }]
}, { timestamps: true });

// Schema lưu chỉ số WWM (Where Winds Meet) của từng user
const wwmStatsSchema = new Schema({
  userId: { type: String, required: true, index: true },
  guildId: { type: String, required: true, index: true },
  weaponType: {
    type: String,
    required: true,
    enum: ['nameless', 'jade', 'umber', 'twinblades', 'moblade', 'healer']
  },
  stats: {
    minAtk: { type: Number, default: 0 }, // Tấn công tối thiểu
    maxAtk: { type: Number, default: 0 }, // Tấn công tối đa
    precision: { type: Number, default: 0 }, // Tỉ lệ bạo kích
    criti: { type: Number, default: 0 }, // Tỉ lệ hội tâm (Criti)
    dirCriti: { type: Number, default: 0 }, // Hội tâm trực tiếp
    critiDmg: { type: Number, default: 0 }, // Sát thương hội tâm
    affinity: { type: Number, default: 0 }, // Tỉ lệ hội ý (Affinity)
    dirAffinity: { type: Number, default: 0 }, // Hội ý trực tiếp
    affinityDmg: { type: Number, default: 0 }, // Sát thương hội ý
    minAttri: { type: Number, default: 0 }, // Thuộc tính tối thiểu
    maxAttri: { type: Number, default: 0 }, // Thuộc tính tối đa
    phyPen: { type: Number, default: 0 }, // Xuyên giáp vật lý
    phyDmg: { type: Number, default: 0 }, // Bonus sát thương vật lý
    attriPen: { type: Number, default: 0 }, // Xuyên giáp thuộc tính
    attriDmg: { type: Number, default: 0 }, // Bonus sát thương thuộc tính
    bossDmg: { type: Number, default: 0 }, // Bonus sát thương Boss
    weaponBoost: { type: Number, default: 0 }, // Tăng cường vũ khí
    allWeaponBoost: { type: Number, default: 0 }, // Tăng cường tất cả vũ khí
    mysticBoost: { type: Number, default: 0 }, // Tăng cường kỹ năng bí truyền
  }
}, { timestamps: true });

wwmStatsSchema.index({ userId: 1, guildId: 1, weaponType: 1 }, { unique: true });

// --- Guild War Schemas ---
const guildWarConfigSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  channelId: { type: String }, // Kênh thả poll
  roleT7: { type: String }, // Role cấp cho Thứ 7
  roleCN: { type: String }, // Role cấp cho Chủ Nhật
  pollDay: { type: Number, default: 5 }, // Thứ gửi poll (0 = CN, 1 = T2,... 5 = T6)
  pollTime: { type: String, default: "19:00" }, // Giờ gửi poll "HH:mm"
  timeT7: { type: String, default: "19:00" }, // Giờ Ping Thứ 7
  timeCN: { type: String, default: "19:00" }, // Giờ Ping Chủ Nhật
  isActive: { type: Boolean, default: true },
  reminderOffsets: { type: [Number], default: [30, 15, 5] }, // Phút nhắc trước war
  signupDeadline: { type: String, default: "20:00" }, // Giờ đóng đăng ký vào Chủ Nhật (HH:mm)
  currentPollMessageId: { type: String, default: null },
  currentPollChannelId: { type: String, default: null }, // Channel ID của poll tuần này
  currentBannerUrl: { type: String, default: null }, // Discord CDN URL của banner sau khi upload
  voiceCategory: { type: String, default: null }, // ID Category để tự tạo voice
  voiceNameTemplate: { type: String, default: "Đánh Lãnh Địa Chiến" }, // Tên Voice tự tạo
  voiceChannelT7Id: { type: String, default: null },
  voiceChannelCNId: { type: String, default: null },
  // Tuỳ chỉnh giao diện tin nhắn cho từng server
  customization: {
    bannerUrl: { type: String, default: null },         // Banner poll (thay ảnh Steam mặc định)
    logoUrl: { type: String, default: null },           // Logo thumbnail khi archive
    pollTitle: { type: String, default: null },         // Tiêu đề poll, VD: "Báo Danh Guild War"
    pingMessage: { type: String, default: null },       // Nội dung tin nhắn ping war
    reminderMessage: { type: String, default: null },   // Nội dung tin nhắn nhắc nhở
    accentColorPoll: { type: String, default: null },   // Hex color poll, VD: "#5865F2"
    accentColorPing: { type: String, default: null },   // Hex color ping, VD: "#E74C3C"
    accentColorReminder: { type: String, default: null }, // Hex color reminder, VD: "#F39C12"
  },
}, { timestamps: true });

const guildWarRegistrationSchema = new Schema({
  guildId: { type: String, required: true, index: true },
  weekId: { type: String, required: true, index: true }, // Format ISO week: "2026-W09"
  userId: { type: String, required: true, index: true },
  days: [{ type: String, enum: ["T7", "CN"] }], // Các ngày tham gia
  role: { type: String }, // Vai trò có thể tự do nhập (e.g., "DPS - Cửu kiếm")
  ingameName: { type: String }, // Tên trong game
}, { timestamps: true });

guildWarRegistrationSchema.index({ guildId: 1, weekId: 1, userId: 1 }, { unique: true });

const guildWarMemberSchema = new Schema({
  guildId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  ingameName: { type: String, default: "" },
  role: { type: String, default: "" },
  lane: { type: String, default: "" },
}, { timestamps: true });

guildWarMemberSchema.index({ guildId: 1, userId: 1 }, { unique: true });

const guildWarStatsSchema = new Schema({
  guildId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  totalWars: { type: Number, default: 0 },
  consecutiveWeeks: { type: Number, default: 0 },
  lastParticipatedWeek: { type: String, default: "" } // "2026-W09"
}, { timestamps: true });

guildWarStatsSchema.index({ guildId: 1, userId: 1 }, { unique: true });

// --- Club Activity Schemas (Quản lý điểm cống hiến) ---
const clubActivityConfigSchema = new Schema({
  guildId: { type: String, required: true, unique: true }, // Discord guild ID
  clubId: { type: String, default: null },                 // Game club ID (vd: "aRjHAeODlUBndMlI")
  clubName: { type: String, default: null },               // Tên club (vd: "G-Slime")
  server: { type: String, default: 'SEA', enum: ['SEA', 'CN'] }, // Server game
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const clubActivitySnapshotSchema = new Schema({
  guildId: { type: String, required: true, index: true },
  weekId: { type: String, required: true, index: true },   // Format: "2026-W10"
  clubName: { type: String },
  clubLevel: { type: Number },
  clubLiveness: { type: Number },
  clubFame: { type: Number },
  memberCount: { type: Number },
  fetchedAt: { type: Date, default: Date.now },
  members: [{
    pid: String,
    nickname: String,
    level: Number,
    number_id: Number,
    position: String,
    hostnum: Number,
    week_activity_point: Number,
    last_week_activity: Number,
    month_activity: Number,
    total_activity: Number,
    week_fund: Number,
    total_fund: Number,
  }]
}, { timestamps: true });

clubActivitySnapshotSchema.index({ guildId: 1, weekId: 1 }, { unique: true });

// --- Guild FAQ Schemas (Auto-response embed) ---
const guildFaqConfigSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  channelId: { type: String, default: null }, // Kênh sẽ auto trả lời
  isActive: { type: Boolean, default: true },
  keywords: { type: [String], default: ["guild", "bang hội", "club", "hoạt động guild", "content guild"] },
  embed: {
    title: { type: String, default: null },
    description: { type: String, default: null },
    color: { type: String, default: "#A855F7" },
    footer: { type: String, default: null },
    thumbnailUrl: { type: String, default: null },
  }
}, { timestamps: true });

const VoiceTemplate = mongoose.model('VoiceTemplate', voiceTemplateSchema);
const VoiceParent = mongoose.model('VoiceParent', voiceParentSchema);
const VoiceUser = mongoose.model('VoiceUser', voiceUserSchema);
const FacePreset = mongoose.model('FacePreset', facePresetSchema);
const GuildConfig = mongoose.model('GuildConfig', guildConfigSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);
const WwmStats = mongoose.model('WwmStats', wwmStatsSchema);

const GuildWarConfig = mongoose.model('GuildWarConfig', guildWarConfigSchema);
const GuildWarRegistration = mongoose.model('GuildWarRegistration', guildWarRegistrationSchema);
const GuildWarStats = mongoose.model('GuildWarStats', guildWarStatsSchema);
const GuildWarMember = mongoose.model('GuildWarMember', guildWarMemberSchema);

const ClubActivityConfig = mongoose.model('ClubActivityConfig', clubActivityConfigSchema);
const ClubActivitySnapshot = mongoose.model('ClubActivitySnapshot', clubActivitySnapshotSchema);
const GuildFaqConfig = mongoose.model('GuildFaqConfig', guildFaqConfigSchema);

module.exports = {
  VoiceTemplate, VoiceParent, VoiceUser, FacePreset, GuildConfig, Conversation, WwmStats,
  GuildWarConfig, GuildWarRegistration, GuildWarStats, GuildWarMember,
  ClubActivityConfig, ClubActivitySnapshot, GuildFaqConfig
};