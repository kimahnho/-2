
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Helper to extract base64 data from a data URI
 */
const extractBase64 = (dataUri: string): string => {
  return dataUri.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
};

/**
 * Generates an image for SLP materials (flashcards, symbols, scenes)
 * Enforces MODERN Korean style/sentiment.
 * If referenceImageUrl is provided, it generates the scene featuring that specific character.
 */
export const generateTherapyImage = async (
  prompt: string, 
  style: 'character' | 'realistic' | 'emoji' = 'character',
  referenceImageUrl?: string
): Promise<string> => {
  const ai = getAiClient();
  
  const stylePrompts: Record<string, string> = {
    character: "Cute modern Korean style 2D vector illustration, flat design, typical modern Korean children's book illustration style, characters wearing modern casual clothes, soft and friendly colors, thick outlines, simple and clear.",
    realistic: "Photorealistic modern Korean style photography, modern Korean environment (apartments, schools, cities), modern objects and people, high quality, realistic lighting and textures.",
    emoji: "3D render icon, cute modern Korean style emoji, clay texture, soft round shapes, sticker style, glossy finish, isometric view."
  };

  const selectedStyle = stylePrompts[style] || stylePrompts['character'];

  // Base instruction for style and culture
  const culturalInstruction = `
  CRITICAL CULTURAL INSTRUCTION:
  1. The visual style, character features, clothing, and background objects MUST reflect MODERN Korean culture and daily life.
  2. Characters MUST wear contemporary, casual clothing (e.g., t-shirts, hoodies, modern school uniforms). 
  3. Settings should be modern Korean environments (e.g., modern apartments with linoleum or wood floors, schools, parks, cities).
  4. STRICTLY AVOID traditional Korean clothing (Hanbok) or historical buildings (Hanok) unless the prompt explicitly requests them.
  5. Avoid Western-style features or settings (e.g. avoid shoes inside houses).

  CRITICAL VISUAL INSTRUCTIONS:
  1. Do NOT include any text, letters, words, or labels in the image.
  2. The background should be solid white unless the prompt implies a full scene (e.g. 'in a park').
  3. Keep the subject clear.
  `;

  let finalPrompt = "";
  let parts: any[] = [];

  if (referenceImageUrl) {
    // --- SCENE GENERATION WITH CHARACTER REFERENCE ---
    finalPrompt = `
    TASK: Generate an image of the character from the REFERENCE IMAGE acting out the following scene: "${prompt}".

    INSTRUCTIONS:
    1. CHARACTER CONSISTENCY: You MUST use the provided reference image as the absolute source of truth for the protagonist's appearance (face, hair, skin tone, clothing style). The character in the new image must look like the SAME person.
    2. SCENE: Place this character in the context described: ${prompt}.
    3. STYLE: Apply the following style: ${selectedStyle}.
    
    ${culturalInstruction}
    `;

    const base64Data = extractBase64(referenceImageUrl);
    parts = [
      { text: finalPrompt },
      { inlineData: { mimeType: 'image/png', data: base64Data } }
    ];

  } else {
    // --- GENERIC GENERATION ---
    finalPrompt = `Create an image with the following style: ${selectedStyle}. 
    Subject: ${prompt}. 
    
    ${culturalInstruction}`;

    parts = [{ text: finalPrompt }];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    // Extract image from response
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    }
    
    throw new Error("이미지 데이터를 받지 못했습니다.");
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
};

/**
 * Generates a specific emotion for a defined character to maintain consistency
 * Uses the base character image as a reference if provided.
 * Enforces MODERN Korean style/sentiment.
 */
export const generateCharacterEmotion = async (
  characterDescription: string, 
  emotion: string, 
  style: 'character' | 'realistic' | 'emoji',
  referenceImageUrl?: string
): Promise<string> => {
  const ai = getAiClient();

  // 1. Define Base Subject with Modern Korean default
  let baseSubject = "";
  switch (style) {
    case 'realistic': 
      baseSubject = "A photorealistic modern Korean person/child in modern clothing"; 
      break;
    case 'emoji': 
      baseSubject = "A 3D rendered modern Korean style emoji character, cute and soft"; 
      break;
    case 'character': 
    default: 
      baseSubject = "A cute modern Korean style character illustration, manhwa style, wearing casual clothes"; 
      break;
  }

  // 2. Construct Prompt with focus on Clarity for ASD
  let prompt = "";
  let parts: any[] = [];

  // Therapy-focused instruction for clear emotions
  const emotionInstruction = `
    TASK: Generate a facial expression for the emotion: "${emotion}".
    
    CRITICAL VISUAL GUIDELINES FOR THERAPY (ASD Friendly):
    1. EXAGGERATED CLARITY: The facial expression must be very distinct and unambiguous.
    2. KEY FEATURES: Focus heavily on the shape of the EYEBROWS, EYES, and MOUTH to clearly signify "${emotion}".
    3. NO AMBIGUITY: Do not create subtle or mixed emotions. It should be instantly recognizable by a child.
    4. FACE FOCUS: Keep the face fully visible, well-lit, and centered.
    5. KOREAN STYLE: Ensure the character features and aesthetic remain distinctly Modern Korean. No Hanbok.
  `;

  if (referenceImageUrl) {
    // Image-to-Image with Reference
    prompt = `Using the provided reference image as the absolute source of truth for the character's appearance (hair, clothes, face shape, skin tone), generate a NEW image of this EXACT SAME character.
    
    ${emotionInstruction}
    
    Style: ${baseSubject}.
    Description for context: ${characterDescription}.
    
    IMPORTANT: 
    - Keep the character looking exactly like the reference image (same person).
    - Solid white background.
    - Upper body portrait.`;

    const base64Data = extractBase64(referenceImageUrl);
    
    parts = [
      { text: prompt },
      { 
        inlineData: {
          mimeType: 'image/png',
          data: base64Data
        }
      }
    ];
  } else {
    // Text-to-Image Fallback
    prompt = `${baseSubject}, ${characterDescription}. 
    
    ${emotionInstruction}
    
    IMPORTANT: Maintain consistent facial features. 
    Upper body portrait. Isolated subject. Solid white background.`;
    
    parts = [{ text: prompt }];
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // 2.5 flash supports multimodal input
      contents: {
        parts: parts
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("감정 이미지 생성 실패");
  } catch (error) {
    console.error("Gemini Emotion Generation Error:", error);
    throw error;
  }
};

/**
 * Generates text content, social stories, or sentence starters
 */
export const generateTherapyText = async (topic: string, type: 'story' | 'sentence' | 'words'): Promise<string> => {
  const ai = getAiClient();
  
  // Update instructions to ensure Korean output
  let systemInstruction = "당신은 언어치료사와 특수교사를 돕는 유능한 보조자입니다. 모든 답변은 한국어로 작성해야 하며, 아이들이 이해하기 쉬운 언어를 사용하세요.";
  let promptText = "";

  if (type === 'story') {
    promptText = `다음 주제에 대해 아주 짧고 간단한 사회적 이야기를 써주세요 (3-4문장): ${topic}. 아이들이 이해하기 쉬운 표현을 사용하세요.`;
  } else if (type === 'sentence') {
    promptText = `다음 주제에 대한 3가지 문장 시작 부분(Sentence Starters)을 만들어주세요: ${topic}. 간단한 목록 형식으로 작성하세요.`;
  } else {
    promptText = `다음 주제와 관련된 5가지 핵심 어휘를 나열해주세요: ${topic}.`;
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        systemInstruction: systemInstruction,
        maxOutputTokens: 200, // Keep it short
      }
    });

    return response.text || "텍스트를 생성할 수 없습니다.";
  } catch (error) {
    console.error("Gemini Text Generation Error:", error);
    throw error;
  }
};
