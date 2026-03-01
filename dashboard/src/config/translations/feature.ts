import { provider } from './provider';
import { createI18n } from '@/utils/i18n';

export const feature = createI18n(provider, {
  en: {
    unsaved: 'Lưu thay đổi',
    error: {
      'not enabled': 'Chưa kích hoạt',
      'not enabled description': 'Bật tính năng này?',
      'not found': 'Không tìm thấy',
      'not found description': 'Không tìm thấy tính năng này',
    },
    bn: {
      enable: 'Kích hoạt',
      disable: 'Tắt',
      save: 'Lưu',
      discard: 'Hủy bỏ',
    },
  },
  cn: {
    unsaved: 'Lưu thay đổi',
    error: {
      'not enabled': 'Chưa kích hoạt',
      'not enabled description': 'Bật tính năng này?',
      'not found': 'Không tìm thấy',
      'not found description': 'Không tìm thấy tính năng này',
    },
    bn: {
      enable: 'Kích hoạt',
      disable: 'Tắt',
      save: 'Lưu',
      discard: 'Hủy bỏ',
    },
  },
});
