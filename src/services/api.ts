// API service layer — real fetch calls to the backend

import type { Category, Item, ChatMessage } from "@/types";

const API_BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("listmind_token");
}

export function setToken(token: string) {
  localStorage.setItem("listmind_token", token);
}

export function clearToken() {
  localStorage.removeItem("listmind_token");
}

export function hasToken(): boolean {
  return !!localStorage.getItem("listmind_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> ?? {}),
  };
  // Only set Content-Type when there's a body
  if (options.body) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? "Request failed", body);
  }

  return res.json();
}

export class ApiError extends Error {
  status: number;
  body: any;
  constructor(status: number, message: string, body: any) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

// Auth

export async function login(email: string, password: string): Promise<{ token: string; user: { id: string; email: string } }> {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signup(email: string, password: string): Promise<{ token: string; user: { id: string; email: string } }> {
  return request("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// Categories

export async function fetchCategories(): Promise<Category[]> {
  const data = await request<{ categories: Category[] }>("/categories");
  return data.categories;
}

export async function fetchArchivedCategories(): Promise<Category[]> {
  const data = await request<{ categories: Category[] }>("/categories/archived");
  return data.categories;
}

export async function restoreCategory(id: string): Promise<Category> {
  const data = await request<{ category: Category }>(`/categories/${id}/restore`, {
    method: "PATCH",
  });
  return data.category;
}

// Items

export async function fetchItems(categoryId: string): Promise<Item[]> {
  const data = await request<{ items: Item[]; total: number; hasMore: boolean }>(
    `/categories/${categoryId}/items`
  );
  return data.items;
}

export async function createItem(data: {
  categoryId: string;
  text: string;
  recurrence?: string;
  time?: string | null;
  dueAt?: string | null;
  metadata?: Record<string, any>;
}): Promise<Item> {
  const res = await request<{ item: Item }>("/items", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.item;
}

export async function updateItem(
  id: string,
  patch: Partial<Item>
): Promise<Item> {
  const res = await request<{ item: Item }>(`/items/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return res.item;
}

export async function deleteItem(id: string): Promise<void> {
  await request(`/items/${id}`, { method: "DELETE" });
}

// Chat

export async function sendMessage(text: string, imageUrl?: string): Promise<{ userMessage: ChatMessage; message: ChatMessage }> {
  const body: Record<string, string> = { text };
  if (imageUrl) body.imageUrl = imageUrl;
  return request<{ userMessage: ChatMessage; message: ChatMessage }>("/chat/message", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchChatHistory(): Promise<ChatMessage[]> {
  const data = await request<{ messages: ChatMessage[] }>("/chat/history");
  return data.messages;
}

export async function clearChatHistory(): Promise<void> {
  await request("/chat/history", { method: "DELETE" });
}

export async function uploadFile(file: File): Promise<{ url: string }> {
  const token = getToken();
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE}/chat/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? "Upload failed", body);
  }

  return res.json();
}

/** @deprecated Use uploadFile instead */
export const uploadImage = uploadFile;
