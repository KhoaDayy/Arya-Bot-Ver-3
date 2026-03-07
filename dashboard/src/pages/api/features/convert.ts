import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { getServerSession } from '@/utils/auth/server';

function parsePresetId(raw: string) {
    let id = raw;
    if (id.includes('id=')) {
        const parts = id.split('id=');
        if (parts.length > 1) id = parts[1].split('&')[0];
    }
    return id.trim();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const session = getServerSession(req);
    if (!session.success) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Vui lòng nhập Mã ID hoặc Link chia sẻ' });
    }

    const finalId = parsePresetId(id);

    try {
        const WWM_LOCAL_API = process.env.WWM_LOCAL_API || 'http://localhost:3000';
        const response = await axios.get(`${WWM_LOCAL_API}/convert`, {
            params: { id: finalId },
            timeout: 10000,
        });

        const responseBody = response.data;

        // Xử lý origin giống logic bot
        let data;
        let viewDataStr;

        if (responseBody && responseBody.origin) {
            data = responseBody.origin;
            viewDataStr = data.view_data;
        } else if (responseBody && responseBody.data) {
            data = responseBody.data;
            viewDataStr = responseBody.data; // Trường hợp data thẳng là String Json
        } else {
            data = responseBody;
            viewDataStr = data.view_data;
        }

        if (!data || !viewDataStr) {
            return res.status(404).json({ message: 'Không tìm thấy thông tin cho mã này' });
        }

        // Parse face_data
        let viewData;
        try {
            viewData = typeof viewDataStr === 'string' ? JSON.parse(viewDataStr) : viewDataStr;
        } catch {
            return res.status(400).json({ message: 'Lỗi parse dữ liệu server' });
        }

        const faceData = viewData?.face_data;
        if (!faceData) {
            return res.status(400).json({ message: 'Mã này không chứa dữ liệu khuôn mặt' });
        }

        // Include extra data cho format CN sang Global
        const extraData: any = {};
        if (viewData.face_skeleton_data) extraData.face_skeleton_data = viewData.face_skeleton_data;
        if (viewData.face_makeup_data) extraData.face_makeup_data = viewData.face_makeup_data;

        let fullPresetStr = faceData;
        if (Object.keys(extraData).length > 0) {
            fullPresetStr += ' ' + JSON.stringify(extraData);
        }

        return res.status(200).json({
            id: finalId,
            name: data.name || 'Unknown',
            msg: data.msg || 'Không có mô tả',
            heat_val: data.heat_val,
            like_num: data.like_num,
            hostnum: data.hostnum,
            picture_url: data.picture_url,
            plan_id: data.plan_id || finalId,
            presetData: fullPresetStr
        });

    } catch (error: any) {
        console.error('[Feature-API: Face-Converter Error]', error.message);
        const msg = error.response?.status === 404
            ? 'Không tìm thấy preset!'
            : 'Đã xảy ra lỗi khi convert (Loss Connection/Timeout).';
        return res.status(500).json({ message: msg });
    }
}
