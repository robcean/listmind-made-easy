import type { Category, Item, ChatMessage } from "@/types";

export const mockCategories: Category[] = [
  { id: "cat_01", name: "Medications", slug: "medications", position: 0, icon: "💊", color: "#FF6B6B", itemCount: 3, createdAt: "2026-02-20T10:00:00Z" },
  { id: "cat_02", name: "Reminders", slug: "reminders", position: 1, icon: "🔔", color: "#FFE66D", itemCount: 10, createdAt: "2026-02-20T10:00:00Z" },
  { id: "cat_03", name: "Groceries", slug: "groceries", position: 2, icon: "🛒", color: "#4ECDC4", itemCount: 11, createdAt: "2026-02-20T10:00:00Z" },
  { id: "cat_04", name: "Italian Restaurants", slug: "italian-restaurants", position: 3, icon: "🍝", color: "#FF8A65", itemCount: 5, createdAt: "2026-02-20T10:00:00Z" },
  { id: "cat_05", name: "Breakfast Ideas", slug: "breakfast-ideas", position: 4, icon: "🥞", color: "#AB47BC", itemCount: 5, createdAt: "2026-02-20T10:00:00Z" },
  { id: "cat_06", name: "Amazon", slug: "amazon", position: 5, icon: "📦", color: "#FF9800", itemCount: 1, createdAt: "2026-02-20T10:00:00Z" },
  { id: "cat_07", name: "Postres Fáciles", slug: "postres-faciles", position: 6, icon: "🍰", color: "#E91E63", itemCount: 3, createdAt: "2026-02-20T10:00:00Z" },
  { id: "cat_08", name: "Notas", slug: "notas", position: 7, icon: "📝", color: "#607D8B", itemCount: 2, createdAt: "2026-02-20T10:00:00Z" },
];

export const mockItems: Item[] = [
  // Medications
  { id: "item_01", categoryId: "cat_01", text: "Adderall XR", isCompleted: false, position: 0, recurrence: "daily", time: "10:00", dueAt: null, metadata: { dose: "20mg" }, createdAt: "2026-02-20T10:00:00Z", updatedAt: "2026-02-20T10:00:00Z" },
  { id: "item_02", categoryId: "cat_01", text: "Atorvastatin", isCompleted: false, position: 1, recurrence: "daily", time: "22:00", dueAt: null, metadata: { dose: "40mg" }, createdAt: "2026-02-20T10:00:00Z", updatedAt: "2026-02-20T10:00:00Z" },
  { id: "item_03", categoryId: "cat_01", text: "Vitamin D", isCompleted: true, position: 2, recurrence: "daily", time: "10:00", dueAt: null, metadata: { dose: "2000 IU" }, createdAt: "2026-02-20T10:00:00Z", updatedAt: "2026-02-21T09:00:00Z" },
  // Groceries
  { id: "item_04", categoryId: "cat_03", text: "Whole milk", isCompleted: false, position: 0, recurrence: "weekly", time: null, dueAt: null, metadata: { quantity: 1, unit: "gallon" }, createdAt: "2026-02-20T12:00:00Z", updatedAt: "2026-02-20T12:00:00Z" },
  { id: "item_05", categoryId: "cat_03", text: "Eggs", isCompleted: false, position: 1, recurrence: "weekly", time: null, dueAt: null, metadata: { quantity: 1, unit: "dozen" }, createdAt: "2026-02-20T12:01:00Z", updatedAt: "2026-02-20T12:01:00Z" },
  { id: "item_06", categoryId: "cat_03", text: "Bananas", isCompleted: true, position: 2, recurrence: "none", time: null, dueAt: null, metadata: { quantity: 6 }, createdAt: "2026-02-20T12:02:00Z", updatedAt: "2026-02-21T09:00:00Z" },
];

export const mockChatHistory: ChatMessage[] = [
  {
    id: "msg_01",
    role: "assistant",
    text: "Hey! I'm your ListMind assistant. Tell me what you need — add items, create lists, set reminders. I've got you. 🧠",
    actions: [],
    timestamp: "2026-02-20T10:00:00Z",
  },
  {
    id: "msg_02",
    role: "user",
    text: "Add milk and eggs to Winn-Dixie",
    actions: [],
    timestamp: "2026-02-20T10:01:00Z",
  },
  {
    id: "msg_03",
    role: "assistant",
    text: "Done! Added milk and eggs to Winn-Dixie. 🛒",
    actions: [
      { type: "item_created", summary: "Added Whole milk to Winn-Dixie" },
      { type: "item_created", summary: "Added Eggs to Winn-Dixie" },
    ],
    timestamp: "2026-02-20T10:01:01Z",
  },
  {
    id: "msg_04",
    role: "user",
    text: "Remind me to take Adderall at 10am every day",
    actions: [],
    timestamp: "2026-02-20T10:02:00Z",
  },
  {
    id: "msg_05",
    role: "assistant",
    text: "Got it! Added Adderall XR to Medications — daily at 10:00 AM. 💊",
    actions: [
      { type: "item_created", summary: "Added Adderall XR to Medications" },
      { type: "reminder_set", summary: "Daily reminder at 10:00 AM" },
    ],
    timestamp: "2026-02-20T10:02:01Z",
  },
];
