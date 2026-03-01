import { provider } from './provider';
import { createI18n } from '@/utils/i18n';

export const guild = createI18n(provider, {
  en: {
    features: 'Tính năng',
    banner: {
      title: 'Xin chào!',
      description: 'Quản lý và cấu hình Arya Bot cho server của bạn',
    },
    error: {
      'not found': 'Không tìm thấy!',
      'not found description': 'Bot chưa được mời vào server này, hãy mời bot nhé!',
      load: 'Không thể tải server',
    },
    bn: {
      'enable feature': 'Bật',
      'config feature': 'Cấu hình',
      invite: 'Mời bot',
      settings: 'Cài đặt',
    },
  },
  cn: {
    features: 'Tính năng',
    banner: {
      title: 'Xin chào!',
      description: 'Quản lý và cấu hình Arya Bot cho server của bạn',
    },
    error: {
      'not found': 'Không tìm thấy!',
      'not found description': 'Bot chưa được mời vào server này, hãy mời bot nhé!',
      load: 'Không thể tải server',
    },
    bn: {
      'enable feature': 'Bật',
      'config feature': 'Cấu hình',
      invite: 'Mời bot',
      settings: 'Cài đặt',
    },
  },
});
