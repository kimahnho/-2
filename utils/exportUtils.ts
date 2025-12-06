
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
    
    // Temporarily ensure high resolution capture
    const canvas = await html2canvas(target || pageContainer, { 
      scale: 2, 
      useCORS: true, 
      backgroundColor: null,
      logging: false
    });

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
