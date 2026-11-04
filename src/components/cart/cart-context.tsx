import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { MENU_BY_ID } from "@/data/menu";

export interface Flight {
  key: number;
  img: string;
  from: { x: number; y: number };
}

interface CartValue {
  items: Record<string, number>;
  count: number;
  /** Soma dos itens, sem frete nem desconto. */
  total: number;
  /** Adiciona 1 unidade. Com `origin`, dispara a animação do item voando até o carrinho. */
  add: (id: string, origin?: HTMLElement | null) => void;
  change: (id: string, delta: number) => void;
  clear: () => void;
  flights: Flight[];
  land: (key: number) => void;
  /** Incrementa a cada item que "pousa" — usado para animar o ícone do carrinho. */
  bump: number;
}

const CartContext = createContext<CartValue | null>(null);
const STORAGE_KEY = "bb-cart-v2";

function load(): Record<string, number> {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return Object.fromEntries(
      Object.entries(parsed).filter(([id, q]) => MENU_BY_ID[id] && typeof q === "number" && q > 0),
    ) as Record<string, number>;
  } catch {
    return {};
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Record<string, number>>(load);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [bump, setBump] = useState(0);
  const seq = useRef(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add = useCallback((id: string, origin?: HTMLElement | null) => {
    setItems((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    const item = MENU_BY_ID[id];
    if (origin && item) {
      const r = origin.getBoundingClientRect();
      setFlights((f) => [...f, { key: ++seq.current, img: item.img, from: { x: r.left + r.width / 2, y: r.top + r.height / 2 } }]);
    } else {
      setBump((b) => b + 1);
    }
  }, []);

  const change = useCallback((id: string, delta: number) => {
    setItems((prev) => {
      const q = (prev[id] || 0) + delta;
      const next = { ...prev };
      if (q <= 0) delete next[id];
      else next[id] = q;
      return next;
    });
  }, []);

  const clear = useCallback(() => setItems({}), []);

  const land = useCallback((key: number) => {
    setFlights((f) => f.filter((x) => x.key !== key));
    setBump((b) => b + 1);
  }, []);

  const value = useMemo<CartValue>(() => {
    let count = 0;
    let total = 0;
    for (const [id, q] of Object.entries(items)) {
      count += q;
      total += (MENU_BY_ID[id]?.price || 0) * q;
    }
    return { items, count, total, add, change, clear, flights, land, bump };
  }, [items, add, change, clear, flights, land, bump]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa estar dentro de <CartProvider>");
  return ctx;
}
