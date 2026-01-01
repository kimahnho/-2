
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { DesignElement, Page as EditorPage } from '../../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../utils/canvasUtils';

// Register Fonts
// Using the same URLs as fontLoader.ts
// Note: @react-pdf/renderer loads fonts from URL.
Font.register({
    family: 'GowunDodum',
    src: 'https://cdn.jsdelivr.net/gh/nicennnnnnnlee/nicennnnnnnlee.github.io@master/fonts/GowunDodum-Regular.ttf'
});
Font.register({
    family: 'NotoSansKR',
    src: 'https://cdn.jsdelivr.net/gh/nicennnnnnnlee/nicennnnnnnlee.github.io@master/fonts/NotoSansKR-Regular.ttf'
});
Font.register({
    family: 'NanumGothic',
    src: 'https://cdn.jsdelivr.net/gh/nicennnnnnnlee/nicennnnnnnlee.github.io@master/fonts/NanumGothic-Regular.ttf'
});

// Font Mapping Helper
const getFontFamily = (webFontFamily: string | undefined) => {
    if (!webFontFamily) return 'NotoSansKR';
    const lower = webFontFamily.toLowerCase();

    if (lower.includes('gowun dodum')) return 'GowunDodum';
    if (lower.includes('noto sans')) return 'NotoSansKR';
    if (lower.includes('nanum gothic')) return 'NanumGothic';
    if (lower.includes('nanum myeongjo')) return 'NanumGothic'; // Fallback
    // Add other mappings as needed

    return 'NotoSansKR'; // Default
};

// Styles
const styles = StyleSheet.create({
    page: {
        backgroundColor: '#ffffff',
    },
    element: {
        position: 'absolute',
    },
});

interface PDFDocumentProps {
    pages: EditorPage[];
    elements: DesignElement[];
    selectedPageIndices: number[];
}

// Helper to convert px to pt (if needed, but react-pdf uses pt by default)
// The canvas is 800x1123 px. A4 is 595x842 pt.
// Scale factor: 595.28 / 800 ≈ 0.7441
const PX_TO_PT = 0.7441;

// We can either scale all values OR set the page size to the canvas size (in pt) and let the PDF viewer scale it.
// Setting page size to matches canvas "coordinates" is easier for absolute positioning.
// However, standard A4 is expected. Let's use the scale factor.

const scale = (val: number) => val * PX_TO_PT;

export const PDFDocument: React.FC<PDFDocumentProps> = ({ pages, elements, selectedPageIndices }) => {
    return (
        <Document>
            {selectedPageIndices.map((pageIndex) => {
                const page = pages[pageIndex];
                const pageElements = elements
                    .filter(el => el.pageId === page.id)
                    .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)); // Render order

                const isLandscape = page.orientation === 'landscape';
                const width = isLandscape ? CANVAS_HEIGHT : CANVAS_WIDTH;
                const height = isLandscape ? CANVAS_WIDTH : CANVAS_HEIGHT;

                return (
                    <Page
                        key={page.id}
                        size={[scale(width), scale(height)]}
                        style={styles.page}
                        orientation={isLandscape ? 'landscape' : 'portrait'}
                    >
                        {pageElements.map((el) => {
                            // Base style for positioning
                            const baseStyle: any = {
                                position: 'absolute',
                                left: scale(el.x),
                                top: scale(el.y),
                                width: scale(el.width),
                                height: scale(el.height),
                                transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                                transformOrigin: '50% 50%', // Center rotation
                            };

                            // Type Rendering
                            if (el.type === 'text') {
                                return (
                                    <Text
                                        key={el.id}
                                        style={{
                                            ...baseStyle,
                                            fontFamily: getFontFamily(el.fontFamily),
                                            fontSize: scale(el.fontSize || 16),
                                            color: el.color || '#000000',
                                            textAlign: 'center', // Default to center for this app?
                                            // react-pdf text alignment logic
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            backgroundColor: 'transparent'
                                        }}
                                    >
                                        {el.content}
                                    </Text>
                                );
                            }

                            if (el.type === 'image' && (el.backgroundImage || el.content)) {
                                // Warning: react-pdf Image requires CORS-enabled URLs.
                                // If using base64, usually safe.
                                const src = el.backgroundImage || el.content;
                                return (
                                    <Image
                                        key={el.id}
                                        src={src}
                                        style={{
                                            ...baseStyle,
                                            objectFit: 'contain' // or fill? Usually fill for design tools
                                        }}
                                    />
                                );
                            }

                            if (el.type === 'shape' || el.type === 'circle') {
                                return (
                                    <View
                                        key={el.id}
                                        style={{
                                            ...baseStyle,
                                            backgroundColor: el.backgroundColor || 'transparent',
                                            borderColor: el.borderColor || 'transparent',
                                            borderWidth: scale(el.borderWidth || 0),
                                            borderRadius: el.type === 'circle' ? '50%' : scale(el.borderRadius || 0),
                                            // Text inside shape?
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        {/* Render text inside shape if exists */}
                                        {el.content && (
                                            <Text
                                                style={{
                                                    fontFamily: getFontFamily(el.fontFamily),
                                                    fontSize: scale(el.fontSize || 16),
                                                    color: el.color || '#000000',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                {el.content}
                                            </Text>
                                        )}
                                    </View>
                                );
                            }

                            if (el.type === 'line' || el.type === 'arrow') {
                                const borderWidth = scale(el.borderWidth || 2);
                                return (
                                    <View
                                        key={el.id}
                                        style={{
                                            ...baseStyle,
                                            borderBottomColor: el.borderColor || '#000000',
                                            borderBottomWidth: borderWidth,
                                            borderStyle: el.borderStyle || 'solid',
                                            height: 0, // Force height 0 for line, style uses border
                                            top: scale(el.y + el.height / 2), // Center vertically
                                        }}
                                    />
                                )
                            }

                            if (el.type === 'card') {
                                // AAC Card Rendering
                                // Complex structure: needs background, border, text label, and image symbol
                                const aacData = el.metadata?.aacData as any;
                                const borderRadius = scale(el.borderRadius || 12);
                                const borderWidth = scale(el.borderWidth || 2);
                                const labelPosition = aacData?.labelPosition || 'above';
                                const isFilled = aacData?.isFilled;

                                return (
                                    <View
                                        key={el.id}
                                        style={{
                                            ...baseStyle,
                                            backgroundColor: el.backgroundColor || '#ffffff',
                                            borderRadius: borderRadius,
                                            borderColor: el.borderColor || '#E5E7EB',
                                            borderWidth: borderWidth,
                                            // Layout content
                                            display: 'flex',
                                            flexDirection: labelPosition === 'above' ? 'column' : 'column-reverse',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            padding: scale(4)
                                        }}
                                    >
                                        {/* Symbol Image */}
                                        {aacData?.emoji && (
                                            <Image
                                                src={aacData.emoji}
                                                style={{
                                                    width: '60%', // Estimate
                                                    height: '60%',
                                                    objectFit: 'contain'
                                                }}
                                            />
                                        )}

                                        {/* Label Text */}
                                        {aacData?.label && labelPosition !== 'none' && (
                                            <Text
                                                style={{
                                                    fontSize: scale(aacData.fontSize || 20),
                                                    color: aacData.color || '#000000',
                                                    fontFamily: 'NotoSansKR', // Default for now
                                                    marginTop: scale(4),
                                                    marginBottom: scale(4)
                                                }}
                                            >
                                                {aacData.label}
                                            </Text>
                                        )}
                                    </View>
                                );
                            }

                            return null;
                        })}
                    </Page>
                );
            })}
        </Document>
    );
};
