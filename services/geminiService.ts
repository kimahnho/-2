/**
 * Gemini Service - 클라이언트 사이드
 * 
 * 보안: 직접 API 호출 대신 서버 사이드 API 엔드포인트(/api/generate-image)를 통해 호출
 * API 키는 Vercel 환경변수에만 저장되어 클라이언트에 노출되지 않음
 */

/**
 * Generates an image for SLP materials (flashcards, symbols, scenes)
 * Calls server-side API to protect API key
 */
export const generateTherapyImage = async (
  prompt: string,
  style: 'character' | 'realistic' | 'emoji' = 'character',
  referenceImageUrl?: string
): Promise<string> => {
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'therapy-image',
      prompt,
      style,
      referenceImageBase64: referenceImageUrl
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '이미지 생성에 실패했습니다.');
  }

  const data = await response.json();
  return data.imageData;
};

/**
 * Generates a specific emotion for a defined character to maintain consistency
 * Calls server-side API to protect API key
 */
export const generateCharacterEmotion = async (
  characterDescription: string,
  emotion: string,
  style: 'character' | 'realistic' | 'emoji',
  referenceImageUrl?: string
): Promise<string> => {
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'character-emotion',
      prompt: '',
      style,
      characterDescription,
      emotion,
      referenceImageBase64: referenceImageUrl
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '감정 이미지 생성에 실패했습니다.');
  }

  const data = await response.json();
  return data.imageData;
};

/**
 * Generates text content, social stories, or sentence starters
 * Note: This still uses client-side for now, can be migrated to server if needed
 */
export const generateTherapyText = async (topic: string, type: 'story' | 'sentence' | 'words'): Promise<string> => {
  const response = await fetch('/api/generate-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, type })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '텍스트 생성에 실패했습니다.');
  }

  const data = await response.json();
  return data.text;
};
