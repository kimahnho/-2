import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkRateLimit, setRateLimitHeaders, rateLimitExceeded } from './rateLimit';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

// Rate limit: 20 requests per minute per IP (text is cheaper than images)
const RATE_LIMIT_CONFIG = { windowMs: 60000, maxRequests: 20 };

// Allowed origins for CORS and CSRF protection
const ALLOWED_ORIGINS = [
    'https://muru-worksheet.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
];

// Valid values for validation
const VALID_TYPES = ['story', 'sentence', 'words'];
const MAX_TOPIC_LENGTH = 500;

interface GenerateTextRequest {
    topic: string;
    type: 'story' | 'sentence' | 'words';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const origin = req.headers.origin;
    const referer = req.headers.referer;

    // CORS headers for allowed origins
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // CSRF Protection: Verify origin or referer
    const isOriginValid = origin && ALLOWED_ORIGINS.includes(origin);
    const isRefererValid = referer && ALLOWED_ORIGINS.some(allowed => referer.startsWith(allowed));

    if (!isOriginValid && !isRefererValid) {
        console.warn('CSRF blocked:', { origin, referer });
        return res.status(403).json({ error: 'Forbidden: Invalid origin' });
    }

    // Rate limiting check
    const rateLimitResult = checkRateLimit(req, RATE_LIMIT_CONFIG);
    setRateLimitHeaders(res, rateLimitResult, RATE_LIMIT_CONFIG.maxRequests);

    if (!rateLimitResult.allowed) {
        return rateLimitExceeded(res, rateLimitResult);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY is not configured');
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        const body: GenerateTextRequest = req.body;
        const { topic, type } = body;

        // Input validation
        if (!topic || topic.length > MAX_TOPIC_LENGTH) {
            return res.status(400).json({ error: `Topic is required and must be under ${MAX_TOPIC_LENGTH} characters.` });
        }

        if (!type || !VALID_TYPES.includes(type)) {
            return res.status(400).json({ error: 'Invalid type. Must be "story", "sentence", or "words".' });
        }

        const systemInstruction = "당신은 언어치료사와 특수교사를 돕는 유능한 보조자입니다. 모든 답변은 한국어로 작성해야 하며, 아이들이 이해하기 쉬운 언어를 사용하세요.";

        let promptText = "";
        if (type === 'story') {
            promptText = `다음 주제에 대해 아주 짧고 간단한 사회적 이야기를 써주세요 (3-4문장): ${topic}. 아이들이 이해하기 쉬운 표현을 사용하세요.`;
        } else if (type === 'sentence') {
            promptText = `다음 주제에 대한 3가지 문장 시작 부분(Sentence Starters)을 만들어주세요: ${topic}. 간단한 목록 형식으로 작성하세요.`;
        } else {
            promptText = `다음 주제와 관련된 5가지 핵심 어휘를 나열해주세요: ${topic}.`;
        }

        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemInstruction }] },
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: {
                    maxOutputTokens: 200
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error:', errorText);
            return res.status(response.status).json({ error: 'Gemini API error' });
        }

        const data = await response.json();

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '텍스트를 생성할 수 없습니다.';

        return res.status(200).json({ text });
    } catch (error) {
        console.error('Generate text error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
