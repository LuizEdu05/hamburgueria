import { AnimatePresence, motion } from "motion/react";
import { Plus, RotateCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import { BurgerCard } from "@/components/menu/burger-card";
import { Reveal } from "@/components/ui/motion-primitives";
import { BEERS, BURGERS, DRINKS, groupItems, MENU_BY_ID, SIDES, type Category, type MenuItem } from "@/data/menu";
import { brl, cn, EASE } from "@/lib/utils";

const FILTERS: { id: "all" | Category; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "burger", label: "Hambúrgueres" },
  { id: "dog", label: "Hot dogs" },
];

/** Card compacto para porções e bebidas; itens com tamanhos ganham seletor. */
function ExtraCard({ variants }: { variants: MenuItem[] }) {
  const { add, items } = useCart();
  const [sel, setSel] = useState(0);
  const item = variants[sel];
  const base = variants[0];
  const title = variants.length > 1 ? base.name.slice(0, base.name.length - (base.size?.length ?? 0)).trim() : base.name;
  const qty = variants.reduce((n, v) => n + (items[v.id] || 0), 0);
  return (
    <div className="group flex items-center gap-3 rounded-3xl border border-cream/10 bg-coal p-3 transition hover:border-cream/25 sm:gap-4 sm:pr-4">
      <div className="relative size-16 shrink-0 self-start overflow-hidden rounded-2xl sm:size-20">
        <img src={item.img} alt={title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
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
        <p className="font-display text-2xl font-black uppercase leading-none">{title}</p>
        <p className="mt-1 line-clamp-2 text-sm text-cream/50">{item.desc}</p>
        {variants.length > 1 && (
          <div className="mt-2 flex flex-wrap gap-1" role="radiogroup" aria-label={`Tamanho de ${title}`}>
            {variants.map((v, i) => (
              <button
                key={v.id}
                role="radio"
                aria-checked={i === sel}
                onClick={() => setSel(i)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-semibold transition",
                  i === sel ? "border-mustard bg-mustard text-ink" : "border-cream/15 text-cream/60 hover:border-cream/40 hover:text-cream",
                )}
              >
                {v.size}
              </button>
            ))}
          </div>
        )}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={item.price}
            className="mt-1 font-display text-xl font-bold text-mustard"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            {brl(item.price)}
          </motion.p>
        </AnimatePresence>
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

function ExtraGrid({ items }: { items: MenuItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {groupItems(items).map((variants, i) => (
        <Reveal key={variants[0].group ?? variants[0].id} delay={(i % 4) * 0.06} y={24}>
          <ExtraCard variants={variants} />
        </Reveal>
      ))}
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
    const id = target && target.cat !== "burger" && target.cat !== "dog" ? "extras" : `item-${focus}`;
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
          <RotateCw size={14} /> Toque no card para ver o que vai dentro
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
        <p className="mb-6 mt-8 text-[11px] font-semibold uppercase tracking-[0.22em] text-mustard">Porções</p>
        <ExtraGrid items={SIDES} />
        <p className="mb-6 mt-10 text-[11px] font-semibold uppercase tracking-[0.22em] text-mustard">Refrigerantes e água</p>
        <ExtraGrid items={DRINKS} />
        <p className="mb-6 mt-10 text-[11px] font-semibold uppercase tracking-[0.22em] text-mustard">Cervejas</p>
        <ExtraGrid items={BEERS} />
      </div>
    </div>
  );
}
