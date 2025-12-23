/**
 * useImageUpload - 이미지 업로드 로직
 * MECE: 파일 선택, 검증, 업로드, 요소 생성만 담당
 */

import { useRef } from 'react';
import { compressImage, isImageFile, isFileTooLarge } from '../utils/imageUtils';
import { uploadToCloudinary, isCloudinaryConfigured } from '../services/cloudinaryService';

interface UseImageUploadProps {
    elements: any[];
    selectedIds: string[];
    activePageId: string;
    updateElement: (id: string, updates: any, commit: boolean) => void;
    updateElements: (elements: any[], commit?: boolean) => void;
    setSelectedIds: (ids: string[]) => void;
    onSaveAsset: (url: string) => void;
}

interface UseImageUploadReturn {
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleUploadImage: () => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export const useImageUpload = ({
    elements,
    selectedIds,
    activePageId,
    updateElement,
    updateElements,
    setSelectedIds,
    onSaveAsset
}: UseImageUploadProps): UseImageUploadReturn => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadImage = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 파일 검증
        if (!isImageFile(file)) {
            alert('이미지 파일만 업로드 가능합니다.');
            return;
        }
        if (isFileTooLarge(file, 10)) {
            alert('파일 크기는 10MB 이하로 제한됩니다.');
            return;
        }

        try {
            let imageUrl: string;

            // Cloudinary 사용 가능 시 CDN 업로드, 아니면 Base64
            if (isCloudinaryConfigured()) {
                const result = await uploadToCloudinary(file, {
                    folder: 'muru-assets/user-uploads',
                    tags: ['user-upload']
                });
                imageUrl = result.secureUrl;
                console.log(`[Upload] Cloudinary URL: ${imageUrl}`);
            } else {
                // Fallback: 로컬 압축
                imageUrl = await compressImage(file, {
                    maxWidth: 1200,
                    maxHeight: 1200,
                    quality: 0.8,
                    maxSizeKB: 500
                });
            }

            const img = new Image();
            img.onload = () => {
                const maxSize = 400;
                const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
                const width = img.width * ratio;
                const height = img.height * ratio;

                // If single shape is selected, fill it with image
                if (selectedIds.length === 1) {
                    const el = elements.find(e => e.id === selectedIds[0]);
                    if (el && (el.type === 'shape' || el.type === 'circle')) {
                        updateElement(el.id, { backgroundImage: imageUrl }, true);
                        onSaveAsset(imageUrl);
                        return;
                    }
                }

                // Otherwise add as new image element
                const x = (800 - width) / 2;
                const y = (1132 - height) / 2;
                const newEl = {
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'image' as const,
                    x, y, width, height,
                    content: imageUrl,
                    rotation: 0,
                    zIndex: elements.length + 1,
                    pageId: activePageId,
                    borderRadius: 0,
                };
                updateElements([...elements, newEl]);
                setSelectedIds([newEl.id]);
                onSaveAsset(imageUrl);
            };
            img.src = imageUrl;
        } catch (error) {
            console.error('Image upload failed:', error);
            alert('이미지 업로드에 실패했습니다.');
        }
        e.target.value = ''; // Reset for same file selection
    };

    return {
        fileInputRef,
        handleUploadImage,
        handleFileChange
    };
};
