/***
 * Custom types that should be configured by developer
 ***/

import { z } from 'zod';
import { GuildInfo } from './types';

export type CustomGuildInfo = GuildInfo & {};

/**
 * Define feature ids and it's option types
 */
export type CustomFeatures = {
  'face-forum': { faceForumId?: string };
  guiwar: GuildWarFeature;
};

export type GuildWarFeature = {
  channelId?: string;
  roleT7?: string;
  roleCN?: string;
  pollTime?: string;
  timeT7?: string;
  timeCN?: string;
  reminderOffsets?: number[];
  signupDeadline?: string;
  voiceCategory?: string;
  voiceNameTemplate?: string;
  customization?: {
    bannerUrl?: string;
    logoUrl?: string;
    pollTitle?: string;
    pingMessage?: string;
    reminderMessage?: string;
    accentColorPoll?: string;
    accentColorPing?: string;
    accentColorReminder?: string;
  };
};
