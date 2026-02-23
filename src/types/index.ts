// ListMind — Core data types
// These match the API contract exactly

export interface Category {
  id: string;
  name: string;
  slug: string;
  position: number;
  icon: string | null;
  color: string | null;
  itemCount: number;
  isArchived?: boolean;
  createdAt: string;
}

export interface Item {
  id: string;
  categoryId: string;
  text: string;
  isCompleted: boolean;
  position: number;
  recurrence: string;
  time: string | null; // HH:mm 24h format
  dueAt: string | null; // ISO 8601
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  imageUrl?: string;
  actions: Action[];
  timestamp: string;
}

export interface Action {
  type:
    | "item_created"
    | "item_updated"
    | "item_completed"
    | "item_deleted"
    | "item_moved"
    | "category_created"
    | "category_deleted"
    | "category_renamed"
    | "category_archived"
    | "category_restored"
    | "reminder_set";
  item?: Item;
  category?: Category;
  summary: string;
}
