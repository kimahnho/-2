
/**
 * Utility to process rich text HTML and force global styles.
 * If a global style (e.g., color) is applied, we should strip conflicting inline styles
 * from the HTML content so the container's style takes precedence / filters down.
 */

// Helper to strip specific inline styles from HTML string
export const resetStylesInHtml = (html: string, stylesToReset: Array<'color' | 'font-family' | 'font-size' | 'font-weight' | 'text-align'>): string => {
    if (!html) return '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const walk = (node: Node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;

            // Remove specific styles
            if (stylesToReset.includes('color')) {
                el.style.removeProperty('color');
                // Check for font element color attr
                if (el.tagName === 'FONT') {
                    el.removeAttribute('color');
                }
            }
            if (stylesToReset.includes('font-family')) {
                el.style.removeProperty('font-family');
                if (el.tagName === 'FONT') {
                    el.removeAttribute('face');
                }
            }
            if (stylesToReset.includes('font-size')) {
                el.style.removeProperty('font-size');
                if (el.tagName === 'FONT') {
                    el.removeAttribute('size');
                }
            }
            if (stylesToReset.includes('font-weight')) {
                el.style.removeProperty('font-weight');
                // Remove strong/b tags if we want to reset bold (optional, user might just want to set weight)
                // But usually "Bold" button toggles it. 
                // If user sets "Regular" weight, we should probably unwrap <b> tags?
                // Let's just handle style for now.
            }
        }

        node.childNodes.forEach(walk);
    };

    walk(doc.body);
    return doc.body.innerHTML;
};

export const isHtmlEmpty = (html: string): boolean => {
    if (!html) return true;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const textContent = doc.body.textContent || '';
    // Check if text content is only whitespace
    if (textContent.trim().length === 0) {
        // Double check for images or breaks that might be meaningful
        // If it contains NO images, it's effectively empty for a text box
        const hasImages = doc.body.querySelector('img');
        if (!hasImages) return true;
    }
    return false;
};
