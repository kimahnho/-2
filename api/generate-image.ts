import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Gemini 2.5 Flash Image API
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';
const DAILY_LIMIT = 15;

// Allowed origins
const ALLOWED_ORIGINS = [
    'https://www.muruai.com',
    'https://muruai.com',
    'https://muru-worksheet.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
        }

        // --- Supabase Usage Check ---
        let user = null;
        let today = new Date().toISOString().split('T')[0];

        if (supabaseUrl && supabaseKey && req.headers.authorization) {
            const supabase = createClient(supabaseUrl, supabaseKey);
            const token = req.headers.authorization.replace('Bearer ', '');
            const { data: { user: authUser }, error } = await supabase.auth.getUser(token);

            if (authUser) {
                user = authUser;
                const { data: count, error: rpcError } = await supabase.rpc('get_daily_usage_count', { p_date: today });

                if (!rpcError && count >= DAILY_LIMIT) {
                    return res.status(403).json({
                        error: 'Daily limit exceeded',
                        details: '오늘 사용 한도를 모두 사용하셨습니다.'
                    });
                }
            }
        }

        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Call Gemini API
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error:', response.status, errorText);
            return res.status(response.status).json({
                error: 'Gemini API error',
                status: response.status,
                details: errorText
            });
        }

        const data = await response.json();

        // Extract image from response
        if (data.candidates?.[0]?.content?.parts) {
            for (const part of data.candidates[0].content.parts) {
                if (part.inlineData) {

                    // --- Success: Increment Usage ---
                    if (user && supabaseUrl && supabaseKey) {
                        const supabase = createClient(supabaseUrl, supabaseKey);
                        // We need to set the session or just pass the logic. 
                        // Since we are checking user above, we can assume authorized.
                        // However, RLS might prevent increment if we just use anon key without context?
                        // Using RPC with `increment_daily_usage` which uses `auth.uid()`.
                        // We must call it AS the user.
                        // Pass the token again to create a scoped client or set session?
                        // `getUser` confirms token is valid.
                        // We can reuse the previous client `supabase` if we define it in outer scope, BUT
                        // `createClient(url, key, { global: { headers: { Authorization: ... } } })` is better.

                        // Re-init client with auth
                        const authClient = createClient(supabaseUrl, supabaseKey, {
                            global: { headers: { Authorization: req.headers.authorization! } }
                        });

                        await authClient.rpc('increment_daily_usage', { p_date: today });
                    }

                    return res.status(200).json({
                        imageData: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`
                    });
                }
            }
        }

        return res.status(500).json({ error: 'No image in response', data });

    } catch (error: any) {
        console.error('Handler error:', error);
        return res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
}
