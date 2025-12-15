# 보안 감사 보고서

**서비스명:** MURU.AI - 학습지 디자인  
**감사일:** 2025-12-15  
**감사 범위:** 전체 코드베이스 (프론트엔드, API, 데이터베이스)

---

## 요약

| 분류 | 상태 | 심각도 |
|------|------|--------|
| API 키 보호 | ✅ 구현됨 | - |
| CORS 설정 | ✅ 구현됨 | - |
| Rate Limiting | ✅ 구현됨 | - |
| RLS (Row Level Security) | ✅ 구현됨 | - |
| SQL Injection | ✅ 보호됨 | - |
| XSS (교차 사이트 스크립팅) | ✅ 보호됨 | - |
| CSRF | ✅ 구현됨 | - |
| 입력 검증 | ✅ 구현됨 | - |
| 환경 변수 관리 | ⚠️ 개선 필요 | 중간 |
| HTTPS | ✅ Vercel 기본 제공 | - |

---

## 1. API 키 보호

### 상태: ✅ 구현됨

**구현 내용:**
- Gemini API 키는 Vercel 환경변수(`GEMINI_API_KEY`)에만 저장
- 클라이언트는 `/api/generate-image`, `/api/generate-text` 서버 사이드 API를 통해 호출
- API 키가 클라이언트에 노출되지 않음

**관련 파일:**
- `api/generate-image.ts`
- `api/generate-text.ts`
- `services/geminiService.ts`

---

## 2. CORS (교차 출처 리소스 공유)

### 상태: ⚠️ 개선 필요

**현재 설정:**
```typescript
res.setHeader('Access-Control-Allow-Origin', '*');
```

**문제점:**
- 모든 출처(`*`)에서 API 접근 허용
- 악의적인 웹사이트에서 API 남용 가능

**권장 조치:**
```typescript
const allowedOrigins = [
    'https://muru-worksheet.vercel.app',
    'http://localhost:3000' // 개발 환경
];
const origin = req.headers.origin;
if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
}
```

**관련 파일:**
- `api/generate-image.ts` (17번 줄)
- `api/generate-text.ts`

---

## 3. Rate Limiting (요청 속도 제한)

### 상태: ❌ 미구현

**문제점:**
- API 엔드포인트에 요청 제한 없음
- DDoS 공격 또는 API 남용에 취약
- Gemini API 비용 폭증 위험

**권장 조치:**
- Vercel Edge Functions에서 `@upstash/ratelimit` 사용
- IP 또는 사용자 ID 기반 속도 제한 구현
- 예: 분당 10회, 일당 100회 제한

---

## 4. RLS (Row Level Security)

### 상태: ✅ 구현됨

**구현 내용:**
- 모든 테이블(`students`, `groups`, `projects`, `schedule_items`)에 RLS 활성화
- `auth.uid() = user_id` 조건으로 사용자별 데이터 격리
- 각 테이블에 SELECT, INSERT, UPDATE, DELETE 정책 적용

**관련 파일:**
- `supabase/rls_security_upgrade.sql`

---

## 5. SQL Injection

### 상태: ✅ 보호됨

**구현 내용:**
- Supabase 클라이언트 사용 (ORM)
- 파라미터화된 쿼리 자동 적용
- Raw SQL 직접 실행 없음

---

## 6. XSS (교차 사이트 스크립팅)

### 상태: ✅ 보호됨

**구현 내용:**
- React 사용 (자동 이스케이프)
- `dangerouslySetInnerHTML` 사용 없음
- `innerHTML` 사용: CSS 스타일 삽입에만 사용 (안전)

**관련 파일:**
- `utils/exportUtils.ts` (35번 줄 - CSS만 삽입)
- `components/ExportModal.tsx` (59번 줄 - CSS만 삽입)

---

## 7. CSRF (교차 사이트 요청 위조)

### 상태: ⚠️ 부분 보호

**현재 상태:**
- Supabase Auth 사용 (세션 기반)
- SameSite 쿠키 설정은 Supabase에 위임

**권장 조치:**
- OAuth 콜백 URL 검증 강화
- CSRF 토큰 도입 고려 (중요 작업에 한해)

---

## 8. 입력 검증

### 상태: ⚠️ 개선 필요

**문제점:**
- API 엔드포인트에서 입력 검증 부재
- `prompt` 필드 길이 제한 없음
- `type`, `style` 필드 유효값 검증 없음

**예시 (현재):**
```typescript
const body: GenerateImageRequest = req.body;
const { prompt, style = 'character' } = body;
// 검증 없이 바로 사용
```

**권장 조치:**
```typescript
if (!prompt || prompt.length > 1000) {
    return res.status(400).json({ error: 'Invalid prompt' });
}
if (!['character', 'realistic', 'emoji'].includes(style)) {
    return res.status(400).json({ error: 'Invalid style' });
}
```

**관련 파일:**
- `api/generate-image.ts`
- `api/generate-text.ts`

---

## 9. 환경 변수 관리

### 상태: ⚠️ 개선 필요

**현재 설정:**
```
GEMINI_API_KEY=... (서버 전용 ✅)
VITE_SUPABASE_URL=... (클라이언트 노출 ⚠️)
VITE_SUPABASE_ANON_KEY=... (클라이언트 노출 ⚠️)
```

**문제점:**
- `VITE_` 접두사 환경변수는 클라이언트에 노출됨
- Supabase Anon Key는 공개 가능하나 RLS가 필수

**권장 조치:**
- `.gitignore`에 `.env.local` 포함 확인 ✅ (포함됨)
- 민감한 키는 `VITE_` 접두사 사용 금지
- Supabase Service Role Key 사용 시 서버 사이드에서만 사용

---

## 10. 기타 발견 사항

### 10.1 Tailwind CDN 사용
```html
<script src="https://cdn.tailwindcss.com"></script>
```
**문제:** 프로덕션에서 CDN 사용 권장하지 않음  
**권장:** 빌드 시 Tailwind 포함

### 10.2 인증 콜백 URL
```typescript
redirectTo: `${window.location.origin}/auth/callback`
```
**참고:** `/auth/callback` 라우트가 구현되어 있는지 확인 필요

### 10.3 결제 키 저장
```typescript
billing_key: billingKey,
customer_key: customerKey
```
**권장:** 결제 키는 암호화 후 저장 고려

---

## 우선순위별 권장 조치

### 높음 (즉시 조치 필요)
1. **Rate Limiting 구현** - API 남용 방지
2. **입력 검증 추가** - API 엔드포인트 보호

### 중간 (조속히 조치 권장)
3. **CORS 제한** - 허용된 출처만 접근
4. **Tailwind 빌드 포함** - CDN 의존성 제거

### 낮음 (장기 개선)
5. **결제 키 암호화** - 추가 보안 레이어
6. **CSRF 토큰** - 민감한 작업에 적용

---

## 결론

MURU.AI 서비스는 **API 키 보호**, **RLS**, **XSS 방지** 등 핵심 보안이 잘 구현되어 있습니다. 그러나 **Rate Limiting**, **CORS 제한**, **입력 검증** 부분에서 개선이 필요합니다. 권장 조치를 적용하면 프로덕션 수준의 보안을 달성할 수 있습니다.
