/**
 * Rate Limiting 헬퍼
 * IP 기반 요청 속도 제한
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory rate limit store (resets on cold start)
// For production, use Upstash Redis for persistent storage
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
    windowMs: number;      // 시간 윈도우 (밀리초)
    maxRequests: number;   // 윈도우 내 최대 요청 수
}

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetTime: number;
}

/**
 * IP 기반 Rate Limiting 체크
 */
export function checkRateLimit(
    req: VercelRequest,
    config: RateLimitConfig = { windowMs: 60000, maxRequests: 10 }
): RateLimitResult {
    const ip = getClientIP(req);
    const now = Date.now();

    // Get or create rate limit entry
    let entry = rateLimitStore.get(ip);

    if (!entry || now > entry.resetTime) {
        // New window
        entry = {
            count: 1,
            resetTime: now + config.windowMs
        };
        rateLimitStore.set(ip, entry);

        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetTime: entry.resetTime
        };
    }

    // Check limit
    if (entry.count >= config.maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetTime: entry.resetTime
        };
    }

    // Increment count
    entry.count++;
    rateLimitStore.set(ip, entry);

    return {
        allowed: true,
        remaining: config.maxRequests - entry.count,
        resetTime: entry.resetTime
    };
}

/**
 * Rate Limit 응답 헤더 설정
 */
export function setRateLimitHeaders(
    res: VercelResponse,
    result: RateLimitResult,
    maxRequests: number
): void {
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
    res.setHeader('X-RateLimit-Reset', result.resetTime.toString());
}

/**
 * Rate Limit 초과 시 응답
 */
export function rateLimitExceeded(res: VercelResponse, result: RateLimitResult): void {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
    res.setHeader('Retry-After', retryAfter.toString());
    res.status(429).json({
        error: 'Too many requests',
        message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
        retryAfter
    });
}

/**
 * 클라이언트 IP 추출
 */
function getClientIP(req: VercelRequest): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
    }
    const realIP = req.headers['x-real-ip'];
    if (typeof realIP === 'string') {
        return realIP;
    }
    return 'unknown';
}

// Cleanup old entries periodically (every 5 minutes)
setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(ip);
        }
    }
}, 5 * 60 * 1000);
