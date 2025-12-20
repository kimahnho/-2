/**
 * Image Utilities - 이미지 압축 및 리사이징
 * @module utils/imageUtils
 */

/**
 * 이미지 압축 옵션
 */
interface CompressOptions {
    maxWidth?: number;      // 최대 너비 (기본: 1200px)
    maxHeight?: number;     // 최대 높이 (기본: 1200px)
    quality?: number;       // 품질 0-1 (기본: 0.8)
    maxSizeKB?: number;     // 최대 파일 크기 KB (기본: 500KB)
}

/**
 * File을 압축된 Data URL로 변환
 * @param file 업로드된 파일
 * @param options 압축 옵션
 * @returns 압축된 Data URL
 */
export const compressImage = async (
    file: File,
    options: CompressOptions = {}
): Promise<string> => {
    const {
        maxWidth = 1200,
        maxHeight = 1200,
        quality = 0.8,
        maxSizeKB = 500
    } = options;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const img = new Image();

            img.onload = () => {
                // 리사이징 계산
                let { width, height } = img;

                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                // Canvas에 그리기
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }

                // 고품질 리사이징
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);

                // JPEG로 압축 (PNG는 압축 어려움)
                let currentQuality = quality;
                let dataUrl = canvas.toDataURL('image/jpeg', currentQuality);

                // 목표 크기까지 품질 조절
                while (getDataUrlSizeKB(dataUrl) > maxSizeKB && currentQuality > 0.3) {
                    currentQuality -= 0.1;
                    dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
                }

                console.log(`[ImageUtils] Compressed: ${(file.size / 1024).toFixed(1)}KB → ${getDataUrlSizeKB(dataUrl).toFixed(1)}KB (${((1 - getDataUrlSizeKB(dataUrl) * 1024 / file.size) * 100).toFixed(0)}% 절감)`);

                resolve(dataUrl);
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = event.target?.result as string;
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
};

/**
 * Data URL의 크기를 KB로 계산
 */
const getDataUrlSizeKB = (dataUrl: string): number => {
    // Base64 부분 추출
    const base64 = dataUrl.split(',')[1] || '';
    // Base64는 원본의 약 4/3 크기
    return (base64.length * 3) / 4 / 1024;
};

/**
 * Data URL을 압축 (이미 로드된 이미지용)
 */
export const compressDataUrl = async (
    dataUrl: string,
    options: CompressOptions = {}
): Promise<string> => {
    const {
        maxWidth = 1200,
        maxHeight = 1200,
        quality = 0.8,
        maxSizeKB = 500
    } = options;

    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            let { width, height } = img;

            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas context not available'));
                return;
            }

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            let currentQuality = quality;
            let compressedUrl = canvas.toDataURL('image/jpeg', currentQuality);

            while (getDataUrlSizeKB(compressedUrl) > maxSizeKB && currentQuality > 0.3) {
                currentQuality -= 0.1;
                compressedUrl = canvas.toDataURL('image/jpeg', currentQuality);
            }

            resolve(compressedUrl);
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = dataUrl;
    });
};

/**
 * 파일이 이미지인지 확인
 */
export const isImageFile = (file: File): boolean => {
    return file.type.startsWith('image/');
};

/**
 * 파일 크기가 제한을 초과하는지 확인
 */
export const isFileTooLarge = (file: File, maxMB: number = 10): boolean => {
    return file.size > maxMB * 1024 * 1024;
};
