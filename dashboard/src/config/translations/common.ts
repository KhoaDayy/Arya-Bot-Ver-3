import { provider } from './provider';
import { createI18n } from '@/utils/i18n';

export const common = createI18n(provider, {
  en: {
    loading: 'Đang tải',
    search: 'Tìm kiếm...',
    'select lang': 'Chọn ngôn ngữ',
    'select role': 'Chọn role',
    'select channel': 'Chọn kênh',
    dashboard: 'Bảng điều khiển',
    profile: 'Hồ sơ',
    pages: 'Trang',
    logout: 'Đăng xuất',
  },
  cn: {
    loading: 'Đang tải',
    search: 'Tìm kiếm...',
    'select lang': 'Chọn ngôn ngữ',
    'select role': 'Chọn role',
    'select channel': 'Chọn kênh',
    dashboard: 'Bảng điều khiển',
    profile: 'Hồ sơ',
    pages: 'Trang',
    logout: 'Đăng xuất',
  },
});
