

## ListMind — Full UI Prototype Implementation Plan

### Phase 1: Foundation & Architecture
- **Types & Interfaces**: Create `src/types/index.ts` with the exact interfaces provided (Category, Item, ChatMessage, Action)
- **Mock Data**: Create `src/mocks/data.ts` with the provided categories (Winn-Dixie, Medications, Work Tasks) plus full item sets for each, mock chat history, and simulated AI response mappings
- **i18n System**: Create `src/i18n/` with a `t('key')` helper and translation objects `{ en: "...", es: "..." }`. All UI strings go through this from day one. Default language: English
- **Zustand Store**: Single store in `src/store/useStore.ts` managing categories, items, chat messages, active tab, UI state (loading, errors). All mutations here
- **API Service Layer**: `src/services/api.ts` — functions like `fetchCategories()`, `fetchItems()`, `sendMessage()` that return mock data today, swap to real fetch tomorrow
- **Dark Theme**: Extend CSS variables in `index.css` for the dark-first design system with custom accent colors. No hardcoded colors anywhere
- **PWA Meta Tags**: Update `index.html` with viewport, theme-color, apple-mobile-web-app meta tags, and manifest placeholder

### Phase 2: App Shell & Auth Screens
- **Auth Pages**: Mock login and signup screens (clean, minimal, dark theme). Email + password fields, submit buttons — no real auth, just UI
- **Protected Route Wrapper**: `ProtectedRoute` component that checks a `isAuthenticated` flag in the store. Redirects to `/login` if false
- **App Layout**: Bottom navigation bar with two tabs — **Lists** (grid icon) and **Chat** (message icon). Fixed bottom bar, safe-area padding for iPhone notch
- **Routing**: `/login`, `/signup`, `/` (lists view), `/chat` (chat view). All custom routes above the catch-all

### Phase 3: Lists View — Dynamic Tabs & Items
- **Dynamic Tab Bar**: Horizontally scrollable tabs at the top, generated from categories in the store. Each tab shows the category icon + name + badge with `itemCount`
- **Tab Appearance**: Tabs use the category's `color` for active state indicator. Smooth horizontal scroll with no visible scrollbar
- **Item Cards**: Clean list items showing: text, recurrence indicator (🔁 daily, etc.), time if set, metadata preview (e.g., "20mg" for medications)
- **Completed Items Section**: Items with `isCompleted: true` sink to bottom, separated by a subtle divider. Strikethrough text, reduced opacity, sorted by most recently completed
- **Empty States**: When a category has zero items, show a friendly illustration/message ("This list is empty. Use the chat to add items!")
- **Error States**: Simulated error state component for when API calls "fail"
- **Loading Skeletons**: Skeleton placeholders for tabs and list items to simulate API latency on initial load (show for ~800ms before revealing data)

### Phase 4: Gesture Interactions
- **`useSwipe()` hook**: Custom hook in `src/hooks/useSwipe.ts`. Tracks touch start/move/end, calculates direction and distance, exposes swipe state. Returns `{ swipeDirection, swipeDistance, handlers }`
- **`useLongPress()` hook**: Custom hook in `src/hooks/useLongPress.ts`. Detects press-and-hold (threshold ~500ms), cancels on move. Returns `{ isLongPressing, handlers }`
- **Swipe Right → Complete**: Item slides right revealing green background + checkmark icon. On release past threshold, item animates to completed state, sinks to bottom with strikethrough
- **Swipe Left → Delete**: Item slides left revealing red background + trash icon. On release past threshold, item animates out (shrink + fade), removed from list, `itemCount` decrements
- **Long Press → Edit**: Opens a modal/sheet with pre-filled fields (text, recurrence, time, metadata). Save updates the store
- **Tap → Expand**: Tapping an item expands it inline to show full details (all metadata fields, created/updated timestamps, recurrence details)
- **Visual Feedback**: Smooth spring-like animations on all gestures. Background color intensity increases with swipe distance

### Phase 5: Chat View
- **Chat Interface**: Message bubbles — user messages right-aligned (accent color), assistant messages left-aligned (subtle dark card). Scrollable message area with auto-scroll to bottom
- **Input Bar**: Controlled text input component at the bottom with send button and microphone icon (visual only). `onSend(message: string)` callback, no processing logic coupled
- **Async Simulation Flow**: User sends message → message appears instantly → "thinking" bubble with animated dots appears → 500-800ms random delay → AI response appears → actions from response are applied to the store
- **Mock Response Engine**: Pattern matching in the API service layer:
  - "add X to Y" → creates items, updates itemCount, responds with confirmation
  - "add X to [new category]" → creates category + items, new tab appears in Lists view
  - Unrelated messages → polite decline ("I can only help manage your lists and reminders")
- **Action Indicators**: Below AI messages that triggered actions, show small chips/tags summarizing what changed (e.g., "✅ Created 2 items in Winn-Dixie")
- **Pre-loaded Conversation**: Start with a welcome message from the assistant and 2-3 example exchanges already visible

### Phase 6: Polish & Finishing Touches
- **Animations**: Smooth transitions on tab creation, item reordering, completion/deletion. CSS transitions + requestAnimationFrame for gesture animations
- **Tab Creation Animation**: When chat creates a new category, the new tab slides in with a subtle highlight animation
- **Item Count Badges**: Real-time badge updates on tabs when items are added/completed/deleted from chat or gestures
- **Language Toggle**: Simple toggle in a settings area (or long-press on app title) to switch between English and Spanish. All UI strings update instantly via the i18n system
- **Responsive Polish**: Ensure everything looks perfect on iPhone SE through iPhone 15 Pro Max widths. Test safe areas, bottom bar spacing, keyboard avoidance on chat input

