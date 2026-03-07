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

    const { keyword } = req.query;

    if (!keyword || typeof keyword !== 'string') {
        return res.status(400).json({ message: 'Vui lòng nhập Keyword (Tên hoặc UID)' });
    }

    try {
        const WWM_LOCAL_API = process.env.WWM_LOCAL_API || 'http://localhost:3000';
        const response = await axios.get(`${WWM_LOCAL_API}/id`, {
            params: { keyword: keyword },
            timeout: 10000,
        });

        if (response.data.code !== undefined && response.data.code !== 0) {
            return res.status(404).json({ message: response.data.msg || 'Không tìm thấy người chơi' });
        }

        if (Object.keys(response.data).length === 0 || !response.data.nickname) {
            return res.status(404).json({ message: 'Không tìm thấy người chơi (UID/Tên không tồn tại hoặc sai Server).' });
        }

        return res.status(200).json(response.data);
    } catch (error: any) {
        console.error('[Feature-API: Player-Lookup Error]', error.message);
        const msg = error.response?.status === 404
            ? 'Không tìm thấy người chơi!'
            : 'Đã xảy ra lỗi khi tra cứu (Loss Connection/Timeout).';
        return res.status(500).json({ message: msg });
    }
}
