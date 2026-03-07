import { useState } from 'react';

const BOT_AVATAR_URL = 'https://cdn.discordapp.com/avatars/1468604087015575840/6665997965b49b30636b086bb80dfc58.png?size=128';
const BOT_NAME = 'Arya';

const DEFAULT_BANNER = 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3564740/6d94b048393d5358690a04a7db99f2c9739c703c/header.jpg?t=1763157550';
const DEFAULT_POLL_TITLE = 'Báo Danh Guild War';
const DEFAULT_PING = '## 🚨 ĐẾN GIỜ WAR RỒI ANH EM!\n### Thứ 7 (Saturday)\n@[GW] Thứ 7\n> Vui lòng online vào game **ngay bây giờ**, tập kết và Join Voice!\n> Chúc party đánh war thành công rực rỡ! 💪';
const DEFAULT_REMINDER = '## ⏰ Còn 30 phút — Guild War Thứ 7!\n@[GW] Thứ 7 Chuẩn bị vào game và Join Voice nhé!';

type PreviewTab = 'poll' | 'ping' | 'reminder';

function renderTemplate(template: string, vars: Record<string, string> = {}) {
    return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}

function DiscordMarkdown({ text }: { text: string }) {
    const lines = text.split(/\\n|\n/);

    const renderInline = (str: string) => {
        // Bold
        const parts = str.split(/\*\*(.*?)\*\*/g);
        return parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
        );
    };

    return (
        <div className="flex flex-col gap-0.5">
            {lines.map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return null;
                if (trimmed.startsWith('## ')) {
                    return <h2 key={i} className="font-extrabold text-lg leading-tight">{renderInline(trimmed.slice(3))}</h2>;
                }
                if (trimmed.startsWith('### ')) {
                    return <h3 key={i} className="font-bold text-base leading-tight mt-0.5">{renderInline(trimmed.slice(4))}</h3>;
                }
                if (trimmed.startsWith('> ')) {
                    return (
                        <div key={i} className="pl-3 border-l-4 border-[#4e5058] my-0.5">
                            <p className="text-sm text-white/80">{renderInline(trimmed.slice(2))}</p>
                        </div>
                    );
                }
                if (trimmed.startsWith('-#')) {
                    return <p key={i} className="text-xs text-white/50">{trimmed.replace(/^-# ?/, '')}</p>;
                }
                // Role mentions
                if (trimmed.startsWith('@')) {
                    return (
                        <p key={i} className="text-sm">
                            <span className="bg-[#5865F2]/30 text-[#c9cdfb] px-1 rounded-sm cursor-pointer hover:bg-[#5865F2]/50 transition-colors">
                                {renderInline(trimmed)}
                            </span>
                        </p>
                    );
                }
                return <p key={i} className="text-sm">{renderInline(trimmed)}</p>;
            })}
        </div>
    );
}

function DayBadge({ label, color }: { label: string; color: string }) {
    return (
        <span
            className="inline-flex items-center gap-1 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide"
            style={{ backgroundColor: color }}
        >
            {label}
        </span>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DiscordPreview({ form }: { form: any }) {
    const [activeTab, setActiveTab] = useState<PreviewTab>('poll');
    const watched = form.watch();
    const c = watched.customization || {};

    const bannerUrl = c.bannerUrl || DEFAULT_BANNER;
    const pollTitle = c.pollTitle || DEFAULT_POLL_TITLE;
    const pollColor = c.accentColorPoll || '#5865F2';
    const pingColor = c.accentColorPing || '#E74C3C';
    const reminderColor = c.accentColorReminder || '#F39C12';
    const timeT7 = watched.timeT7 || '19:30';
    const timeCN = watched.timeCN || '19:30';

    const pingText = c.pingMessage
        ? renderTemplate(c.pingMessage, { mention: '@[GW] Thứ 7', day: 'Thứ 7 (Saturday)' })
        : DEFAULT_PING;

    const reminderText = c.reminderMessage
        ? renderTemplate(c.reminderMessage, { mention: '@[GW] Thứ 7', day: 'Thứ 7', minutes: '30' })
        : DEFAULT_REMINDER;

    const accent = activeTab === 'poll' ? pollColor : activeTab === 'ping' ? pingColor : reminderColor;

    // Fake timestamp
    const now = new Date();
    const fakeTimestamp = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()} ${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;

    return (
        <div className="w-full">
            {/* Tab selector */}
            <div className="flex items-center gap-1 mb-3">
                {(['poll', 'ping', 'reminder'] as PreviewTab[]).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${activeTab === tab
                                ? 'bg-zinc-200 text-zinc-900 dark:bg-white/10 dark:text-white'
                                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5'
                            }`}
                    >
                        {tab === 'poll' ? '📋 Poll' : tab === 'ping' ? '🚨 Ping' : '⏰ Reminder'}
                    </button>
                ))}
            </div>

            {/* Discord message container — always dark */}
            <div className="bg-[#313338] text-white rounded-lg overflow-hidden border border-[#3f4147] px-4 py-3 hover:bg-[#2e3035] transition-colors select-none">
                {/* Message header: avatar + bot name + badge + timestamp */}
                <div className="flex gap-3 items-start">
                    {/* Bot avatar */}
                    <img
                        src={BOT_AVATAR_URL}
                        alt={BOT_NAME}
                        className="w-10 h-10 rounded-full mt-0.5 flex-shrink-0 select-none object-cover"
                    />

                    {/* Message content area */}
                    <div className="flex-1 min-w-0">
                        {/* Bot name line */}
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-semibold text-[15px] text-[#f2f3f5] hover:underline cursor-pointer tracking-tight">
                                {BOT_NAME}
                            </span>
                            <span className="bg-[#5865F2] text-white text-[10px] font-bold px-1 rounded-sm flex items-center h-4 leading-none">
                                APP
                            </span>
                            <span className="text-xs text-[#949ba4] font-medium ml-1">
                                {fakeTimestamp}
                            </span>
                        </div>

                        {/* Embed */}
                        <div className="bg-[#2b2d31] rounded-md overflow-hidden border border-[#1e1f22] relative max-w-[520px]">
                            {/* Accent color bar */}
                            <div
                                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md"
                                style={{ backgroundColor: accent }}
                            />

                            <div className="pl-4 pr-3 py-3">
                                {activeTab === 'poll' && (
                                    <div className="flex flex-col gap-2">
                                        {/* Banner */}
                                        <div className="rounded overflow-hidden">
                                            <img
                                                src={bannerUrl}
                                                alt="Banner"
                                                className="w-full max-h-[140px] object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMmIyZDMxIi8+PC9zdmc+'; // Transparent dummy
                                                    (e.target as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.05)';
                                                    (e.target as HTMLDivElement).style.minHeight = '80px';
                                                }}
                                            />
                                        </div>
                                        {/* Title */}
                                        <h3 className="font-extrabold text-[15px] text-white leading-tight mt-1">
                                            📢 {pollTitle} — Tuần 10
                                        </h3>
                                        {/* Schedule row */}
                                        <div className="flex items-center gap-2 flex-wrap text-sm text-white/80">
                                            <DayBadge label="SAT" color="#5865F2" />
                                            <span className="font-bold">Thứ 7</span>
                                            <code className="bg-[#1e1f22] px-1.5 py-0.5 rounded text-[11px] font-mono whitespace-pre text-white/90">
                                                {timeT7}
                                            </code>
                                            <span className="mx-0.5 text-white/40">│</span>
                                            <DayBadge label="SUN" color="#ED4245" />
                                            <span className="font-bold">Chủ Nhật</span>
                                            <code className="bg-[#1e1f22] px-1.5 py-0.5 rounded text-[11px] font-mono whitespace-pre text-white/90">
                                                {timeCN}
                                            </code>
                                        </div>
                                        {/* Deadline */}
                                        {watched.signupDeadline && (
                                            <p className="text-xs text-white/50">
                                                🔒 Đăng ký đóng lúc {watched.signupDeadline} Chủ Nhật
                                            </p>
                                        )}
                                        <div className="h-px bg-white/5 my-1" />
                                        {/* Stats row */}
                                        <div className="flex items-center gap-2 flex-wrap text-sm text-white/80">
                                            <span>👤 Đã báo danh:</span>
                                            <DayBadge label="SAT" color="#5865F2" />
                                            <span>T7 <strong>1</strong></span>
                                            <DayBadge label="SUN" color="#ED4245" />
                                            <span>CN <strong>1</strong></span>
                                            <span>⭐ Cả <strong>2</strong> 1</span>
                                        </div>
                                        {/* Faux buttons */}
                                        <div className="flex gap-2 mt-2 flex-wrap">
                                            <button className="h-8 px-3 rounded text-sm font-semibold bg-[#5865F2] hover:bg-[#4752C4] text-white flex items-center gap-2 pointer-events-none transition-colors">
                                                <DayBadge label="SAT" color="#4752C4" /> Thứ 7
                                            </button>
                                            <button className="h-8 px-3 rounded text-sm font-semibold bg-[#5865F2] hover:bg-[#4752C4] text-white flex items-center gap-2 pointer-events-none transition-colors">
                                                <DayBadge label="SUN" color="#4752C4" /> Chủ Nhật
                                            </button>
                                            <button className="h-8 px-3 rounded text-sm font-semibold bg-[#248046] hover:bg-[#1a6334] text-white flex items-center gap-2 pointer-events-none transition-colors">
                                                🌟 Cả 2 Ngày
                                            </button>
                                            <button className="h-8 px-3 rounded text-sm font-semibold bg-[#DA373C] hover:bg-[#a12d31] text-white flex items-center gap-2 pointer-events-none transition-colors">
                                                ❌ Hủy
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'ping' && (
                                    <div className="text-white">
                                        <DiscordMarkdown text={pingText} />
                                    </div>
                                )}

                                {activeTab === 'reminder' && (
                                    <div className="text-white">
                                        <DiscordMarkdown text={reminderText} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <p className="text-[10px] text-white/40 mt-1.5 italic">
                * Preview gần đúng — trên Discord sẽ khác chút.
            </p>
        </div>
    );
}
