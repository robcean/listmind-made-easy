import { useRef, useCallback, useState, useEffect } from "react";

export interface SwipeState {
  direction: "left" | "right" | null;
  distance: number;
  isSwiping: boolean;
}

interface UseSwipeOptions {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export function useSwipe({
  threshold = 80,
  onSwipeLeft,
  onSwipeRight,
}: UseSwipeOptions = {}) {
  const [state, setState] = useState<SwipeState>({
    direction: null,
    distance: 0,
    isSwiping: false,
  });

  const startX = useRef(0);
  const startY = useRef(0);
  const locked = useRef(false);
  const isHorizontal = useRef(false);
  const active = useRef(false);
  const stateRef = useRef(state);
  const elRef = useRef<HTMLElement | null>(null);

  const onSwipeLeftRef = useRef(onSwipeLeft);
  const onSwipeRightRef = useRef(onSwipeRight);
  onSwipeLeftRef.current = onSwipeLeft;
  onSwipeRightRef.current = onSwipeRight;

  const updateState = useCallback((s: SwipeState) => {
    stateRef.current = s;
    setState(s);
  }, []);

  const reset = useCallback(() => {
    updateState({ direction: null, distance: 0, isSwiping: false });
    locked.current = false;
    isHorizontal.current = false;
    active.current = false;
  }, [updateState]);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    // --- Shared logic ---

    const handleStart = (clientX: number, clientY: number) => {
      startX.current = clientX;
      startY.current = clientY;
      locked.current = false;
      isHorizontal.current = false;
      active.current = true;
    };

    const handleMove = (clientX: number, clientY: number, evt?: Event) => {
      if (!active.current) return;

      const dx = clientX - startX.current;
      const dy = clientY - startY.current;

      if (!locked.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        locked.current = true;
        isHorizontal.current = Math.abs(dx) > Math.abs(dy);
      }

      if (!isHorizontal.current) return;

      // Prevent scrolling/navigation while swiping horizontally
      evt?.preventDefault();

      updateState({
        direction: dx > 0 ? "right" : "left",
        distance: Math.abs(dx),
        isSwiping: true,
      });
    };

    const handleEnd = () => {
      if (!active.current) return;
      const s = stateRef.current;
      if (s.isSwiping && s.distance >= threshold) {
        if (s.direction === "right") onSwipeRightRef.current?.();
        if (s.direction === "left") onSwipeLeftRef.current?.();
      }
      reset();
    };

    // --- Touch events ---

    const onTouchStart = (e: TouchEvent) => {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      handleMove(e.touches[0].clientX, e.touches[0].clientY, e);
    };

    const onTouchEnd = () => handleEnd();

    // --- Mouse events (for desktop testing) ---

    const onMouseDown = (e: MouseEvent) => {
      // Only left mouse button
      if (e.button !== 0) return;
      handleStart(e.clientX, e.clientY);
    };

    const onMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY, e);
    };

    const onMouseUp = () => handleEnd();
    const onMouseLeave = () => {
      if (active.current) reset();
    };

    // Attach touch listeners (passive: false so we can preventDefault)
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });

    // Attach mouse listeners
    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseup", onMouseUp);
    el.addEventListener("mouseleave", onMouseLeave);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [threshold, updateState, reset]);

  return {
    state,
    ref: elRef,
  };
}
