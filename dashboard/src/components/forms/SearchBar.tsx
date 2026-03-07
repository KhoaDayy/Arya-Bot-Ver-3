import { Input } from '@/components/ui/input';
import { AiOutlineSearch as SearchIcon } from 'react-icons/ai';
import { common } from '@/config/translations/common';
import { InputHTMLAttributes } from 'react';

export function SearchBar(
  props: {
    input?: InputHTMLAttributes<HTMLInputElement>;
    onSearch?: () => void;
    className?: string;
  }
) {
  const t = common.useTranslations();
  const { input, onSearch, className } = props;

  return (
    <div className={`relative flex w-full items-center ${className || ''}`}>
      <button
        onClick={onSearch}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 flex items-center justify-center p-1 rounded-md transition-colors"
      >
        <SearchIcon className="w-4 h-4" />
      </button>
      <Input
        type="text"
        className="pl-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border-transparent focus-visible:ring-1 focus-visible:ring-indigo-500 dark:focus-visible:ring-cyan-500 text-sm font-medium text-zinc-900 dark:text-锌-100 placeholder:text-zinc-400"
        placeholder={`${t.search}...`}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSearch?.();
        }}
        {...input}
      />
    </div>
  );
}
