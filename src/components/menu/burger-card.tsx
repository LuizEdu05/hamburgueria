import { motion } from "motion/react";
import { ArrowLeft, Plus, RotateCw } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { HoloFlipCard } from "@/components/ui/holo-flip-card";
import { CATEGORY_LABEL, type BadgeTone, type MenuItem } from "@/data/menu";
import { brl, cn, EASE } from "@/lib/utils";

export const BADGE: Record<BadgeTone, string> = {
  sauce: "bg-sauce text-cream",
  mustard: "bg-mustard text-ink",
  cream: "bg-cream text-sauce",
};

/**
 * Barra de compra: idêntica nos dois lados do card, então o botão
 * "Adicionar" fica sempre no mesmo lugar. Em cards estreitos (< 20rem)
 * o rótulo some e fica só o "+".
 */
function AddBar({ item, glass }: { item: MenuItem; glass?: boolean }) {
  const { add } = useCart();
  return (
    <div
      data-no-flip
      className={cn(
        "flex shrink-0 items-center justify-between gap-2 rounded-full p-1.5 pl-5",
        // fundo sólido em vez de backdrop-blur: são 2 por card, 48 na página, pesado demais no iPhone
        glass ? "bg-ink/85 ring-1 ring-cream/10" : "bg-ink text-cream",
      )}
    >
      <p className="flex min-w-0 items-baseline gap-2 leading-none">
        <span className="font-display text-[1.7rem] font-extrabold whitespace-nowrap @xs:text-3xl">{brl(item.price)}</span>
        {item.old && <span className="hidden text-xs whitespace-nowrap text-smoke line-through @[20.5rem]:inline">{brl(item.old)}</span>}
      </p>
      <button
        onClick={(e) => add(item.id, e.currentTarget)}
        aria-label={`Adicionar ${item.name} ao pedido`}
        className="group/add flex h-11 shrink-0 items-center gap-2 rounded-full bg-sauce pl-1.5 pr-1.5 text-sm font-semibold whitespace-nowrap text-cream transition hover:bg-cream hover:text-ink @[18rem]:pl-4"
      >
        <span className="hidden @[18rem]:inline">Adicionar</span>
        <span className="grid size-8 place-items-center rounded-full bg-cream/20 transition-transform duration-300 group-hover/add:rotate-90">
          <Plus size={16} />
        </span>
      </button>
    </div>
  );
}

/* ---------- Card do burger: foto na frente, ficha técnica no verso ---------- */
export function BurgerCard({ item }: { item: MenuItem }) {
  return (
    <HoloFlipCard
      label={`${item.name}, ${brl(item.price)}`}
      effect="ember"
      className="aspect-[3/4]"
      backClassName="bg-paper text-ink"
      front={({ flip }) => (
        <div className="@container group/front relative flex h-full w-full flex-col bg-char p-4 @xs:p-5">
          <img
            src={item.img}
            alt={item.name}
            loading="lazy"
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover/front:scale-110"
          />
          <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/45 to-ink/0" />

          <div className="relative flex items-start justify-between gap-3">
            {item.badge ? (
              <span className={cn("rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.12em] uppercase", BADGE[item.badge.tone])}>{item.badge.label}</span>
            ) : (
              <span />
            )}
            <button
              data-no-flip
              onClick={flip}
              aria-label={`Ver ingredientes do ${item.name}`}
              className="grid size-11 shrink-0 place-items-center rounded-full bg-ink/75 text-cream transition hover:bg-cream hover:text-ink"
            >
              <RotateCw size={16} className="transition-transform duration-500 group-hover/front:rotate-180" />
            </button>
          </div>

          <div className="relative mt-auto">
            <div className="px-1">
              <p className="text-[11px] font-semibold tracking-[0.22em] text-mustard uppercase">{CATEGORY_LABEL[item.cat]}</p>
              <h3 className="mt-1 font-display text-[2.4rem] leading-[0.85] font-black text-balance uppercase @xs:text-5xl">{item.name}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-cream/70">{item.tagline}</p>
            </div>
            <div className="mt-4">
              <AddBar item={item} glass />
            </div>
          </div>
        </div>
      )}
      back={({ flip, flipped }) => (
        <div className="@container flex h-full w-full flex-col p-4 @xs:p-5">
          <div className="flex items-center justify-between px-1">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-sauce uppercase">{CATEGORY_LABEL[item.cat]}</p>
            <button
              data-no-flip
              onClick={flip}
              className="-mr-2 flex h-11 items-center gap-1.5 px-2 text-xs font-semibold tracking-wider text-ink/60 uppercase transition hover:text-sauce"
            >
              <ArrowLeft size={14} /> Voltar
            </button>
          </div>

          <div className="px-1">
            <h3 className="font-display text-[2rem] leading-[0.85] font-black text-balance uppercase @xs:text-4xl">{item.name}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-snug text-ink/70">{item.desc}</p>
          </div>

          <p className="mt-4 px-1 text-[11px] font-semibold tracking-[0.22em] text-ink/50 uppercase">O que vai dentro</p>
          {/* Lista ocupa o espaço que sobra e rola se precisar: o botão nunca é empurrado pra fora */}
          <ul
            className="mt-1 min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 [scrollbar-width:thin]"
            style={{ maskImage: "linear-gradient(#000 85%, transparent)", WebkitMaskImage: "linear-gradient(#000 85%, transparent)" }}
          >
            {item.ingredients?.map((ing, i) => (
              <motion.li
                key={ing}
                className="flex items-baseline gap-3 border-b border-dashed border-ink/15 py-1.5 text-sm"
                initial={false}
                animate={flipped ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
                transition={{ duration: 0.4, delay: flipped ? 0.25 + i * 0.05 : 0, ease: EASE }}
              >
                <span className="font-display text-xs font-bold text-sauce">{String(i + 1).padStart(2, "0")}</span>
                {ing}
              </motion.li>
            ))}
          </ul>

          {item.meta && (
            <div className="mt-3 flex flex-wrap gap-1.5 px-1">
              {item.meta.map((m) => (
                <span key={m} className="rounded-full border border-ink/15 px-2.5 py-1 text-xs font-medium">
                  {m}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3">
            <AddBar item={item} />
          </div>
        </div>
      )}
    />
  );
}
