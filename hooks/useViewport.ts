import React, { useState, useRef, useCallback } from 'react';
import { CANVAS_HEIGHT } from '../utils/canvasUtils';

export const useViewport = () => {
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Zoom Controls
  // Helper to zoom while keeping center
  const performZoom = useCallback((delta: number) => {
    setZoom(prevZoom => {
      const newZoom = Math.min(Math.max(prevZoom + delta, 0.1), 3);

      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const { scrollLeft, scrollTop, clientWidth, clientHeight } = container;

        // Calculate center point relative to content
        const centerX = scrollLeft + clientWidth / 2;
        const centerY = scrollTop + clientHeight / 2;

        // Calculate point in unscaled coordinates
        const contentX = centerX / prevZoom;
        const contentY = centerY / prevZoom;

        // Calculate new center in scaled coordinates
        const newCenterX = contentX * newZoom;
        const newCenterY = contentY * newZoom;

        // Adjust scroll to keep center fixed
        // We need to do this AFTER render, but React state updates are async.
        // However, we can calculate the target scroll and set it.
        // But since the content size changes with zoom, we might need a layout effect or requestAnimationFrame.
        // A simple approach is to assume immediate update or use a ref to track pending scroll.

        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = newCenterX - clientWidth / 2;
            scrollContainerRef.current.scrollTop = newCenterY - clientHeight / 2;
          }
        });
      }

      return newZoom;
    });
  }, []);

  // Zoom Controls
  const zoomIn = () => performZoom(0.1);
  const zoomOut = () => performZoom(-0.1);
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