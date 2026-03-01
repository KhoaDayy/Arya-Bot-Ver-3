import { provider } from './provider';
import { createI18n } from '@/utils/i18n';

export const dashboard = createI18n(provider, {
  en: {
    pricing: 'Bảng giá',
    learn_more: 'Tìm hiểu thêm',
    invite: {
      title: 'Arya Bot',
      description: 'Bot Discord đa chức năng cho server của bạn',
      bn: 'Invite Now',
    },
    servers: {
      title: 'Chọn Server',
      description: 'Chọn server để cấu hình',
    },
    vc: {
      create: 'Tạo kênh thoại',
      'created channels': 'Kênh thoại đã tạo',
    },
    command: {
      title: 'Sử dụng lệnh',
      description: 'Thống kê sử dụng lệnh của server',
    },
  },
  cn: {
    pricing: 'Bảng giá',
    learn_more: 'Tìm hiểu thêm',
    invite: {
      title: 'Arya Bot',
      description: 'Bot Discord đa chức năng cho server của bạn',
      bn: 'Invite Now',
    },
    servers: {
      title: 'Chọn Server',
      description: 'Chọn server để cấu hình',
    },
    vc: {
      create: 'Tạo kênh thoại',
      'created channels': 'Kênh thoại đã tạo',
    },
    command: {
      title: 'Sử dụng lệnh',
      description: 'Thống kê sử dụng lệnh của server',
    },
  },
});
