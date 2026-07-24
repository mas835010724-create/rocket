import { useState, useCallback, useRef, useEffect } from "react";

export function useDraggableScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [wasDragged, setWasDragged] = useState(false);

  const startX = useRef(0);
  const startY = useRef(0);
  const scrollLeft = useRef(0);
  const internalWasDragged = useRef(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    setIsDragging(true);
    setWasDragged(false);
    internalWasDragged.current = false;
    startX.current = e.pageX - ref.current.offsetLeft;
    startY.current = e.pageY;
    scrollLeft.current = ref.current.scrollLeft;
  }, []);

  const onDragStart = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !ref.current) return;

      const x = e.pageX - ref.current.offsetLeft;

      const distance = Math.abs(x - startX.current);
      const distanceY = Math.abs(e.pageY - startY.current);

      if (distance > 10 || distanceY > 10) {
        internalWasDragged.current = true;
        setWasDragged(true);
      }

      if (internalWasDragged.current) {
        e.preventDefault();
        const walk = (x - startX.current) * 2;
        ref.current.scrollLeft = scrollLeft.current - walk;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);

      setTimeout(() => {
        setWasDragged(false);
        internalWasDragged.current = false;
      }, 100);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return {
    ref,
    events: {
      onMouseDown,
      onDragStart,
    },
    isDragging,
    wasDragged,
  };
}
