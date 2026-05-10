import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// Cart Store
// ============================================
export const useCart = create(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => {
        const id = `${item.productId}-${item.size}-${item.color}`;
        const existing = get().items.find((i) => i.id === id);
        if (existing) {
          set({ items: get().items.map((i) => (i.id === id ? { ...i, qty: Math.min(10, i.qty + item.qty) } : i)) });
        } else {
          set({ items: [...get().items, { ...item, id }] });
        }
      },
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      setQty: (id, qty) => set({ items: get().items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(10, qty)) } : i)) }),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((s, i) => s + i.qty, 0),
      subtotal: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
    }),
    { name: 'veldra-cart' },
  ),
);

// ============================================
// Wishlist Store
// ============================================
export const useWishlist = create(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set({ ids: get().ids.includes(id) ? get().ids.filter((x) => x !== id) : [...get().ids, id] }),
      has: (id) => get().ids.includes(id),
      remove: (id) => set({ ids: get().ids.filter((x) => x !== id) }),
    }),
    { name: 'veldra-wishlist' },
  ),
);

// ============================================
// Theme Store
// ============================================
export const useTheme = create(
  persist(
    (set, get) => ({
      theme: 'light',
      toggle: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: next });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', next === 'dark');
        }
      },
      init: () => {
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', get().theme === 'dark');
        }
      },
    }),
    { name: 'veldra-theme' },
  ),
);

// ============================================
// Toast Store
// ============================================
export const useToasts = create((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = Date.now() + Math.random();
    set({ toasts: [...get().toasts, { ...t, id }] });
    setTimeout(() => set({ toasts: get().toasts.filter((x) => x.id !== id) }), 3000);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));
