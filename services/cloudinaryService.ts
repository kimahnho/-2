/**
 * Cloudinary Service - 이미지 업로드 서비스
 * @module services/cloudinaryService
 * 
 * Cloudinary 무료 티어:
 * - 25GB 스토리지
 * - 25GB 월간 대역폭
 * - 무제한 이미지 변환
 */

// Cloudinary 설정
// 환경변수가 설정되어 있으면 사용, 아니면 기본값 사용
const getEnvVar = (key: string, defaultValue: string): string => {
    try {
        // @ts-ignore - Vite 환경변수
        return (import.meta as any).env?.[key] || defaultValue;
    } catch {
        return defaultValue;
    }
};

const CLOUD_NAME = getEnvVar('VITE_CLOUDINARY_CLOUD_NAME', 'dabbfycew');
const UPLOAD_PRESET = getEnvVar('VITE_CLOUDINARY_UPLOAD_PRESET', 'muru_unsigned');
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/**
 * 업로드 결과 타입
 */
interface UploadResult {
    url: string;           // 원본 URL
    secureUrl: string;     // HTTPS URL
    publicId: string;      // Cloudinary 공개 ID
    width: number;
    height: number;
    format: string;
    bytes: number;
}

/**
 * 업로드 옵션
 */
interface UploadOptions {
    folder?: string;       // 폴더 경로 (예: 'muru-assets/users')
    tags?: string[];       // 태그 (예: ['user-upload', 'worksheet'])
    transformation?: string; // 변환 옵션 (예: 'w_1200,h_1200,c_limit')
}

/**
 * 파일을 Cloudinary에 업로드
 * @param file 업로드할 파일
 * @param options 업로드 옵션
 * @returns 업로드 결과 (URL 등)
 */
export const uploadToCloudinary = async (
    file: File,
    options: UploadOptions = {}
): Promise<UploadResult> => {
    const { folder = 'muru-assets', tags = [], transformation } = options;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);

    if (tags.length > 0) {
        formData.append('tags', tags.join(','));
    }

    // NOTE: 'eager' 파라미터는 unsigned upload에서 사용 불가
    // 업로드 후 클라이언트에서 getTransformedUrl()로 변환 적용 가능

    try {
        const response = await fetch(UPLOAD_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Upload failed');
        }

        const data = await response.json();

        console.log(`[Cloudinary] Uploaded: ${file.name} → ${data.secure_url}`);

        return {
            url: data.url,
            secureUrl: data.secure_url,
            publicId: data.public_id,
            width: data.width,
            height: data.height,
            format: data.format,
            bytes: data.bytes
        };
    } catch (error) {
        console.error('[Cloudinary] Upload error:', error);
        throw error;
    }
};

/**
 * Data URL을 Cloudinary에 업로드
 * @param dataUrl Base64 data URL
 * @param options 업로드 옵션
 * @returns 업로드 결과
 */
export const uploadDataUrlToCloudinary = async (
    dataUrl: string,
    options: UploadOptions = {}
): Promise<UploadResult> => {
    const { folder = 'muru-assets', tags = [] } = options;

    const formData = new FormData();
    formData.append('file', dataUrl);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);

    if (tags.length > 0) {
        formData.append('tags', tags.join(','));
    }

    try {
        const response = await fetch(UPLOAD_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Upload failed');
        }

        const data = await response.json();

        return {
            url: data.url,
            secureUrl: data.secure_url,
            publicId: data.public_id,
            width: data.width,
            height: data.height,
            format: data.format,
            bytes: data.bytes
        };
    } catch (error) {
        console.error('[Cloudinary] Upload error:', error);
        throw error;
    }
};

/**
 * Cloudinary URL에 변환 적용
 * @param url 원본 Cloudinary URL
 * @param transformations 변환 옵션 배열
 * @returns 변환된 URL
 * 
 * @example
 * // 400px 너비로 리사이징
 * getTransformedUrl(url, ['w_400', 'c_limit'])
 * 
 * // 썸네일 생성
 * getTransformedUrl(url, ['w_100', 'h_100', 'c_fill'])
 */
export const getTransformedUrl = (
    url: string,
    transformations: string[]
): string => {
    if (!url.includes('cloudinary.com')) return url;

    const transformation = transformations.join(',');
    // URL에 변환 삽입 (upload/ 뒤에)
    return url.replace('/upload/', `/upload/${transformation}/`);
};

/**
 * Cloudinary가 설정되었는지 확인
 */
export const isCloudinaryConfigured = (): boolean => {
    return !!CLOUD_NAME && !!UPLOAD_PRESET;
};
