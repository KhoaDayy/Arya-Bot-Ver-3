import { common } from '@/config/translations/common';
import { MdPerson, MdDashboard } from 'react-icons/md';
import { SidebarItemInfo } from '@/utils/router';

const items: SidebarItemInfo[] = [
  {
    name: <common.T text="dashboard" />,
    path: '/user/home',
    icon: <MdDashboard size={20} />,
  },
  {
    name: <common.T text="profile" />,
    path: '/user/profile',
    icon: <MdPerson size={20} />,
  },
];

export default items;
