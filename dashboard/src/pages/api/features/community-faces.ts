import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { getServerSession } from '@/utils/auth/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const session = getServerSession(req);
    if (!session.success) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '12', 10);
    const sortBy = (req.query.sortBy as string) || 'newest';
    const bodyType = req.query.bodyType as string; // Optional

    try {
        const BOT_API = process.env.BOT_API_INTERNAL || 'http://localhost:3001';
        const apiKey = process.env.DASHBOARD_API_KEY;

        const response = await axios.get(`${BOT_API}/api/community-faces`, {
            params: { page, limit, sortBy, bodyType },
            headers: apiKey ? { 'x-api-key': apiKey } : {},
            timeout: 10000,
        });

        return res.status(200).json(response.data);
    } catch (error: any) {
        console.error('[Feature-API: Community-Faces Error]', error.message);
        return res.status(500).json({ message: 'Đã xảy ra lỗi khi tải danh sách community faces.' });
    }
}
