import { provider } from './provider';
import { createI18n } from '@/utils/i18n';

export const auth = createI18n(provider, {
  en: {
    login: 'Đăng nhập',
    'login description': 'Đăng nhập để sử dụng Arya Bot Dashboard',
    login_bn: 'Đăng nhập bằng Discord',
  },
  cn: {
    login: 'Đăng nhập',
    'login description': 'Đăng nhập để sử dụng Arya Bot Dashboard',
    login_bn: 'Đăng nhập bằng Discord',
  },
});
