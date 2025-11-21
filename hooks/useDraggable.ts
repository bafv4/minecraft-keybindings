import { useState, useCallback, useRef, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

const DEFAULT_POSITION: Position = { x: 0, y: 0 };

export function useDraggable() {
  const [position, setPosition] = useState<Position>(DEFAULT_POSITION);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<Position>({ x: 0, y: 0 });
  const positionRef = useRef<Position>(DEFAULT_POSITION);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - positionRef.current.x,
      y: e.clientY - positionRef.current.y,
    };
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = {
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      };
      positionRef.current = newPosition;
      setPosition(newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const reset = useCallback(() => {
    setPosition(DEFAULT_POSITION);
    positionRef.current = DEFAULT_POSITION;
  }, []);

  return {
    position,
    isDragging,
    handleMouseDown,
    reset,
    style: {
      transform: `translate(${position.x}px, ${position.y}px)`,
      cursor: isDragging ? 'grabbing' : undefined,
    },
    headerStyle: {
      cursor: isDragging ? 'grabbing' : 'grab',
    },
  };
}
