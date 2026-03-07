import type { NextApiRequest, NextApiResponse } from 'next';
import { execSync } from 'child_process';
import path from 'path';

interface CommitEntry {
    hash: string;
    message: string;
    date: string;
    type: string;
}

interface ChangelogRelease {
    ver: string;
    date: string;
    tag?: string;
    items: { text: string; type: string }[];
}

function parseCommitType(message: string): string {
    const match = message.match(/^(feat|fix|refactor|perf|chore|docs|style|test|ci)/i);
    return match ? match[1].toLowerCase() : 'update';
}

function cleanMessage(message: string): string {
    // Remove conventional commit prefix like "feat: ", "fix(scope): "
    return message.replace(/^(feat|fix|refactor|perf|chore|docs|style|test|ci)(\([^)]*\))?:\s*/i, '').trim();
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Get the repo root (project root is 1 level up from dashboard/)
        const repoRoot = path.resolve(process.cwd(), '..');

        // Fetch last 20 commits
        const raw = execSync(
            'git log -20 --format="%H|||%s|||%ci"',
            { cwd: repoRoot, encoding: 'utf-8' }
        ).trim();

        if (!raw) {
            return res.status(200).json([]);
        }

        const commits: CommitEntry[] = raw.split('\n').map((line) => {
            const [hash, message, date] = line.split('|||');
            return {
                hash: hash?.slice(0, 7) ?? '',
                message: message ?? '',
                date: date ?? '',
                type: parseCommitType(message ?? ''),
            };
        });

        // Group commits by date (day)
        const grouped: Record<string, CommitEntry[]> = {};
        for (const c of commits) {
            const day = c.date.split(' ')[0]; // YYYY-MM-DD
            if (!grouped[day]) grouped[day] = [];
            grouped[day].push(c);
        }

        // Convert to changelog releases (take latest 2 groups)
        const days = Object.keys(grouped).sort().reverse().slice(0, 2);
        const releases: ChangelogRelease[] = days.map((day, i) => {
            const d = new Date(day);
            const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
            return {
                ver: `Build ${day}`,
                date: dateStr,
                ...(i === 0 ? { tag: 'latest' } : {}),
                items: grouped[day].map((c) => ({
                    text: cleanMessage(c.message),
                    type: c.type,
                })),
            };
        });

        res.status(200).json(releases);
    } catch (err: any) {
        console.error('Changelog API error:', err);
        res.status(500).json({ error: 'Failed to fetch changelog', detail: err.message });
    }
}
