import { useEffect, useState, useCallback, useRef } from "react";
import { useStore } from "@/store/useStore";
import {
  fetchCategories,
  fetchItems,
  fetchArchivedCategories,
  restoreCategory as apiRestoreCategory,
  updateItem as apiUpdateItem,
  deleteItem as apiDeleteItem,
} from "@/services/api";
import { mockCategories, mockItems } from "@/mocks/data";
import { t } from "@/i18n";
import { Archive, RotateCcw, ChevronDown } from "lucide-react";
import SwipeableItem from "@/components/SwipeableItem";
import EditItemSheet from "@/components/EditItemSheet";
import CategoryGrid from "@/components/CategoryGrid";
import CategoryAccordion from "@/components/CategoryAccordion";
import { cn } from "@/lib/utils";
import type { Item } from "@/types";


const ListsView = () => {
  const categories = useStore((s) => s.categories);
  const items = useStore((s) => s.items);
  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const setCategories = useStore((s) => s.setCategories);
  const setItems = useStore((s) => s.setItems);
  const isLoading = useStore((s) => s.isLoading);
  const setLoading = useStore((s) => s.setLoading);
  const completeItem = useStore((s) => s.completeItem);
  const removeItem = useStore((s) => s.removeItem);
  const storeUpdateItem = useStore((s) => s.updateItem);
  const updateCategoryItemCount = useStore((s) => s.updateCategoryItemCount);
  const archivedCategories = useStore((s) => s.archivedCategories);
  const setArchivedCategories = useStore((s) => s.setArchivedCategories);

  const [editItem, setEditItem] = useState<Item | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  // Load categories on mount
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [cats, archived] = await Promise.all([
          fetchCategories(),
          fetchArchivedCategories(),
        ]);
        setCategories(cats);
        setArchivedCategories(archived);
        if (cats.length > 0 && !activeTab) {
          setActiveTab(cats[0].id);
        }
      } catch (err) {
        console.warn("API unreachable, using mock data:", err);
        setCategories(mockCategories);
        setArchivedCategories([]);
        if (mockCategories.length > 0 && !activeTab) {
          setActiveTab(mockCategories[0].id);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load items when active tab changes
  useEffect(() => {
    if (!activeTab) return;
    const loadItems = async () => {
      try {
        const its = await fetchItems(activeTab);
        setItems(its);
      } catch (err) {
        console.warn("API unreachable, using mock items:", err);
        const fallback = mockItems.filter((i) => i.categoryId === activeTab);
        setItems(fallback);
      }
    };
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const categoryItems = items.filter((i) => i.categoryId === activeTab);
  const activeItems = categoryItems
    .filter((i) => !i.isCompleted)
    .sort((a, b) => a.position - b.position);
  const completedItems = categoryItems
    .filter((i) => i.isCompleted)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const handleComplete = useCallback(
    async (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;
      const newCompleted = !item.isCompleted;
      // Optimistic update
      completeItem(id);
      updateCategoryItemCount(item.categoryId, newCompleted ? -1 : 1);
      try {
        await apiUpdateItem(id, { isCompleted: newCompleted });
      } catch {
        // Rollback
        completeItem(id);
        updateCategoryItemCount(item.categoryId, newCompleted ? 1 : -1);
      }
    },
    [items, completeItem, updateCategoryItemCount]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;
      // Optimistic update
      removeItem(id);
      if (!item.isCompleted) {
        updateCategoryItemCount(item.categoryId, -1);
      }
      try {
        await apiDeleteItem(id);
      } catch {
        // Reload items on failure
        if (activeTab) {
          const its = await fetchItems(activeTab);
          setItems(its);
        }
      }
    },
    [items, removeItem, updateCategoryItemCount, activeTab, setItems]
  );

  const handleEdit = useCallback((item: Item) => {
    setEditItem(item);
    setEditOpen(true);
  }, []);

  const handleSave = useCallback(
    async (id: string, patch: Partial<Item>) => {
      storeUpdateItem(id, patch);
      try {
        await apiUpdateItem(id, patch);
      } catch {
        // Reload on failure
        if (activeTab) {
          const its = await fetchItems(activeTab);
          setItems(its);
        }
      }
    },
    [storeUpdateItem, activeTab, setItems]
  );

  const handleRestore = useCallback(
    async (id: string) => {
      setRestoringId(id);
      try {
        const restored = await apiRestoreCategory(id);
        // Move from archived to active
        setArchivedCategories(archivedCategories.filter((c) => c.id !== id));
        setCategories([...categories, restored]);
      } catch (err) {
        console.error("Failed to restore category:", err);
      } finally {
        setRestoringId(null);
      }
    },
    [archivedCategories, categories, setArchivedCategories, setCategories]
  );

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex gap-2 px-4 pt-4 pb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 w-28 rounded-full bg-muted animate-pulse" />
          ))}
        </div>
        <div className="flex-1 px-4 space-y-3 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full page-transition">
      {/* Accordion for mobile */}
      <div ref={mobileScrollRef} className="sm:hidden flex-1 overflow-y-auto">
        <CategoryAccordion
          categories={categories}
          onComplete={handleComplete}
          onDelete={handleDelete}
          onEdit={handleEdit}
          scrollContainerRef={mobileScrollRef}
        />
      </div>

      {/* Grid for tablet */}
      <div className="hidden sm:block lg:hidden">
        <CategoryGrid
          categories={categories}
          activeTab={activeTab}
          onSelect={setActiveTab}
        />
      </div>

      {/* Horizontal tabs for desktop */}
      <div className="hidden lg:flex gap-2 px-4 pt-4 pb-2 overflow-x-auto scrollbar-hide">
        {categories.map((cat) => {
          const isActive = cat.id === activeTab;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0"
              style={{
                backgroundColor: isActive ? `${cat.color}20` : "hsl(var(--muted))",
                color: isActive ? cat.color ?? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                borderWidth: 1,
                borderColor: isActive ? `${cat.color}40` : "transparent",
              }}
            >
              {cat.icon && <span>{cat.icon}</span>}
              <span>{cat.name}</span>
              <span
                className="ml-1 text-xs rounded-full px-1.5 py-0.5"
                style={{
                  backgroundColor: isActive ? `${cat.color}30` : "hsl(var(--border))",
                }}
              >
                {cat.itemCount}
              </span>
            </button>
          );
        })}

        {/* Archived toggle — desktop */}
        {archivedCategories.length > 0 && (
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0",
              showArchived
                ? "bg-muted-foreground/20 text-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Archive className="h-3.5 w-3.5" />
            <span>{t("lists.archived")}</span>
            <span className="text-xs">{archivedCategories.length}</span>
            <ChevronDown className={cn("h-3 w-3 transition-transform", showArchived && "rotate-180")} />
          </button>
        )}
      </div>

      {/* Archived categories panel */}
      {showArchived && archivedCategories.length > 0 && (
        <div className="px-4 pb-2 space-y-1.5">
          {archivedCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {cat.icon && <span>{cat.icon}</span>}
                <span>{cat.name}</span>
                <span className="text-xs opacity-60">{cat.itemCount} {t("lists.items")}</span>
              </div>
              <button
                onClick={() => handleRestore(cat.id)}
                disabled={restoringId === cat.id}
                className="flex items-center gap-1 text-xs text-primary px-2 py-1 rounded-md hover:bg-primary/10 transition-colors disabled:opacity-50"
              >
                <RotateCcw className={cn("h-3.5 w-3.5", restoringId === cat.id && "animate-spin")} />
                <span>{t("lists.restore")}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Items */}
      <div className="hidden sm:block flex-1 overflow-y-auto px-4 pt-2 pb-4 space-y-2">
        {activeItems.length === 0 && completedItems.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-2">
            <span className="text-4xl">📝</span>
            <p className="text-sm">{t("lists.empty")}</p>
          </div>
        )}

        {activeItems.map((item) => (
          <SwipeableItem
            key={item.id}
            item={item}
            onComplete={handleComplete}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))}

        {completedItems.length > 0 && (
          <>
            <div className="flex items-center gap-2 pt-3 pb-1">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">{t("lists.completed")}</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            {completedItems.map((item) => (
              <SwipeableItem
                key={item.id}
                item={item}
                isCompleted
                onComplete={handleComplete}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </>
        )}
      </div>

      <EditItemSheet
        item={editItem}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={handleSave}
      />
    </div>
  );
};

export default ListsView;
