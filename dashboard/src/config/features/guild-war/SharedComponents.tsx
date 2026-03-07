import { motion } from 'framer-motion';

export const fadeInUp = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export function SectionCard({
    icon: IconComp,
    iconColor,
    title,
    description,
    children,
}: {
    icon: React.ElementType;
    iconColor?: string;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    // Basic mapping for legacy Chakra colors passed as 'var(--chakra-colors-X)'
    // Just in case we haven't updated the parent yet
    let parsedColor = iconColor || '#6366f1';
    if (parsedColor.includes('purple')) parsedColor = '#a855f7';
    else if (parsedColor.includes('blue')) parsedColor = '#3b82f6';
    else if (parsedColor.includes('green')) parsedColor = '#22c55e';
    else if (parsedColor.includes('red')) parsedColor = '#ef4444';
    else if (parsedColor.includes('orange')) parsedColor = '#f97316';
    else if (parsedColor.includes('yellow') || parsedColor.includes('amber')) parsedColor = '#f59e0b';

    return (
        <motion.div variants={fadeInUp} className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#111] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-4 px-5 py-4 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${parsedColor}20`, color: parsedColor }}
                >
                    <IconComp className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white leading-tight mb-0.5">{title}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
                </div>
            </div>
            <div className="px-5 py-5 text-zinc-800 dark:text-zinc-200">
                {children}
            </div>
        </motion.div>
    );
}

export function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <label className="mb-2 text-sm font-semibold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            {children}
            {required && (
                <span className="bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                    bắt buộc
                </span>
            )}
        </label>
    );
}
