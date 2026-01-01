import { supabase } from './storageAdapter';

/**
 * Gemini Service - 클라이언트 사이드
 * 
 * 서버 API를 통해 Gemini 2.5 Flash Image로 이미지 생성
 */

export const DAILY_LIMIT = 15;

const getTodayString = () => new Date().toISOString().split('T')[0];

export const getDailyUsageCount = async (): Promise<number> => {
  const today = getTodayString();
  let count = 0;
  console.log('[Gemini] Checking daily usage for:', today);

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase.rpc('get_daily_usage_count', { p_date: today });
      console.log('[Gemini] Supabase RPC result:', { data, error });
      if (!error && data !== null) count = data;
      else if (error) console.warn('Supabase check failed, falling back to local:', error);
    } else {
      console.log('[Gemini] No Supabase user, checking local storage');
    }
  } else {
    console.log('[Gemini] Supabase client not initialized');
  }

  // If no user or Supabase failed, check localStorage for fallback logic
  if (!supabase || count === 0) {
    const storedDate = localStorage.getItem('muru_last_usage_date');
    const localCount = parseInt(localStorage.getItem('muru_daily_usage_count') || '0', 10);
    console.log('[Gemini] Local storage check:', { storedDate, localCount, today });

    if (storedDate === today) {
      if (localCount > count) {
        console.log('[Gemini] Using local count because it is higher:', localCount);
        count = localCount;
      }
    } else {
      console.log('[Gemini] Resetting local storage for new day');
      localStorage.setItem('muru_last_usage_date', today);
      localStorage.setItem('muru_daily_usage_count', '0');
    }
  }

  console.log('[Gemini] Final Daily Usage Count:', count);
  return count;
};

const checkUsageLimit = async () => {
  const count = await getDailyUsageCount();

  if (count >= DAILY_LIMIT) {
    throw new Error(`오늘 사용할 수 있는 AI 생성 횟수를 모두 사용하셨어요.\n한도는 매일 자정에 다시 초기화됩니다.`);
  }
};

const incrementUsage = async () => {
  const today = getTodayString();
  let incremented = false;

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.rpc('increment_daily_usage', { p_date: today });
      if (!error) {
        incremented = true;
        console.log('[Gemini] Usage incremented in DB');
      } else {
        console.error('Supabase increment failed:', error);
      }
    }
  }

  // Backup: Update localStorage (always sync local count just in case, or if supabase failed)
  const storedDate = localStorage.getItem('muru_last_usage_date');
  let currentCount = 0;

  if (storedDate === today) {
    currentCount = parseInt(localStorage.getItem('muru_daily_usage_count') || '0', 10);
  } else {
    localStorage.setItem('muru_last_usage_date', today);
  }

  // If we haven't incremented in DB (no auth or connection), increment local
  if (!incremented) {
    const newCount = currentCount + 1;
    localStorage.setItem('muru_daily_usage_count', newCount.toString());
    console.log('[Gemini] Local usage incremented:', newCount);
  }
};

// 스타일별 프롬프트
const stylePrompts: Record<string, string> = {
  character: "Cute modern Korean style 2D vector illustration, flat design, typical modern Korean children's book illustration style, characters wearing modern casual clothes, soft and friendly colors, thick outlines, simple and clear.",
  realistic: "Photorealistic modern Korean style photography, modern Korean environment (apartments, schools, cities), modern objects and people, high quality, realistic lighting and textures.",
  emoji: "3D render icon, cute modern Korean style emoji, clay texture, soft round shapes, sticker style, glossy finish, isometric view."
};

// 공통 지침
const commonInstructions = `
CRITICAL VISUAL INSTRUCTIONS:
1. Do NOT include any text, letters, words, or labels in the image.
2. The background should be solid white unless the prompt implies a full scene.
3. Keep the subject clear and centered.
4. Characters should wear modern casual clothing (t-shirts, hoodies, etc).
5. Settings should be modern Korean environments.
6. AVOID traditional Korean clothing (Hanbok) unless explicitly requested.
7. AVOID adding details, objects, or elements NOT explicitly mentioned in the prompt. Only generate what is described.
`;

export const generateTherapyImage = async (
  prompt: string,
  style: 'character' | 'realistic' | 'emoji' = 'character',
  _referenceImage?: string
): Promise<string> => {
  await checkUsageLimit();

  const stylePrompt = stylePrompts[style] || stylePrompts.character;
  const fullPrompt = `${stylePrompt}\n\nSubject: ${prompt}\n\n${commonInstructions}`;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  }

  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt: fullPrompt })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('API Error:', data);
    throw new Error(data.details || data.error || '이미지 생성에 실패했습니다.');
  }

  // NOTE: Usage is now incremented by the server. 
  // We just return the data. Client should re-fetch usage count if needed.
  return data.imageData;
};

export const generateCharacterEmotion = async (
  characterDescription: string,
  emotion: string,
  style: 'character' | 'realistic' | 'emoji' = 'character'
): Promise<string> => {
  await checkUsageLimit();

  const stylePrompt = stylePrompts[style] || stylePrompts.character;

  const prompt = `${stylePrompt}

TASK: Generate a facial expression showing "${emotion}" emotion.

CRITICAL VISUAL GUIDELINES FOR THERAPY (ASD Friendly):
1. EXAGGERATED CLARITY: The facial expression must be very distinct and unambiguous.
2. KEY FEATURES: Focus heavily on the shape of the EYEBROWS, EYES, and MOUTH to clearly signify "${emotion}".
3. NO AMBIGUITY: Do not create subtle or mixed emotions. It should be instantly recognizable by a child.
4. FACE FOCUS: Keep the face fully visible, well-lit, and centered.

Character Description: ${characterDescription}
Upper body portrait. Solid white background.

${commonInstructions}`;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  }

  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('API Error:', data);
    throw new Error(data.details || data.error || '감정 이미지 생성에 실패했습니다.');
  }

  return data.imageData;
};
