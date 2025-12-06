import React, { useState, useRef, useCallback } from 'react';
import { CANVAS_HEIGHT } from '../utils/canvasUtils';

export const useViewport = () => {
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Zoom Controls
  const zoomIn = () => setZoom(p => Math.min(p + 0.1, 3));
  const zoomOut = () => setZoom(p => Math.max(p - 0.1, 0.1));
  const zoomReset = () => setZoom(1);
  const zoomFit = () => setZoom(Math.min((window.innerHeight - 250) / CANVAS_HEIGHT, 3));

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom(p => Math.min(Math.max(p + (e.deltaY > 0 ? -0.05 : 0.05), 0.1), 3));
    }
  }, []);

  // Pan Controls
  const startPan = (e: React.MouseEvent) => {
    if (e.button === 1) { // Middle click
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handlePanMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft -= (e.clientX - panStart.x);
      scrollContainerRef.current.scrollTop -= (e.clientY - panStart.y);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, panStart]);

  const endPan = () => setIsPanning(false);

  return {
    zoom,
    setZoom,
    isPanning,
    scrollContainerRef,
    zoomIn,
    zoomOut,
    zoomReset,
    zoomFit,
    handleWheel,
    startPan,
    handlePanMove,
    endPan
  };
};