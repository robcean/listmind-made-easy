import { useRef, useState, useCallback } from "react";

interface DragState {
  draggingId: string | null;
  dragOverIndex: number | null;
  floatingStyle: React.CSSProperties | null;
}

interface UseCategoryDragOptions {
  categories: { id: string }[];
  rowRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onCollapseOpen: () => void;
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
}

export function useCategoryDrag({
  categories,
  rowRefs,
  onReorder,
  onCollapseOpen,
  scrollContainerRef,
}: UseCategoryDragOptions) {
  const [dragState, setDragState] = useState<DragState>({
    draggingId: null,
    dragOverIndex: null,
    floatingStyle: null,
  });

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStartY = useRef(0);
  const dragCurrentY = useRef(0);
  const draggedIndex = useRef(-1);
  const rowHeight = useRef(0);
  const initialOffsetY = useRef(0);

  const clearLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const getDropIndex = useCallback(
    (touchY: number) => {
      let closest = draggedIndex.current;
      let closestDist = Infinity;

      categories.forEach((cat, i) => {
        const el = rowRefs.current[cat.id];
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const dist = Math.abs(touchY - center);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });

      return closest;
    },
    [categories, rowRefs]
  );

  const handleGripTouchStart = useCallback(
    (catId: string, e: React.TouchEvent) => {
      const touch = e.touches[0];
      const el = rowRefs.current[catId];
      if (!el) return;

      const rect = el.getBoundingClientRect();
      dragStartY.current = touch.clientY;
      initialOffsetY.current = touch.clientY - rect.top;
      rowHeight.current = rect.height;

      longPressTimer.current = setTimeout(() => {
        // Activate drag
        const idx = categories.findIndex((c) => c.id === catId);
        if (idx === -1) return;

        draggedIndex.current = idx;
        onCollapseOpen();

        // Haptic feedback if available
        if (navigator.vibrate) navigator.vibrate(30);

        setDragState({
          draggingId: catId,
          dragOverIndex: idx,
          floatingStyle: {
            position: "fixed",
            top: rect.top,
            left: rect.left,
            width: rect.width,
            zIndex: 9999,
            pointerEvents: "none",
            transition: "none",
          },
        });
      }, 500);
    },
    [categories, rowRefs, onCollapseOpen]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!dragState.draggingId) {
        // If we moved before long press fired, cancel
        const touch = e.touches[0];
        if (Math.abs(touch.clientY - dragStartY.current) > 10) {
          clearLongPress();
        }
        return;
      }

      e.preventDefault();
      const touch = e.touches[0];
      dragCurrentY.current = touch.clientY;

      const dropIdx = getDropIndex(touch.clientY);

      setDragState((prev) => ({
        ...prev,
        dragOverIndex: dropIdx,
        floatingStyle: prev.floatingStyle
          ? {
              ...prev.floatingStyle,
              top: touch.clientY - initialOffsetY.current,
            }
          : null,
      }));
    },
    [dragState.draggingId, clearLongPress, getDropIndex]
  );

  const handleTouchEnd = useCallback(() => {
    clearLongPress();

    if (dragState.draggingId && dragState.dragOverIndex !== null) {
      const fromIdx = draggedIndex.current;
      const toIdx = dragState.dragOverIndex;
      if (fromIdx !== toIdx) {
        onReorder(fromIdx, toIdx);
      }
    }

    setDragState({
      draggingId: null,
      dragOverIndex: null,
      floatingStyle: null,
    });
  }, [dragState, clearLongPress, onReorder]);

  const handleTouchCancel = useCallback(() => {
    clearLongPress();
    setDragState({
      draggingId: null,
      dragOverIndex: null,
      floatingStyle: null,
    });
  }, [clearLongPress]);

  return {
    dragState,
    handleGripTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
  };
}
