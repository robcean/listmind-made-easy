import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Category, Item, ChatMessage } from "@/types";
import { hasToken, clearToken } from "@/services/api";

interface AppState {
  // Auth
  isAuthenticated: boolean;
  checkAuth: () => void;
  login: () => void;
  logout: () => void;

  // Categories
  categories: Category[];
  setCategories: (cats: Category[]) => void;
  addCategory: (cat: Category) => void;
  removeCategory: (id: string) => void;
  updateCategoryItemCount: (categoryId: string, delta: number) => void;
  reorderCategories: (fromIndex: number, toIndex: number) => void;

  // Archived categories
  archivedCategories: Category[];
  setArchivedCategories: (cats: Category[]) => void;

  // Items
  items: Item[];
  setItems: (items: Item[]) => void;
  addItem: (item: Item) => void;
  updateItem: (id: string, patch: Partial<Item>) => void;
  removeItem: (id: string) => void;
  completeItem: (id: string) => void;

  // Active tab
  activeTab: string;
  setActiveTab: (id: string) => void;

  // Chat
  messages: ChatMessage[];
  setMessages: (msgs: ChatMessage[]) => void;
  addMessage: (msg: ChatMessage) => void;

  // UI state
  isLoading: boolean;
  setLoading: (v: boolean) => void;
  error: string | null;
  setError: (e: string | null) => void;

  // Language
  language: "en" | "es";
  setLanguage: (lang: "en" | "es") => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth — driven by JWT in localStorage
      isAuthenticated: hasToken(),
      checkAuth: () => set({ isAuthenticated: hasToken() }),
      login: () => set({ isAuthenticated: true }),
      logout: () => {
        clearToken();
        set({ isAuthenticated: false, categories: [], items: [], messages: [] });
      },

      // Categories
      categories: [],
      setCategories: (categories) => set({ categories }),
      addCategory: (cat) =>
        set((s) => ({ categories: [...s.categories, cat] })),
      removeCategory: (id) =>
        set((s) => {
          const remaining = s.categories.filter((c) => c.id !== id);
          const newTab = s.activeTab === id
            ? (remaining[0]?.id ?? "")
            : s.activeTab;
          return {
            categories: remaining,
            activeTab: newTab,
            // Clear items if deleted category was the active tab
            ...(s.activeTab === id ? { items: [] } : {}),
          };
        }),
      updateCategoryItemCount: (categoryId, delta) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === categoryId ? { ...c, itemCount: Math.max(0, c.itemCount + delta) } : c
          ),
        })),

      reorderCategories: (fromIndex, toIndex) =>
        set((s) => {
          const cats = [...s.categories];
          const [moved] = cats.splice(fromIndex, 1);
          cats.splice(toIndex, 0, moved);
          return { categories: cats.map((c, i) => ({ ...c, position: i })) };
        }),

      archivedCategories: [],
      setArchivedCategories: (archivedCategories) => set({ archivedCategories }),

      // Items
      items: [],
      setItems: (items) => set({ items }),
      addItem: (item) =>
        set((s) => ({
          items: [...s.items, item],
        })),
      updateItem: (id, patch) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id ? { ...i, ...patch, updatedAt: new Date().toISOString() } : i
          ),
        })),
      removeItem: (id) =>
        set((s) => ({
          items: s.items.filter((i) => i.id !== id),
        })),
      completeItem: (id) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id
              ? { ...i, isCompleted: !i.isCompleted, updatedAt: new Date().toISOString() }
              : i
          ),
        })),

      // Active tab
      activeTab: "",
      setActiveTab: (activeTab) => set({ activeTab }),

      // Chat
      messages: [],
      setMessages: (messages) => set({ messages }),
      addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),

      // UI
      isLoading: false,
      setLoading: (isLoading) => set({ isLoading }),
      error: null,
      setError: (error) => set({ error }),

      // Language
      language: "en",
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "listmind-store",
      partialize: (state) => ({
        language: state.language,
      }),
    }
  )
);
