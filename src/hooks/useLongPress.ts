import { useRef, useCallback, useState } from "react";

interface UseLongPressOptions {
  delay?: number;
  onLongPress: () => void;
}

export function useLongPress({ delay = 500, onLongPress }: UseLongPressOptions) {
  const [isLongPressing, setIsLongPressing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggered = useRef(false);

  const start = useCallback(() => {
    triggered.current = false;
    timer.current = setTimeout(() => {
      triggered.current = true;
      setIsLongPressing(true);
      onLongPress();
    }, delay);
  }, [delay, onLongPress]);

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setIsLongPressing(false);
  }, []);

  return {
    isLongPressing,
    triggered, // ref to check in click handlers
    handlers: {
      onTouchStart: start,
      onTouchEnd: cancel,
      onTouchMove: cancel,
      onMouseDown: start,
      onMouseUp: cancel,
      onMouseLeave: cancel,
    },
  };
}
