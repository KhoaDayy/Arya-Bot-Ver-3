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

// --- Club Activity Types ---
export type ClubMemberSnapshot = {
  pid: string;
  nickname: string;
  level: number;
  number_id: number;
  position: string;
  hostnum: number;
  week_activity_point: number;
  last_week_activity: number;
  month_activity: number;
  total_activity: number;
  week_fund: number;
  total_fund: number;
};

export type ClubActivitySnapshotRes = {
  weekId: string;
  clubName: string;
  clubLevel: number;
  clubLiveness: number;
  clubFame: number;
  memberCount: number;
  fetchedAt: string;
  members: ClubMemberSnapshot[];
};

export type ClubActivityConfigRes = {
  clubId: string | null;
  clubName: string | null;
  server: string;
  isActive: boolean;
};

export type ClubWeekSummary = {
  weekId: string;
  fetchedAt: string;
  clubName: string;
  memberCount: number;
};
