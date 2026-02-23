// i18n — Minimal bilingual system (EN/ES)
// Language state lives in Zustand store; this module reads it reactively

type Lang = "en" | "es";

const translations: Record<string, Record<Lang, string>> = {
  // Auth
  "auth.login": { en: "Log in", es: "Iniciar sesión" },
  "auth.signup": { en: "Sign up", es: "Registrarse" },
  "auth.email": { en: "Email", es: "Correo electrónico" },
  "auth.password": { en: "Password", es: "Contraseña" },
  "auth.welcome": { en: "Welcome back", es: "Bienvenido de vuelta" },
  "auth.create_account": { en: "Create your account", es: "Crea tu cuenta" },
  "auth.no_account": { en: "Don't have an account?", es: "¿No tenés cuenta?" },
  "auth.have_account": { en: "Already have an account?", es: "¿Ya tenés cuenta?" },

  // Navigation
  "nav.lists": { en: "Lists", es: "Listas" },
  "nav.chat": { en: "Chat", es: "Chat" },

  // Lists
  "lists.empty": {
    en: "This list is empty. Use the chat to add items!",
    es: "Esta lista está vacía. ¡Usá el chat para agregar items!",
  },
  "lists.completed": { en: "Completed", es: "Completados" },
  "lists.error": {
    en: "Something went wrong. Try again.",
    es: "Algo salió mal. Intentá de nuevo.",
  },
  "lists.retry": { en: "Retry", es: "Reintentar" },
  "lists.archived": { en: "Archived", es: "Archivadas" },
  "lists.restore": { en: "Restore", es: "Restaurar" },
  "lists.items": { en: "items", es: "items" },

  // Items
  "item.daily": { en: "Daily", es: "Diario" },
  "item.weekly": { en: "Weekly", es: "Semanal" },
  "item.weekdays": { en: "Weekdays", es: "Días hábiles" },
  "item.monthly": { en: "Monthly", es: "Mensual" },
  "item.edit": { en: "Edit item", es: "Editar item" },
  "item.save": { en: "Save", es: "Guardar" },
  "item.cancel": { en: "Cancel", es: "Cancelar" },
  "item.text": { en: "Text", es: "Texto" },
  "item.recurrence": { en: "Recurrence", es: "Recurrencia" },
  "item.time": { en: "Time", es: "Hora" },
  "item.none": { en: "None", es: "Ninguna" },
  "item.notes": { en: "Notes", es: "Notas" },
  "item.created": { en: "Created", es: "Creado" },
  "item.updated": { en: "Updated", es: "Actualizado" },

  // Chat
  "chat.placeholder": {
    en: "Type a message...",
    es: "Escribí un mensaje...",
  },
  "chat.thinking": { en: "Thinking...", es: "Pensando..." },
  "chat.decline": {
    en: "I can only help manage your lists and reminders.",
    es: "Solo puedo ayudarte a manejar tus listas y recordatorios.",
  },

  // App
  "app.name": { en: "meSync", es: "meSync" },
  "app.tagline": {
    en: "Your ADHD-friendly list manager",
    es: "Tu gestor de listas para ADHD",
  },

  // Language
  "lang.switched": { en: "Switched to English", es: "Cambiado a Español" },
};

// Current language getter — will be wired to Zustand
let currentLang: Lang = "en";

export function setLanguage(lang: Lang) {
  currentLang = lang;
}

export function getLanguage(): Lang {
  return currentLang;
}

export function t(key: string): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[currentLang] ?? entry.en ?? key;
}
