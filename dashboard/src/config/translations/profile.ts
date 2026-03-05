import { createI18n } from '@/utils/i18n';
import { common } from './common';
import { provider } from './provider';

export const profile = createI18n(provider, {
  en: {
    logout: common.translations.en.logout,
    language: 'Ngôn ngữ',
    'language description': 'Chọn ngôn ngữ hiển thị',
    settings: 'Cài đặt',
    'dark mode': 'Chế độ tối',
    'dark mode description': 'Bật giao diện tối để bảo vệ mắt',
    'dev mode': 'Chế độ nhà phát triển',
    'dev mode description': 'Dùng để debug và kiểm thử',
  },
  cn: {
    logout: common.translations.cn.logout,
    language: 'Ngôn ngữ',
    'language description': 'Chọn ngôn ngữ hiển thị',
    settings: 'Cài đặt',
    'dark mode': 'Chế độ tối',
    'dark mode description': 'Bật giao diện tối để bảo vệ mắt',
    'dev mode': 'Chế độ nhà phát triển',
    'dev mode description': 'Dùng để debug và kiểm thử',
  },
});
