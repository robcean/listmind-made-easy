import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface Props {
  categories: Category[];
  activeTab: string;
  onSelect: (id: string) => void;
}

const CategoryGrid = ({ categories, activeTab, onSelect }: Props) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 px-4 pt-4 pb-2">
      {categories.map((cat) => {
        const isActive = cat.id === activeTab;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-4 min-h-[80px] text-left transition-all active:scale-[0.97]",
              "border bg-card hover:bg-accent/50",
              isActive
                ? "border-primary/40 ring-1 ring-primary/20"
                : "border-border"
            )}
            style={
              isActive
                ? { backgroundColor: `${cat.color}15`, borderColor: `${cat.color}40` }
                : undefined
            }
          >
            <span className="text-2xl shrink-0">{cat.icon}</span>
            <div className="flex flex-col min-w-0">
              <span
                className={cn(
                  "text-sm font-medium truncate",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
                style={isActive ? { color: cat.color ?? undefined } : undefined}
              >
                {cat.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {cat.itemCount} items
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryGrid;
