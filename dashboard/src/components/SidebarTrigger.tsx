import { IoMenuOutline } from 'react-icons/io5';
import { usePageStore } from '@/stores';

export function SidebarTrigger() {
  const setOpen = usePageStore((s) => s.setSidebarIsOpen);

  return (
    <div className="flex xl:hidden items-center">
      <div className="w-auto h-auto cursor-pointer" onClick={() => setOpen(true)}>
        <IoMenuOutline className="text-zinc-400 dark:text-white my-auto w-5 h-5 mr-2.5 hover:cursor-pointer" />
      </div>
    </div>
  );
}
