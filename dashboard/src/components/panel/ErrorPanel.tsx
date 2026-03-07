import { MdOutlineError } from 'react-icons/md';

export function ErrorPanel({ children, retry }: { children: string; retry: () => void }) {
  return (
    <div className="flex w-full h-full items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <MdOutlineError className="text-red-400 w-[100px] h-[100px]" />
        <span className="text-red-400 font-bold text-center">
          {children}
        </span>
        <button
          onClick={retry}
          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 rounded-xl font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
