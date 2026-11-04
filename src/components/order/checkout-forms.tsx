import { AnimatePresence, motion } from "motion/react";
import { Banknote, Bike, Check, CreditCard, MessageCircle, Pencil, QrCode, Store } from "lucide-react";
import { useEffect, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { Link } from "react-router";
import { MaskLine } from "@/components/ui/motion-primitives";
import { MENU_BY_ID } from "@/data/menu";
import { brl, cn, EASE } from "@/lib/utils";
import {
  maskCep,
  maskPhone,
  onlyDigits,
  PAY_LABEL,
  parseMoney,
  type Customer,
  type Errors,
  type Mode,
  type Payment,
  type PayMethod,
  type Step,
  type Totals,
} from "./checkout-state";

/* ---------- Peças de formulário ---------- */
function Field({
  label,
  error,
  className,
  ...input
}: { label: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/50">
        {label}
      </label>
      <motion.input
        id={id}
        aria-invalid={!!error}
        animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className={cn(
          "w-full rounded-2xl border bg-coal px-5 py-4 text-cream outline-none transition placeholder:text-cream/25",
          error ? "border-sauce" : "border-cream/10 focus:border-mustard",
        )}
        {...(input as object)}
      />
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-1.5 px-1 text-xs text-sauce">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepTitle({ index, children }: { index: string; children: ReactNode }) {
  return (
    <div className="mb-8 md:mb-10">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-mustard">Etapa {index}</p>
      <h2 className="font-display text-title font-black uppercase leading-[0.86] md:text-7xl">
        <MaskLine>{children}</MaskLine>
      </h2>
    </div>
  );
}

/** Seletor com pílula deslizante (layoutId). */
function Segmented<T extends string>({
  value,
  options,
  onChange,
  group,
}: {
  value: T;
  options: { id: T; label: string; icon: ReactNode }[];
  onChange: (v: T) => void;
  group: string;
}) {
  return (
    <div role="radiogroup" className="grid auto-cols-fr grid-flow-col gap-1 rounded-full border border-cream/10 bg-coal p-1 max-[359px]:grid-flow-row max-[359px]:rounded-3xl">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn("relative flex min-h-11 items-center justify-center gap-2 rounded-full px-3 py-3 text-sm font-semibold sm:px-4 transition-colors", value === o.id ? "text-ink" : "text-cream/60 hover:text-cream")}
        >
          {value === o.id && <motion.span layoutId={group} className="absolute inset-0 rounded-full bg-mustard" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
          <span className="relative flex items-center gap-2">
            {o.icon} {o.label}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ---------- Etapa 2: entrega ---------- */
export function DeliveryForm({ customer: c, setCustomer, errors }: { customer: Customer; setCustomer: (p: Partial<Customer>) => void; errors: Errors }) {
  // Preenche rua e bairro pelo CEP (ViaCEP, API pública)
  useEffect(() => {
    const cep = onlyDigits(c.cep);
    if (cep.length !== 8) return;
    const ctrl = new AbortController();
    fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d: { erro?: boolean; logradouro?: string; bairro?: string }) => {
        if (d.erro) return;
        setCustomer({ street: d.logradouro || c.street, district: d.bairro || c.district });
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [c.cep]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <StepTitle index="02">Pra onde vai?</StepTitle>

      <Segmented<Mode>
        group="mode-pill"
        value={c.mode}
        onChange={(mode) => setCustomer({ mode })}
        options={[
          { id: "delivery", label: "Entrega", icon: <Bike size={16} /> },
          { id: "pickup", label: "Retirar no balcão", icon: <Store size={16} /> },
        ]}
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field label="Seu nome" autoComplete="name" value={c.name} error={errors.name} onChange={(e) => setCustomer({ name: e.target.value })} placeholder="Como te chamamos" />
        <Field
          label="WhatsApp"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={c.phone}
          error={errors.phone}
          onChange={(e) => setCustomer({ phone: maskPhone(e.target.value) })}
          placeholder="(11) 99999-9999"
        />
      </div>

      <AnimatePresence initial={false}>
        {c.mode === "delivery" && (
          <motion.div
            key="addr"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="grid gap-5 pt-5 sm:grid-cols-6">
              <Field
                label="CEP"
                inputMode="numeric"
                autoComplete="postal-code"
                value={c.cep}
                onChange={(e) => setCustomer({ cep: maskCep(e.target.value) })}
                placeholder="00000-000"
                className="sm:col-span-2"
              />
              <Field label="Rua" autoComplete="address-line1" value={c.street} error={errors.street} onChange={(e) => setCustomer({ street: e.target.value })} className="sm:col-span-4" />
              <Field label="Número" inputMode="numeric" value={c.number} error={errors.number} onChange={(e) => setCustomer({ number: e.target.value })} className="sm:col-span-2" />
              <Field label="Complemento" value={c.complement} onChange={(e) => setCustomer({ complement: e.target.value })} placeholder="Apto, bloco" className="sm:col-span-4" />
              <Field label="Bairro" value={c.district} error={errors.district} onChange={(e) => setCustomer({ district: e.target.value })} className="sm:col-span-3" />
              <Field label="Ponto de referência" value={c.reference} onChange={(e) => setCustomer({ reference: e.target.value })} placeholder="Opcional" className="sm:col-span-3" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {c.mode === "pickup" && (
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-2xl border border-dashed border-cream/15 p-5 text-cream/70">
          Retirada na Rua Exemplo, 123 — Centro. Avisamos no WhatsApp quando estiver pronto (uns 20 min).
        </motion.p>
      )}
    </div>
  );
}

/* ---------- Etapa 3: pagamento ---------- */
const PAY_OPTIONS: { id: PayMethod; icon: ReactNode; hint: string }[] = [
  { id: "pix", icon: <QrCode size={22} />, hint: "Chave enviada no WhatsApp" },
  { id: "card", icon: <CreditCard size={22} />, hint: "Maquininha na entrega" },
  { id: "cash", icon: <Banknote size={22} />, hint: "Levamos o troco" },
];

export function PaymentForm({ payment: p, setPayment, errors, grand }: { payment: Payment; setPayment: (p: Partial<Payment>) => void; errors: Errors; grand: number }) {
  return (
    <div>
      <StepTitle index="03">Como vai pagar?</StepTitle>

      <div role="radiogroup" className="grid gap-4 sm:grid-cols-3">
        {PAY_OPTIONS.map((o) => {
          const on = p.method === o.id;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setPayment({ method: o.id })}
              className={cn("relative rounded-3xl border p-5 text-left transition", on ? "border-mustard bg-mustard/10" : "border-cream/10 bg-coal hover:border-cream/30")}
            >
              <span className={cn("grid size-11 place-items-center rounded-full transition", on ? "bg-mustard text-ink" : "bg-char text-cream")}>{o.icon}</span>
              <p className="mt-4 font-display text-2xl font-black uppercase leading-none">{PAY_LABEL[o.id]}</p>
              <p className="mt-1 text-sm text-cream/50">{o.hint}</p>
              <AnimatePresence>
                {on && (
                  <motion.span
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    className="absolute right-4 top-4 grid size-6 place-items-center rounded-full bg-mustard text-ink"
                  >
                    <Check size={14} strokeWidth={3} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        {p.method === "cash" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Field
              label={`Troco para quanto? (total ${brl(grand)})`}
              inputMode="decimal"
              value={p.change}
              error={errors.change}
              onChange={(e) => setPayment({ change: e.target.value.replace(/[^\d,]/g, "") })}
              placeholder="Deixe vazio se não precisar"
              className="pt-6 sm:max-w-sm"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8">
        <label htmlFor="notes" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/50">
          Observações
        </label>
        <textarea
          id="notes"
          rows={3}
          value={p.notes}
          onChange={(e) => setPayment({ notes: e.target.value })}
          placeholder="Ex.: Smash Duplo sem cebola, ponto da carne, interfone quebrado…"
          className="w-full resize-none rounded-2xl border border-cream/10 bg-coal px-5 py-4 text-cream outline-none transition placeholder:text-cream/25 focus:border-mustard"
        />
      </div>
    </div>
  );
}

/* ---------- Etapa 4: revisão ---------- */
export function Review({
  items,
  customer: c,
  payment: p,
  totals,
  goTo,
}: {
  items: Record<string, number>;
  customer: Customer;
  payment: Payment;
  totals: Totals;
  goTo: (s: Step) => void;
}) {
  const blocks: { title: string; step: Step; body: ReactNode }[] = [
    {
      title: "Itens",
      step: 0,
      body: (
        <ul className="space-y-1">
          {Object.entries(items).map(([id, q]) => (
            <li key={id} className="flex justify-between gap-4">
              <span>
                <b className="text-mustard">{q}x</b> {MENU_BY_ID[id].name}
              </span>
              <span className="text-cream/60">{brl(MENU_BY_ID[id].price * q)}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: c.mode === "delivery" ? "Entrega" : "Retirada",
      step: 1,
      body: (
        <p>
          {c.name} · {c.phone}
          <br />
          <span className="text-cream/60">
            {c.mode === "delivery" ? `${c.street}, ${c.number}${c.complement ? ` (${c.complement})` : ""} — ${c.district}` : "No balcão, Rua Exemplo, 123"}
          </span>
        </p>
      ),
    },
    {
      title: "Pagamento",
      step: 2,
      body: (
        <p>
          {PAY_LABEL[p.method]}
          {p.method === "cash" && p.change.trim() && <span className="text-cream/60"> · troco para {brl(parseMoney(p.change))}</span>}
          {p.notes.trim() && <span className="mt-1 block text-cream/60">“{p.notes.trim()}”</span>}
        </p>
      ),
    },
  ];

  return (
    <div>
      <StepTitle index="04">Confere aí.</StepTitle>
      <div className="space-y-4">
        {blocks.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 + i * 0.1, ease: EASE }}
            className="rounded-3xl border border-cream/10 bg-coal p-6"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-mustard">{b.title}</p>
              <button onClick={() => goTo(b.step)} className="flex items-center gap-1.5 text-xs font-semibold text-cream/50 transition hover:text-mustard">
                <Pencil size={13} /> Editar
              </button>
            </div>
            {b.body}
          </motion.div>
        ))}
      </div>
      <p className="mt-6 text-sm text-cream/50">
        Ao enviar, o WhatsApp abre com o pedido pronto. Total de <b className="text-cream">{brl(totals.grand)}</b>. A gente responde confirmando o tempo de entrega.
      </p>
    </div>
  );
}

/* ---------- Pedido enviado ---------- */
export function Success({ code, name, link, mode }: { code: string; name: string; link: string; mode: Mode }) {
  const steps = ["Recebido", "Na chapa", mode === "delivery" ? "Saiu pra entrega" : "Pronto pra retirar"];
  return (
    <div className="mx-auto max-w-2xl py-10 text-center">
      <motion.svg viewBox="0 0 120 120" className="mx-auto size-32" initial="hidden" animate="show" aria-hidden>
        <motion.circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          strokeWidth="6"
          className="stroke-mustard"
          variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 0.8, ease: EASE } } }}
        />
        <motion.path
          d="M38 62 l15 15 l30 -32"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-cream"
          variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 0.5, delay: 0.7, ease: EASE } } }}
        />
      </motion.svg>

      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-mustard">Pedido #{code}</p>
      <h2 className="mt-3 font-display text-[clamp(3.4rem,17vw,4.5rem)] font-black uppercase leading-[0.86] md:text-8xl">
        <MaskLine delay={0.3}>Valeu,</MaskLine>
        <MaskLine delay={0.4}>
          <span className="text-mustard">{name.trim().split(" ")[0] || "chef"}.</span>
        </MaskLine>
      </h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mx-auto mt-6 max-w-md text-lg text-cream/70">
        Seu pedido foi pro nosso WhatsApp. Assim que a gente confirmar, ele vai pra chapa.
      </motion.p>

      <ol className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-2">
        {steps.map((s, i) => (
          <motion.li key={s} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 + i * 0.15, ease: EASE }} className="text-sm">
            <span className="relative mb-3 block h-1.5 overflow-hidden rounded-full bg-char">
              {i === 0 && (
                <motion.span className="absolute inset-0 origin-left rounded-full bg-mustard" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.3, duration: 0.8, ease: EASE }} />
              )}
            </span>
            <span className={i === 0 ? "font-semibold text-cream" : "text-cream/40"}>{s}</span>
          </motion.li>
        ))}
      </ol>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }} className="mt-12 flex flex-wrap justify-center gap-4">
        <Link to="/" className="rounded-full bg-cream px-7 py-4 font-semibold text-ink transition hover:bg-mustard">
          Voltar ao site
        </Link>
        <a href={link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-7 py-4 font-semibold transition hover:border-mustard hover:text-mustard">
          <MessageCircle size={18} /> WhatsApp não abriu? Reenviar
        </a>
      </motion.div>
    </div>
  );
}
