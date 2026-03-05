import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from '@/utils/auth/server';
import { IncomingMessage } from 'http';

/**
 * Catch-all proxy: /api/bot/* → Bot Express API
 *
 * Lợi ích:
 * - Client chỉ gọi /api/bot/... (cùng origin) → không CORS
 * - Server-side request đến bot API (localhost hoặc VPS) → luôn nhất quán
 * - API key ẩn hoàn toàn → an toàn
 * - Không cần NEXT_PUBLIC_API_ENDPOINT nữa
 */

// Tắt body parser mặc định của Next.js
// để có thể forward raw body (FormData, file upload, v.v.) đúng cách
export const config = {
    api: {
        bodyParser: false,
    },
};

// Server-only env — không lộ ra client
const BOT_API_INTERNAL =
    process.env.BOT_API_INTERNAL || process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3001';
const DASHBOARD_API_KEY = process.env.DASHBOARD_API_KEY || '';

/**
 * Đọc raw body từ request stream
 */
function getRawBody(req: IncomingMessage): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
        const chunks: Uint8Array[] = [];
        req.on('data', (chunk: Uint8Array) => chunks.push(chunk));
        req.on('end', () => {
            const buf = Buffer.concat(chunks);
            resolve(new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength));
        });
        req.on('error', reject);
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // 1. Verify user session
    const session = getServerSession(req);
    if (!session.success) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // 2. Build target URL
    const { path } = req.query;
    const targetPath = Array.isArray(path) ? path.join('/') : path || '';
    const queryString = new URLSearchParams(
        req.query as Record<string, string>
    );
    // Xoá 'path' param khỏi query string vì nó là catch-all param
    queryString.delete('path');
    const qs = queryString.toString();
    const url = `${BOT_API_INTERNAL}/${targetPath}${qs ? `?${qs}` : ''}`;

    // 3. Forward request
    try {
        const headers: Record<string, string> = {};

        // Giữ nguyên Content-Type gốc (application/json, multipart/form-data, v.v.)
        const incomingContentType = req.headers['content-type'];
        if (incomingContentType) {
            headers['Content-Type'] = incomingContentType;
        }

        // Forward API key (server-only, không lộ ra client)
        if (DASHBOARD_API_KEY) {
            headers['x-api-key'] = DASHBOARD_API_KEY;
        }

        // Forward Discord token để bot có thể verify nếu cần
        headers['Authorization'] = `${session.data.token_type} ${session.data.access_token}`;

        const fetchOptions: RequestInit = {
            method: req.method || 'GET',
            headers,
        };

        // Forward raw body cho POST/PATCH/PUT/DELETE
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            const rawBody = await getRawBody(req);
            if (rawBody.length > 0) {
                fetchOptions.body = rawBody as unknown as BodyInit;
            }
        }

        const response = await fetch(url, fetchOptions);

        // 4. Forward response
        res.status(response.status);

        // Copy relevant headers
        const contentType = response.headers.get('content-type');
        if (contentType) res.setHeader('Content-Type', contentType);

        if (!response.ok) {
            const errorBody = await response.text();
            return res.send(errorBody);
        }

        const data = await response.json();
        return res.json(data);
    } catch (error: any) {
        console.error('[Bot Proxy] Error:', error.message);
        return res.status(502).json({
            error: 'Bot API unavailable',
            detail: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
}
