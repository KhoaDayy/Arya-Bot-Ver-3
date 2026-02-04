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

const VoiceTemplate = mongoose.model('VoiceTemplate', voiceTemplateSchema);
const VoiceParent = mongoose.model('VoiceParent', voiceParentSchema);
const VoiceUser = mongoose.model('VoiceUser', voiceUserSchema);
const FacePreset = mongoose.model('FacePreset', facePresetSchema);
const GuildConfig = mongoose.model('GuildConfig', guildConfigSchema);

module.exports = { VoiceTemplate, VoiceParent, VoiceUser, FacePreset, GuildConfig };