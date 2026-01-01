import * as React from 'react';
import { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Group } from 'react-konva';
import Konva from 'konva';
import { DesignElement } from '../../types';

const FIGMA_BLUE = '#0099FF';

interface ImageCropEditorProps {
    element: DesignElement;
    imageUrl: string;
    onUpdate: (update: Partial<DesignElement>) => void;
    onClose?: () => void;
}

/**
 * Image Crop Editor - Figma-like experience with Konva
 * 
 * Features:
 * - Shows full image (ghost) so user can see composition
 * - Frame acts as a "window" into the image
 * - Free positioning and independent X/Y scaling
 * - Transform handles on corners and edges
 */
export const ImageCropEditor: React.FC<ImageCropEditorProps> = ({
    element,
    imageUrl,
    onUpdate,
    onClose
}) => {
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [isReady, setIsReady] = useState(false);
    const imageRef = useRef<Konva.Image>(null);
    const ghostRef = useRef<Konva.Image>(null);
    const trRef = useRef<Konva.Transformer>(null);
    const stageRef = useRef<Konva.Stage>(null);

    const frameW = element.width;
    const frameH = element.height;

    // Expand stage to show ghost image (3x frame size for generous overflow)
    const stageW = frameW * 3;
    const stageH = frameH * 3;
    const offsetX = frameW; // Center the frame in the expanded stage
    const offsetY = frameH;

    // Load image
    useEffect(() => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            setImage(img);
            setIsReady(true);
        };
        img.onerror = () => {
            // Try without crossOrigin for local images
            const img2 = new window.Image();
            img2.onload = () => {
                setImage(img2);
                setIsReady(true);
            };
            img2.src = imageUrl;
        };
        img.src = imageUrl;
    }, [imageUrl]);

    // Attach transformer when image loads
    useEffect(() => {
        if (isReady && imageRef.current && trRef.current) {
            trRef.current.nodes([imageRef.current]);
            trRef.current.getLayer()?.batchDraw();
        }
    }, [isReady, image]);

    // Use independent X/Y scales if available, otherwise fall back to single scale
    const hasIndependentScale = element.backgroundScaleX !== undefined || element.backgroundScaleY !== undefined;
    const pos = element.backgroundPosition ?? { x: 0.5, y: 0.5 };

    // Get image dimensions
    const naturalW = image?.naturalWidth || 100;
    const naturalH = image?.naturalHeight || 100;
    const aspect = naturalW / naturalH;

    // Image dimensions - depends on whether we have independent scales
    let imgW: number;
    let imgH: number;

    if (hasIndependentScale) {
        // New: independent X/Y scaling (values are decimal, e.g., 1.5 = 150%)
        const scaleX = element.backgroundScaleX ?? 1;
        const scaleY = element.backgroundScaleY ?? 1;
        imgW = frameW * scaleX;
        imgH = frameH * scaleY;
    } else {
        // Legacy: single scale, maintains aspect ratio
        const scale = (element.backgroundScale ?? 100) / 100;
        imgW = frameW * scale;
        imgH = imgW / aspect;
    }

    // Position calculation (0.5 = centered)
    // Offset by the stage expansion
    const imgX = offsetX + (-(imgW - frameW) * pos.x);
    const imgY = offsetY + (-(imgH - frameH) * pos.y);

    // Handle drag - FREE movement without bounds
    const handleDragMove = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
        // Ghost follows main image in real-time
        const node = e.target;
        if (ghostRef.current) {
            ghostRef.current.x(node.x());
            ghostRef.current.y(node.y());
        }
    }, []);

    const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
        const node = e.target;
        const newX = node.x() - offsetX;
        const newY = node.y() - offsetY;

        // Calculate new position - NO CLAMPING for free movement
        const scrollableX = imgW - frameW;
        const scrollableY = imgH - frameH;

        let newPosX = 0.5;
        let newPosY = 0.5;

        if (scrollableX !== 0) {
            newPosX = -newX / scrollableX;
        }
        if (scrollableY !== 0) {
            newPosY = -newY / scrollableY;
        }

        onUpdate({ backgroundPosition: { x: newPosX, y: newPosY } });
    }, [imgW, imgH, frameW, frameH, offsetX, offsetY, onUpdate]);

    // Handle transform in real-time (sync ghost during resize)
    const handleTransformRealtime = useCallback(() => {
        const node = imageRef.current;
        if (!node || !ghostRef.current) return;

        const nodeScaleX = node.scaleX();
        const nodeScaleY = node.scaleY();

        // Update ghost to match current transform
        ghostRef.current.x(node.x());
        ghostRef.current.y(node.y());
        ghostRef.current.width(node.width() * nodeScaleX);
        ghostRef.current.height(node.height() * nodeScaleY);
        ghostRef.current.scaleX(1);
        ghostRef.current.scaleY(1);
    }, []);

    // Handle transform end (resize) - Independent X/Y scaling
    const handleTransformEnd = useCallback(() => {
        const node = imageRef.current;
        if (!node) return;

        // Get new scales from transformer
        const nodeScaleX = node.scaleX();
        const nodeScaleY = node.scaleY();
        const newImgW = node.width() * nodeScaleX;
        const newImgH = node.height() * nodeScaleY;

        // Calculate new independent scales
        const newScaleX = newImgW / frameW;
        const newScaleY = newImgH / frameH;

        // Final ghost sync
        if (ghostRef.current) {
            ghostRef.current.width(newImgW);
            ghostRef.current.height(newImgH);
            ghostRef.current.x(node.x());
            ghostRef.current.y(node.y());
        }

        // Reset node scale (we store scale in our own property)
        node.scaleX(1);
        node.scaleY(1);

        // Calculate new position
        const newX = node.x() - offsetX;
        const newY = node.y() - offsetY;
        const scrollableX = newImgW - frameW;
        const scrollableY = newImgH - frameH;

        let newPosX = 0.5;
        let newPosY = 0.5;

        if (scrollableX !== 0) {
            newPosX = -newX / scrollableX;
        }
        if (scrollableY !== 0) {
            newPosY = -newY / scrollableY;
        }

        onUpdate({
            backgroundScaleX: Math.max(0.3, Math.min(5, newScaleX)),
            backgroundScaleY: Math.max(0.3, Math.min(5, newScaleY)),
            backgroundPosition: { x: newPosX, y: newPosY }
        });
    }, [frameW, frameH, offsetX, offsetY, onUpdate]);

    // Prevent event propagation to parent
    const handleContainerMouseDown = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
    }, []);

    const handleContainerClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
    }, []);

    if (!image || !isReady) {
        return (
            <div
                className="w-full h-full flex items-center justify-center bg-gray-100"
                onMouseDown={handleContainerMouseDown}
                onClick={handleContainerClick}
            >
                <span className="text-gray-400">Loading...</span>
            </div>
        );
    }

    return (
        <div
            className="relative"
            style={{
                width: frameW,
                height: frameH,
                overflow: 'visible',
            }}
            onMouseDown={handleContainerMouseDown}
            onClick={handleContainerClick}
        >
            {/* Expanded Stage to show ghost image */}
            <div
                style={{
                    position: 'absolute',
                    left: -offsetX,
                    top: -offsetY,
                    width: stageW,
                    height: stageH,
                    pointerEvents: 'auto',
                }}
            >
                <Stage
                    ref={stageRef}
                    width={stageW}
                    height={stageH}
                    onClick={(e) => {
                        // Close if clicked on stage background (not on image)
                        if (e.target === e.target.getStage()) {
                            onClose?.();
                        }
                    }}
                    onTap={(e) => {
                        if (e.target === e.target.getStage()) {
                            onClose?.();
                        }
                    }}
                >
                    <Layer>
                        {/* Ghost image (semi-transparent, shows full image) */}
                        <KonvaImage
                            ref={ghostRef}
                            image={image}
                            x={imgX}
                            y={imgY}
                            width={imgW}
                            height={imgH}
                            opacity={0.3}
                            listening={false}
                        />

                        {/* Frame overlay to show bounds (dark outside) */}
                        {/* Top */}
                        <Rect
                            x={0}
                            y={0}
                            width={stageW}
                            height={offsetY}
                            fill="rgba(0,0,0,0.5)"
                            onClick={() => onClose?.()}
                            onTap={() => onClose?.()}
                        />
                        {/* Bottom */}
                        <Rect
                            x={0}
                            y={offsetY + frameH}
                            width={stageW}
                            height={offsetY}
                            fill="rgba(0,0,0,0.5)"
                            onClick={() => onClose?.()}
                            onTap={() => onClose?.()}
                        />
                        {/* Left */}
                        <Rect
                            x={0}
                            y={offsetY}
                            width={offsetX}
                            height={frameH}
                            fill="rgba(0,0,0,0.5)"
                            onClick={() => onClose?.()}
                            onTap={() => onClose?.()}
                        />
                        {/* Right */}
                        <Rect
                            x={offsetX + frameW}
                            y={offsetY}
                            width={offsetX}
                            height={frameH}
                            fill="rgba(0,0,0,0.5)"
                            onClick={() => onClose?.()}
                            onTap={() => onClose?.()}
                        />

                        {/* Frame border */}
                        <Rect
                            x={offsetX}
                            y={offsetY}
                            width={frameW}
                            height={frameH}
                            stroke={FIGMA_BLUE}
                            strokeWidth={3}
                            listening={false}
                        />

                        {/* Main draggable image (full opacity, only visible inside frame) */}
                        <Group
                            clipX={offsetX}
                            clipY={offsetY}
                            clipWidth={frameW}
                            clipHeight={frameH}
                        >
                            <KonvaImage
                                ref={imageRef}
                                image={image}
                                x={imgX}
                                y={imgY}
                                width={imgW}
                                height={imgH}
                                draggable={true}
                                onDragMove={handleDragMove}
                                onDragEnd={handleDragEnd}
                                onTransform={handleTransformRealtime}
                                onTransformEnd={handleTransformEnd}
                            />
                        </Group>

                        {/* Transformer (resize handles) - outside clip group */}
                        <Transformer
                            ref={trRef}
                            enabledAnchors={[
                                'top-left', 'top-center', 'top-right',
                                'middle-left', 'middle-right',
                                'bottom-left', 'bottom-center', 'bottom-right'
                            ]}
                            boundBoxFunc={(oldBox, newBox) => {
                                // Minimum size constraint
                                if (newBox.width < frameW * 0.3 || newBox.height < frameH * 0.3) {
                                    return oldBox;
                                }
                                return newBox;
                            }}
                            keepRatio={false}
                            rotateEnabled={false}
                            borderStroke={FIGMA_BLUE}
                            borderStrokeWidth={2}
                            anchorFill="white"
                            anchorStroke={FIGMA_BLUE}
                            anchorStrokeWidth={2}
                            anchorSize={14}
                            anchorCornerRadius={2}
                        />
                    </Layer>
                </Stage>
            </div>

            {/* Help Text */}
            <div
                style={{
                    position: 'absolute',
                    top: -40,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontSize: 12,
                    whiteSpace: 'nowrap',
                    zIndex: 100,
                    pointerEvents: 'none',
                }}
            >
                이미지 드래그 / 핸들로 크기 조절
            </div>
        </div>
    );
};
