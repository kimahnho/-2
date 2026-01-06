import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * 이미지 프록시 API - CORS 문제 해결용
 * 외부 이미지를 가져와서 그대로 반환 (CORS 헤더 추가)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { url } = req.query;

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        // 허용된 도메인만 처리 (보안)
        const allowedDomains = ['res.cloudinary.com', 'cloudinary.com'];
        const urlObj = new URL(url);

        if (!allowedDomains.some(domain => urlObj.hostname.includes(domain))) {
            return res.status(403).json({ error: 'Domain not allowed' });
        }

        // 이미지 fetch
        const response = await fetch(url);

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Failed to fetch image' });
        }

        const contentType = response.headers.get('content-type') || 'image/png';
        const buffer = await response.arrayBuffer();

        // 이미지 바이너리를 직접 반환 (CORS 헤더와 함께)
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        return res.status(200).send(Buffer.from(buffer));
    } catch (error) {
        console.error('Image proxy error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
