import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { t } from "@/i18n";
import type { Item } from "@/types";

interface EditItemSheetProps {
  item: Item | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, patch: Partial<Item>) => void;
}

const EditItemSheet = ({ item, open, onOpenChange, onSave }: EditItemSheetProps) => {
  const [text, setText] = useState("");
  const [recurrence, setRecurrence] = useState("");
  const [time, setTime] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [metadata, setMetadata] = useState<Record<string, string>>({});

  // Sync form state when sheet opens with an item
  useEffect(() => {
    if (open && item) {
      setText(item.text);
      setRecurrence(item.recurrence);
      setTime(item.time ?? "");
      setDueAt(item.dueAt ? item.dueAt.slice(0, 10) : ""); // YYYY-MM-DD
      // Convert all metadata values to strings for editing
      const meta: Record<string, string> = {};
      for (const [key, value] of Object.entries(item.metadata)) {
        if (value != null) meta[key] = String(value);
      }
      setMetadata(meta);
    }
  }, [open, item]);

  const updateMetaValue = (key: string, value: string) => {
    setMetadata((prev) => ({ ...prev, [key]: value }));
  };

  const deleteMetaKey = (key: string) => {
    setMetadata((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSave = () => {
    if (!item) return;
    // Convert metadata string values back to numbers where possible
    // Send null for keys that were deleted so the backend removes them
    const parsedMeta: Record<string, any> = {};
    for (const [key, value] of Object.entries(metadata)) {
      const trimmed = value.trim();
      if (trimmed === "") continue;
      const num = Number(trimmed);
      parsedMeta[key] = !isNaN(num) && trimmed !== "" ? num : trimmed;
    }
    // Mark deleted keys as null for backend merge
    for (const key of Object.keys(item.metadata)) {
      if (!(key in parsedMeta)) {
        parsedMeta[key] = null;
      }
    }
    onSave(item.id, {
      text: text.trim() || item.text,
      recurrence: recurrence || "none",
      time: time || null,
      dueAt: dueAt ? new Date(dueAt + "T00:00:00").toISOString() : null,
      metadata: parsedMeta,
    });
    onOpenChange(false);
  };

  const metaEntries = Object.entries(metadata);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("item.edit")}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>{t("item.text")}</Label>
            <Input value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          {(recurrence && recurrence !== "none") && (
            <div className="space-y-2">
              <Label>{t("item.recurrence")}</Label>
              <Input
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value)}
                placeholder="none, daily, weekly, every 2 weeks..."
              />
            </div>
          )}
          {time && (
            <div className="space-y-2">
              <Label>{t("item.time")}</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          )}
          {dueAt && (
            <div className="space-y-2">
              <Label>Due date</Label>
              <Input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
            </div>
          )}

          {/* Dynamic metadata fields */}
          {metaEntries.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-border">
              <Label className="text-muted-foreground text-xs uppercase tracking-wide">Details</Label>
              {metaEntries.map(([key, value]) => (
                <div key={key} className={key === "notes" ? "space-y-1" : "flex items-center gap-2"}>
                  <Label className={key === "notes" ? "text-xs capitalize" : "w-24 text-xs capitalize shrink-0"}>{key}</Label>
                  {key === "notes" ? (
                    <div className="flex gap-2">
                      <textarea
                        value={value}
                        onChange={(e) => updateMetaValue(key, e.target.value)}
                        onInput={(e) => {
                          const el = e.currentTarget;
                          el.style.height = "auto";
                          el.style.height = el.scrollHeight + "px";
                        }}
                        ref={(el) => {
                          if (el) {
                            el.style.height = "auto";
                            el.style.height = el.scrollHeight + "px";
                          }
                        }}
                        className="flex-1 text-sm rounded-md border border-input bg-background px-3 py-2 min-h-[6rem] resize-none overflow-hidden whitespace-pre-wrap break-words"
                      />
                      <button
                        type="button"
                        onClick={() => deleteMetaKey(key)}
                        className="text-destructive text-xs px-1.5 py-0.5 shrink-0 self-start mt-2"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <Input
                        value={value}
                        onChange={(e) => updateMetaValue(key, e.target.value)}
                        className="flex-1 h-8 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => deleteMetaKey(key)}
                        className="text-destructive text-xs px-1.5 py-0.5 shrink-0"
                      >
                        ✕
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              {t("item.cancel")}
            </Button>
            <Button className="flex-1" onClick={handleSave}>
              {t("item.save")}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EditItemSheet;
