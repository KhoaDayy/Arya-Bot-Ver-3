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

    const { url } = req.query;

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ message: 'Missing URL parameter' });
    }

    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            // Disable SSL verification for easebar.com as it often fails in some network configs
            httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
            timeout: 10000,
        });

        // Forward the Content-Type
        const contentType = response.headers['content-type'];
        if (contentType) {
            res.setHeader('Content-Type', contentType);
        }
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

        return res.status(200).send(response.data);
    } catch (error: any) {
        console.error('[Image Proxy Error]', error.message);
        return res.status(500).json({ message: 'Failed to fetch image' });
    }
}
