
import html2canvas from 'html2canvas';

export const downloadPageAsImage = async (
  pageId: string,
  fileName: string = 'design'
): Promise<void> => {
  const pageContainer = document.getElementById(`page-container-${pageId}`);
  if (!pageContainer) return;

  try {
    // Target the inner container usually used for printing/display to ignore UI overlays if any
    const target = pageContainer.querySelector('.print-container') as HTMLElement;

    // Wait for fonts and images to load
    await document.fonts.ready;

    // Temporarily hide selection UI elements
    const selectionElements = (target || pageContainer).querySelectorAll('[class*="border-[#5500FF]"]');
    selectionElements.forEach(el => (el as HTMLElement).style.visibility = 'hidden');

    // Capture with high resolution and proper settings for emoji/fonts
    const canvas = await html2canvas(target || pageContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      // Enable foreignObjectRendering for better text/emoji capture
      foreignObjectRendering: false, // Sometimes causes issues, keep false
      // Ensure proper font rendering
      onclone: (clonedDoc: Document) => {
        // Force font styles in cloned document
        const style = clonedDoc.createElement('style');
        style.innerHTML = `
          * { font-family: 'Gowun Dodum', 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif !important; }
          .print-container * { visibility: visible !important; }
        `;
        clonedDoc.head.appendChild(style);
      }
    });

    // Restore selection UI visibility
    selectionElements.forEach(el => (el as HTMLElement).style.visibility = '');

    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error("Export failed:", error);
    throw new Error("이미지 저장에 실패했습니다.");
  }
};

export const printCanvas = () => {
  window.print();
};
