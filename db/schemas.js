const mongoose = require('mongoose');
const { Schema } = mongoose;

const voiceTemplateSchema = new Schema({
  guildId:    { type: String, required: true, unique: true },
  templateId: { type: String, required: true }
});

const voiceParentSchema = new Schema({
  channelId: { type: String, required: true, unique: true },
  parentId:  { type: String, required: true }
});

const voiceUserSchema = new Schema({
  guildId:     { type: String, required: true, index: true },
  userId:      { type: String, required: true, index: true },
  channelName: { type: String, required: true }
}, { timestamps: true });

voiceUserSchema.index({ guildId: 1, userId: 1 }, { unique: true });

const VoiceTemplate = mongoose.model('VoiceTemplate', voiceTemplateSchema);
const VoiceParent   = mongoose.model('VoiceParent',   voiceParentSchema);
const VoiceUser = mongoose.model('VoiceUser', voiceUserSchema);

module.exports = { VoiceTemplate, VoiceParent, VoiceUser };