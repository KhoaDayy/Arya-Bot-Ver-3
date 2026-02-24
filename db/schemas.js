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

const VoiceTemplate = mongoose.model('VoiceTemplate', voiceTemplateSchema);
const VoiceParent = mongoose.model('VoiceParent', voiceParentSchema);
const VoiceUser = mongoose.model('VoiceUser', voiceUserSchema);
const FacePreset = mongoose.model('FacePreset', facePresetSchema);
const GuildConfig = mongoose.model('GuildConfig', guildConfigSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);
const WwmStats = mongoose.model('WwmStats', wwmStatsSchema);

module.exports = { VoiceTemplate, VoiceParent, VoiceUser, FacePreset, GuildConfig, Conversation, WwmStats };