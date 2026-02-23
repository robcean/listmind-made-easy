import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchItems } from "@/services/api";
import { mockItems } from "@/mocks/data";
import { t } from "@/i18n";
import SwipeableItem from "@/components/SwipeableItem";
import type { Category, Item } from "@/types";

interface Props {
  categories: Category[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (item: Item) => void;
}

const CategoryAccordion = ({ categories, onComplete, onDelete, onEdit }: Props) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [itemsMap, setItemsMap] = useState<Record<string, Item[]>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const toggle = useCallback((id: string) => {
    setOpenId((prev) => {
      const next = prev === id ? null : id;
      if (next) {
        setTimeout(() => {
          rowRefs.current[next]?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
      }
      return next;
    });
  }, []);

  // Load items when a category is expanded
  useEffect(() => {
    if (!openId || itemsMap[openId]) return;
    const load = async () => {
      setLoadingId(openId);
      try {
        const its = await fetchItems(openId);
        setItemsMap((prev) => ({ ...prev, [openId]: its }));
      } catch {
        const fallback = mockItems.filter((i) => i.categoryId === openId);
        setItemsMap((prev) => ({ ...prev, [openId]: fallback }));
      } finally {
        setLoadingId(null);
      }
    };
    load();
  }, [openId, itemsMap]);

  return (
    <div className="flex flex-col gap-1.5 px-4 pt-4 pb-2">
      {categories.map((cat) => {
        const isOpen = openId === cat.id;
        const items = itemsMap[cat.id] ?? [];
        const activeItems = items.filter((i) => !i.isCompleted).sort((a, b) => a.position - b.position);
        const completedItems = items.filter((i) => i.isCompleted).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        return (
          <div key={cat.id} ref={(el) => { rowRefs.current[cat.id] = el; }} className="rounded-xl overflow-hidden">
            {/* Category row */}
            <button
              onClick={() => toggle(cat.id)}
              className={cn(
                "flex items-center w-full gap-3 px-4 py-3 min-h-[56px] transition-all",
                "bg-card border border-border rounded-xl",
                isOpen && "border-primary/40 ring-1 ring-primary/20"
              )}
              style={
                isOpen
                  ? { backgroundColor: `${cat.color}15`, borderColor: `${cat.color}40` }
                  : undefined
              }
            >
              <span className="text-xl shrink-0">{cat.icon}</span>
              <span
                className={cn(
                  "flex-1 text-left text-sm font-medium truncate",
                  isOpen ? "text-foreground" : "text-muted-foreground"
                )}
                style={isOpen ? { color: cat.color ?? undefined } : undefined}
              >
                {cat.name}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {cat.itemCount}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </button>

            {/* Expanded items */}
            <div
              className={cn(
                "grid transition-all duration-200 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100 mt-1.5" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <div className="space-y-1.5 pb-1">
                  {loadingId === cat.id && (
                    <div className="space-y-2 px-1">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
                      ))}
                    </div>
                  )}

                  {loadingId !== cat.id && activeItems.length === 0 && completedItems.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-3">
                      {t("lists.empty")}
                    </p>
                  )}

                  {activeItems.map((item) => (
                    <SwipeableItem
                      key={item.id}
                      item={item}
                      onComplete={onComplete}
                      onDelete={onDelete}
                      onEdit={onEdit}
                    />
                  ))}

                  {completedItems.length > 0 && (
                    <>
                      <div className="flex items-center gap-2 pt-2 pb-1">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-xs text-muted-foreground">{t("lists.completed")}</span>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      {completedItems.map((item) => (
                        <SwipeableItem
                          key={item.id}
                          item={item}
                          isCompleted
                          onComplete={onComplete}
                          onDelete={onDelete}
                          onEdit={onEdit}
                        />
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryAccordion;
