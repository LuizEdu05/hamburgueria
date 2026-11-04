import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, BadgePercent, Clock, Minus, Plus, ShoppingBag, Truck, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import { MENU_BY_ID } from "@/data/menu";
import { useOpenStatus } from "@/hooks/use-time";
import { brl, cn, CONFIG, EASE } from "@/lib/utils";
import type { Mode, Step, Totals } from "./checkout-state";

const CTA: Record<0 | 1 | 2 | 3, string> = {
  0: "Continuar para entrega",
  1: "Continuar para pagamento",
  2: "Revisar pedido",
  3: "Enviar pedido pelo WhatsApp",
};

/** Valor que "rola" quando muda. */
function Amount({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("relative inline-flex overflow-hidden", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={value} initial={{ y: "-100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ duration: 0.35, ease: EASE }}>
          {brl(value)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function OrderSummary({
  step,
  totals,
  mode,
  coupon,
  onCoupon,
  onNext,
  onBack,
}: {
  step: Step;
  totals: Totals;
  mode: Mode;
  coupon: string | null;
  onCoupon: (c: string | null) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const { items, change, count, add, bump } = useCart();
  const status = useOpenStatus();
  const entries = Object.entries(items);
  const missing = CONFIG.freeShipping - totals.subtotal;
  const progress = Math.min(1, totals.subtotal / CONFIG.freeShipping);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState(false);

  // Upsell: sugere o que falta (acompanhamento, depois bebida). Combo já tem tudo.
  const cats = new Set(entries.map(([id]) => MENU_BY_ID[id]?.cat));
  const suggestion =
    step === 0 && entries.length && !cats.has("combo")
      ? !cats.has("side")
        ? MENU_BY_ID["fritas"]
        : !cats.has("drink")
          ? MENU_BY_ID["shake"]
          : null
      : null;

  const apply = () => {
    if (code.trim().toUpperCase() === CONFIG.coupon) {
      onCoupon(CONFIG.coupon);
      setCode("");
      setCodeError(false);
    } else setCodeError(true);
  };

  const s = step as 0 | 1 | 2 | 3;

  return (
    <aside id="sacola" aria-label="Sua sacola" className="scroll-mt-24 rounded-[2rem] border border-cream/10 bg-coal">
      <header className="flex items-center justify-between border-b border-cream/10 px-5 py-5 sm:px-6">
        <h2 className="font-display text-3xl font-black uppercase">
          Sacola <span className="text-smoke">({count})</span>
        </h2>
        <motion.span
          id="sacola-target"
          key={bump}
          className="grid size-11 place-items-center rounded-full bg-char"
          initial={{ scale: bump ? 1.35 : 1, rotate: bump ? -12 : 0 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 12 }}
        >
          <ShoppingBag size={18} />
        </motion.span>
      </header>

      {!status.open && (
        <p className="flex items-start gap-2 border-b border-cream/10 bg-mustard/10 px-6 py-3 text-sm text-mustard">
          <Clock size={16} className="mt-0.5 shrink-0" />
          <span>
            {status.label.split(" · ")[0]}. Pode enviar o pedido: ele entra na fila e a gente confirma quando abrir.
          </span>
        </p>
      )}

      <div className="border-b border-cream/10 px-6 py-4">
        <p className="flex items-center gap-2 text-sm text-smoke">
          <Truck size={16} className="text-mustard" />
          {mode === "pickup" ? (
            <b className="text-cream">Retirada no balcão, sem taxa</b>
          ) : missing > 0 ? (
            <>
              Faltam <b className="text-cream">{brl(missing)}</b> para frete grátis
            </>
          ) : (
            <b className="text-mustard">Frete grátis garantido</b>
          )}
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-char">
          <motion.div
            className="h-full origin-left rounded-full bg-mustard"
            initial={false}
            animate={{ scaleX: mode === "pickup" ? 1 : progress }}
            transition={{ duration: 0.6, ease: EASE }}
          />
        </div>
      </div>

      <ul className="max-h-[38vh] overflow-y-auto px-5 py-1 sm:px-6 lg:max-h-[30vh]">
        <AnimatePresence initial={false}>
          {entries.map(([id, q]) => {
            const item = MENU_BY_ID[id];
            return (
              <motion.li
                key={id}
                layout
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40, height: 0, paddingTop: 0, paddingBottom: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="flex items-center gap-3 overflow-hidden border-b border-cream/10 py-3 last:border-0"
              >
                <img src={item.img} alt="" className="size-12 shrink-0 rounded-xl object-cover sm:size-14" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 leading-tight font-semibold">{item.name}</p>
                  <p className="text-sm text-mustard">{brl(item.price * q)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-char p-1 sm:gap-1">
                  <button onClick={() => change(id, -1)} aria-label={`Remover um ${item.name}`} className="grid size-8 place-items-center rounded-full transition hover:bg-ink sm:size-9">
                    <Minus size={14} />
                  </button>
                  <motion.span key={q} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-5 text-center text-sm font-semibold">
                    {q}
                  </motion.span>
                  <button onClick={() => change(id, 1)} aria-label={`Adicionar um ${item.name}`} className="grid size-8 place-items-center rounded-full transition hover:bg-ink sm:size-9">
                    <Plus size={14} />
                  </button>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
        {!entries.length && (
          <li className="grid place-items-center gap-3 py-12 text-center text-smoke">
            <ShoppingBag size={36} strokeWidth={1.2} />
            <p>
              Sacola vazia.
              <br />
              Escolhe um burger aí do lado.
            </p>
          </li>
        )}
      </ul>

      <AnimatePresence>
        {suggestion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="mx-6 mb-4 flex items-center gap-3 rounded-2xl border border-dashed border-mustard/40 p-3">
              <img src={suggestion.img} alt="" className="size-12 rounded-lg object-cover" />
              <div className="flex-1 text-sm">
                <p className="font-semibold">Combina com {suggestion.name.toLowerCase()}?</p>
                <p className="text-smoke">{brl(suggestion.price)}</p>
              </div>
              <button
                onClick={(e) => add(suggestion.id, e.currentTarget)}
                className="rounded-full bg-mustard px-4 py-2 text-xs font-bold uppercase tracking-wide text-ink transition hover:bg-cream"
              >
                Adicionar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-t border-cream/10 px-6 py-5">
        {/* Cupom */}
        <AnimatePresence mode="wait" initial={false}>
          {coupon ? (
            <motion.div
              key="on"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 flex items-center justify-between rounded-2xl border border-dashed border-mustard/50 bg-mustard/10 px-4 py-3 text-sm"
            >
              <span className="flex items-center gap-2 font-semibold text-mustard">
                <BadgePercent size={16} /> {coupon} · {Math.round(CONFIG.couponPct * 100)}% off
              </span>
              <button onClick={() => onCoupon(null)} aria-label="Remover cupom" className="text-cream/50 transition hover:text-cream">
                <X size={16} />
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="off"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, x: codeError ? [0, -8, 8, -5, 5, 0] : 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              onSubmit={(e) => {
                e.preventDefault();
                apply();
              }}
              className="mb-4"
            >
              <div className={cn("flex rounded-full border bg-char p-1 transition", codeError ? "border-sauce" : "border-cream/10 focus-within:border-mustard")}>
                <input
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setCodeError(false);
                  }}
                  placeholder="Cupom de desconto"
                  aria-label="Cupom de desconto"
                  className="min-w-0 flex-1 bg-transparent px-4 text-base uppercase outline-none placeholder:normal-case placeholder:text-cream/35"
                />
                <button type="submit" className="rounded-full bg-cream px-4 py-2 text-xs font-bold uppercase tracking-wide text-ink transition hover:bg-mustard">
                  Aplicar
                </button>
              </div>
              {codeError && <p className="mt-2 px-4 text-xs text-sauce">Cupom inválido</p>}
            </motion.form>
          )}
        </AnimatePresence>

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between text-cream/70">
            <dt>Subtotal</dt>
            <dd>
              <Amount value={totals.subtotal} />
            </dd>
          </div>
          <AnimatePresence initial={false}>
            {totals.discount > 0 && (
              <motion.div key="d" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex justify-between text-mustard">
                <dt>Cupom</dt>
                <dd>
                  −<Amount value={totals.discount} />
                </dd>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex justify-between text-cream/70">
            <dt>{mode === "pickup" ? "Retirada" : "Entrega"}</dt>
            <dd>{totals.fee ? <Amount value={totals.fee} /> : <span className="text-mustard">grátis</span>}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-cream/10 pt-3">
            <dt className="text-smoke">Total</dt>
            <dd>
              <Amount value={totals.grand} className="font-display text-4xl font-extrabold" />
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex gap-2">
          <AnimatePresence initial={false}>
            {step > 0 && (
              <motion.button
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 56, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                onClick={onBack}
                aria-label="Voltar uma etapa"
                className="grid h-14 shrink-0 place-items-center rounded-full border border-cream/15 transition hover:border-mustard"
              >
                <ArrowLeft size={18} />
              </motion.button>
            )}
          </AnimatePresence>
          <button
            onClick={onNext}
            disabled={!entries.length}
            className={cn(
              "group relative flex h-14 flex-1 items-center justify-center gap-2 overflow-hidden rounded-full font-semibold transition disabled:opacity-40",
              s === 3 ? "bg-mustard text-ink hover:bg-cream" : "bg-sauce hover:bg-sauce-deep",
            )}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={s}
                className="flex items-center gap-2"
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -24, opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                {CTA[s]}
                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>
    </aside>
  );
}
