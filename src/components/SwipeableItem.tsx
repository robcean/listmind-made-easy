import { useState, useCallback } from "react";
import { useSwipe } from "@/hooks/useSwipe";
import { useLongPress } from "@/hooks/useLongPress";
import { Check, Trash2, Undo2 } from "lucide-react";
import { t } from "@/i18n";
import type { Item } from "@/types";

interface SwipeableItemProps {
  item: Item;
  isCompleted?: boolean;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (item: Item) => void;
}

const SwipeableItem = ({
  item,
  isCompleted = false,
  onComplete,
  onDelete,
  onEdit,
}: SwipeableItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const [exiting, setExiting] = useState<"complete" | "delete" | null>(null);

  const { state: swipe, ref: swipeRef } = useSwipe({
    threshold: 80,
    onSwipeRight: () => {
      setExiting("complete");
      setTimeout(() => onComplete(item.id), 300);
    },
    onSwipeLeft: () => {
      setExiting("delete");
      setTimeout(() => onDelete(item.id), 300);
    },
  });

  const longPress = useLongPress({
    onLongPress: useCallback(() => onEdit(item), [item, onEdit]),
  });

  const handleTap = useCallback(() => {
    // Don't expand if we just finished a long press
    if (longPress.triggered.current) return;
    if (swipe.isSwiping) return;
    setExpanded((v) => !v);
  }, [longPress.triggered, swipe.isSwiping]);

  // Calculate visual offset from swipe
  const offset = swipe.isSwiping
    ? swipe.direction === "right"
      ? Math.min(swipe.distance, 120)
      : -Math.min(swipe.distance, 120)
    : 0;

  const progress = Math.min(swipe.distance / 80, 1);

  if (exiting) {
    return (
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{
          maxHeight: 0,
          opacity: 0,
          marginBottom: 0,
          transform: exiting === "delete" ? "translateX(-100%)" : "translateX(100%)",
        }}
      />
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Swipe right background — complete */}
      {swipe.direction === "right" && (
        <div
          className="absolute inset-0 flex items-center pl-4 rounded-lg"
          style={{
            backgroundColor: isCompleted
              ? `rgba(59, 130, 246, ${0.2 + progress * 0.4})`
              : `rgba(34, 197, 94, ${0.2 + progress * 0.4})`,
          }}
        >
          {isCompleted ? (
            <Undo2
              className="transition-transform"
              style={{
                color: `rgba(59, 130, 246, ${0.5 + progress * 0.5})`,
                transform: `scale(${0.8 + progress * 0.4})`,
              }}
              size={24}
            />
          ) : (
            <Check
              className="transition-transform"
              style={{
                color: `rgba(34, 197, 94, ${0.5 + progress * 0.5})`,
                transform: `scale(${0.8 + progress * 0.4})`,
              }}
              size={24}
            />
          )}
        </div>
      )}

      {/* Swipe left background — delete */}
      {swipe.direction === "left" && (
        <div
          className="absolute inset-0 flex items-center justify-end pr-4 rounded-lg"
          style={{
            backgroundColor: `rgba(239, 68, 68, ${0.2 + progress * 0.4})`,
          }}
        >
          <Trash2
            className="transition-transform"
            style={{
              color: `rgba(239, 68, 68, ${0.5 + progress * 0.5})`,
              transform: `scale(${0.8 + progress * 0.4})`,
            }}
            size={24}
          />
        </div>
      )}

      {/* Item card */}
      <div
        ref={(node) => {
          swipeRef.current = node;
        }}
        {...longPress.handlers}
        onClick={handleTap}
        className={`relative p-3 rounded-lg bg-card border border-border cursor-pointer select-none transition-shadow ${
          isCompleted ? "opacity-50" : ""
        } ${longPress.isLongPressing ? "ring-2 ring-primary/50" : ""}`}
        style={{
          transform: `translateX(${offset}px)`,
          transition: swipe.isSwiping ? "none" : "transform 0.3s ease-out",
          touchAction: "pan-y",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium truncate ${
                isCompleted
                  ? "text-muted-foreground line-through"
                  : "text-foreground"
              }`}
            >
              {item.text}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {item.recurrence !== "none" && (
                <span className="text-xs text-muted-foreground">
                  🔁 {item.recurrence}
                </span>
              )}
              {item.dueAt && (
                <span className="text-xs text-muted-foreground">
                  📅 {new Date(item.dueAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              )}
              {item.time && (
                <span className="text-xs text-muted-foreground">⏰ {item.time}</span>
              )}
              {item.metadata.notes && (
                <span className="text-xs text-muted-foreground">
                  📝 {t("item.notes")}
                </span>
              )}
              {Object.entries(item.metadata).filter(([key]) => key !== "notes").map(([key, value]) => (
                value != null && String(value).length > 0 && (
                  <span key={key} className="text-xs text-muted-foreground capitalize">
                    {String(value)}
                  </span>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-border space-y-1.5 animate-fade-in">
            {item.metadata.notes && (
              <div className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                {String(item.metadata.notes)}
              </div>
            )}
            {Object.entries(item.metadata).filter(([key]) => key !== "notes").map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-muted-foreground capitalize">{key}</span>
                <span className="text-foreground">{String(value)}</span>
              </div>
            ))}
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{t("item.created")}</span>
              <span className="text-foreground">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{t("item.updated")}</span>
              <span className="text-foreground">
                {new Date(item.updatedAt).toLocaleDateString()}
              </span>
            </div>
            {item.dueAt && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Due</span>
                <span className="text-foreground">
                  {new Date(item.dueAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SwipeableItem;
