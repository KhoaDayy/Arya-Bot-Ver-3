import { IoHappy } from 'react-icons/io5';
import { FeaturesConfig } from './types';
import { provider } from '@/config/translations/provider';
import { createI18n } from '@/utils/i18n';
import { useGuildWarFeature } from './features/GuildWarFeature';
import { useGuildFaqFeature } from './features/GuildFaqFeature';
import { BsListCheck, BsChatLeftText } from 'react-icons/bs';

/**
 * Support i18n (Localization)
 */
const { T } = createI18n(provider, {
  en: {
    music: 'Trình phát nhạc',
    'music description': 'Phát nhạc trong server Discord của bạn',
    gaming: 'Trò chơi',
    'gaming description': 'Chơi game cùng bạn bè',
    'reaction role': 'Reaction Role',
    'reaction role description': 'Tự động gán role khi nhấn vào nút',
    memes: 'Memes',
    'memes description': 'Gửi ảnh vui mỗi ngày',
    guiwar: 'Quản lý Guild War',
    'guiwar description': 'Quản lý báo danh Guild War (Thứ 7 & CN)',
    'guild-faq': 'FAQ Hoạt Động Guild',
    'guild-faq description': 'Tự động trả lời câu hỏi về hoạt động guild',
    'faceforum': 'Kênh Lưu Ảnh Face Preset',
    'faceforum description': 'Kênh diễn đàn dùng làm Kho Hình cho Game.',
  },
  cn: {
    music: 'Trình phát nhạc',
    'music description': 'Phát nhạc trong server Discord của bạn',
    gaming: 'Trò chơi',
    'gaming description': 'Chơi game cùng bạn bè',
    'reaction role': 'Reaction Role',
    'reaction role description': 'Tự động gán role khi nhấn vào nút',
    memes: 'Memes',
    'memes description': 'Gửi ảnh vui mỗi ngày',
    guiwar: 'Quản lý Guild War',
    'guiwar description': 'Quản lý báo danh Guild War (Thứ 7 & CN)',
    'guild-faq': 'FAQ Hoạt Động Guild',
    'guild-faq description': 'Tự động trả lời câu hỏi về hoạt động guild',
    'faceforum': 'Kênh Lưu Ảnh Face Preset',
    'faceforum description': 'Kênh diễn đàn dùng làm Kho Hình cho Game.',
  },
});

/**
 * Define information for each features
 *
 * There is an example:
 */
export const features: FeaturesConfig = {
  guiwar: {
    name: <T text="guiwar" />,
    description: <T text="guiwar description" />,
    icon: <BsListCheck size={20} />,
    useRender: useGuildWarFeature,
  },
  'guild-faq': {
    name: <T text="guild-faq" />,
    description: <T text="guild-faq description" />,
    icon: <BsChatLeftText size={20} />,
    useRender: useGuildFaqFeature,
  },
  'face-forum': {
    name: <T text="faceforum" />,
    description: <T text="faceforum description" />,
    icon: <IoHappy size={20} />,
    useRender() {
      return {
        component: <></>,
        onSubmit: () => { },
      };
    },
  },
};
