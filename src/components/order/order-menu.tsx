import { AnimatePresence, motion } from "motion/react";
import { Plus, RotateCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import { BurgerCard } from "@/components/menu/burger-card";
import { Reveal } from "@/components/ui/motion-primitives";
import { BURGERS, DRINKS, MENU_BY_ID, SIDES, type Category, type MenuItem } from "@/data/menu";
import { brl, cn, EASE } from "@/lib/utils";

const FILTERS: { id: "all" | Category; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "smash", label: "Smash" },
  { id: "artesanal", label: "Artesanais" },
  { id: "combo", label: "Combos" },
];

/** Card compacto para acompanhamentos e bebidas. */
function ExtraCard({ item }: { item: MenuItem }) {
  const { add, items } = useCart();
  const qty = items[item.id] || 0;
  return (
    <div className="group flex items-center gap-3 rounded-3xl border border-cream/10 bg-coal p-3 sm:gap-4 sm:pr-4 transition hover:border-cream/25">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl sm:size-20">
        <img src={item.img} alt={item.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <AnimatePresence>
          {qty > 0 && (
            <motion.span
              key={qty}
              className="absolute right-1 top-1 grid h-6 min-w-6 place-items-center rounded-full bg-mustard px-1 text-xs font-bold text-ink"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 18 }}
            >
              {qty}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-2xl font-black uppercase leading-none">{item.name}</p>
        <p className="mt-1 line-clamp-2 text-sm text-cream/50">{item.desc}</p>
        <p className="mt-1 font-display text-xl font-bold text-mustard">{brl(item.price)}</p>
      </div>
      <button
        onClick={(e) => add(item.id, e.currentTarget)}
        aria-label={`Adicionar ${item.name}`}
        className="grid size-11 shrink-0 place-items-center rounded-full bg-sauce transition hover:rotate-90 hover:bg-cream hover:text-ink"
      >
        <Plus size={18} />
      </button>
    </div>
  );
}

/** Cardápio da página de pedido. `focus` = id vindo da home (?item= / ?add=), rola até ele e pisca. */
export function OrderMenu({ focus }: { focus: string | null }) {
  const [filter, setFilter] = useState<"all" | Category>("all");
  const items = filter === "all" ? BURGERS : BURGERS.filter((i) => i.cat === filter);

  useEffect(() => {
    if (!focus) return;
    setFilter("all");
    const target = MENU_BY_ID[focus];
    const id = target && (target.cat === "side" || target.cat === "drink") ? "extras" : `item-${focus}`;
    // espera a cortina da troca de página abrir
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" }), 900);
    return () => clearTimeout(t);
  }, [focus]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Filtrar cardápio"
          className="-mx-5 flex max-w-[100vw] gap-1 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:max-w-none sm:overflow-visible sm:px-0"
        >
          <div className="flex shrink-0 gap-1 rounded-full border border-cream/10 bg-coal p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn("relative rounded-full px-5 py-2.5 text-sm font-semibold transition-colors", filter === f.id ? "text-ink" : "text-cream/60 hover:text-cream")}
            >
              {filter === f.id && (
                <motion.span layoutId="order-filter" className="absolute inset-0 rounded-full bg-mustard" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
              )}
              <span className="relative">{f.label}</span>
            </button>
          ))}
          </div>
        </div>
        <p className="hidden items-center gap-2 text-sm text-cream/50 sm:flex">
          <RotateCw size={14} /> Toque no burger para ver o que vai dentro
        </p>
      </div>

      <motion.div layout className="grid gap-6 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              id={`item-${item.id}`}
              layout
              className="relative scroll-mt-32"
              initial={{ opacity: 0, y: 60, rotateX: -12 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
              transition={{ duration: 0.8, delay: (i % 2) * 0.1, ease: EASE }}
              style={{ transformPerspective: 1000 }}
            >
              <BurgerCard item={item} />
              {focus === item.id && (
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute -inset-2 rounded-[1.9rem] border-2 border-mustard"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.2, 1, 0.2, 1, 0] }}
                  transition={{ duration: 2.6, delay: 1.3, ease: "easeInOut" }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <div id="extras" className="mt-20 scroll-mt-32">
        <Reveal>
          <h3 className="font-display text-5xl font-black uppercase leading-none">
            Pra <span className="text-outline">acompanhar</span>
          </h3>
        </Reveal>
        <p className="mb-6 mt-8 text-[11px] font-semibold uppercase tracking-[0.22em] text-mustard">Acompanhamentos</p>
        <div className="grid gap-4 md:grid-cols-2">
          {SIDES.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.06} y={24}>
              <ExtraCard item={item} />
            </Reveal>
          ))}
        </div>
        <p className="mb-6 mt-10 text-[11px] font-semibold uppercase tracking-[0.22em] text-mustard">Bebidas</p>
        <div className="grid gap-4 md:grid-cols-2">
          {DRINKS.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.06} y={24}>
              <ExtraCard item={item} />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
