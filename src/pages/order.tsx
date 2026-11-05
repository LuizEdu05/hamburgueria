import { AnimatePresence, motion } from "motion/react";
import { Check, Clock, ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { useCart } from "@/components/cart/cart-context";
import { DeliveryForm, PaymentForm, Review, Success } from "@/components/order/checkout-forms";
import {
  buildMessage,
  computeTotals,
  loadCustomer,
  saveCustomer,
  STEPS,
  validateDelivery,
  validatePayment,
  type Customer,
  type Errors,
  type Payment,
  type Step,
} from "@/components/order/checkout-state";
import { OrderMenu } from "@/components/order/order-menu";
import { OrderSummary } from "@/components/order/order-summary";
import { Footer, MobileCartBar } from "@/components/sections/closing";
import { Header } from "@/components/sections/header";
import { MaskLine } from "@/components/ui/motion-primitives";
import { MENU_BY_ID } from "@/data/menu";
import { useOpenStatus } from "@/hooks/use-time";
import { cn, EASE, whatsappLink } from "@/lib/utils";

/* ---------- Topo com as etapas ---------- */
function Stepper({ step, goTo }: { step: Step; goTo: (s: Step) => void }) {
  const ref = useRef<HTMLOListElement>(null);

  // No celular a fila de etapas rola de lado: mantém a etapa atual centralizada
  useEffect(() => {
    const ol = ref.current;
    const li = ol?.children[step] as HTMLElement | undefined;
    if (!ol || !li || ol.scrollWidth <= ol.clientWidth) return;
    ol.scrollTo({ left: li.offsetLeft - (ol.clientWidth - li.offsetWidth) / 2, behavior: "smooth" });
  }, [step]);

  return (
    <ol ref={ref} className="relative -mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" aria-label="Etapas do pedido">
      {STEPS.map((label, i) => {
        const done = step > i;
        const current = step === i;
        return (
          <li key={label} className="shrink-0">
            <button
              disabled={!done}
              onClick={() => goTo(i as Step)}
              aria-current={current ? "step" : undefined}
              className={cn(
                "relative flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                current ? "border-transparent text-ink" : done ? "border-mustard/40 text-mustard hover:border-mustard" : "border-cream/10 text-cream/35",
              )}
            >
              {current && <motion.span layoutId="step-pill" className="absolute inset-0 rounded-full bg-mustard" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <span className="relative flex items-center gap-2">
                {done ? <Check size={14} strokeWidth={3} /> : <span className="font-display">{String(i + 1).padStart(2, "0")}</span>}
                {label}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function OrderHero({ step, goTo }: { step: Step; goTo: (s: Step) => void }) {
  const status = useOpenStatus();
  return (
    <section className="pb-10 pt-6 md:pb-16 md:pt-12">
      <div className="wrap flex flex-wrap items-end justify-between gap-8">
        <div>
          <motion.p
            className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-mustard"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <span className="h-px w-10 bg-mustard" /> Pedido online
          </motion.p>
          <h1 className="font-display text-[clamp(3.6rem,8vw,7.5rem)] font-black uppercase leading-[0.84]">
            <MaskLine delay={0.15}>Monte seu</MaskLine>
            <MaskLine delay={0.25}>
              <span className="text-outline">pedido.</span>
            </MaskLine>
          </h1>
        </div>
        <motion.div className="w-full space-y-4 sm:w-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5, ease: EASE }}>
          <p className="flex items-center gap-2 text-sm text-cream/60">
            <Clock size={15} className={status.open ? "text-mustard" : ""} /> {status.open ? "Entrega em 30–40 min" : status.label}
          </p>
          {step < 4 && <Stepper step={step} goTo={goTo} />}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Toast simples ---------- */
function Toast({ text }: { text: string | null }) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          role="status"
          className="fixed bottom-24 left-1/2 z-[85] flex -translate-x-1/2 items-center gap-3 rounded-full bg-cream py-3 pl-3 pr-5 text-sm font-semibold text-ink shadow-2xl md:bottom-8"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
        >
          <span className="grid size-7 place-items-center rounded-full bg-sauce text-cream">
            <ShoppingBag size={14} />
          </span>
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Página ---------- */
export default function OrderPage() {
  const cart = useCart();
  const status = useOpenStatus();
  const [params, setParams] = useSearchParams();
  const [step, setStep] = useState<Step>(0);
  const [customer, setCustomerState] = useState<Customer>(loadCustomer);
  const [payment, setPaymentState] = useState<Payment>({ method: "pix", change: "", notes: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [focus, setFocus] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [sent, setSent] = useState<{ code: string; link: string } | null>(null);
  const handled = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);

  const totals = computeTotals(cart.total, customer.mode);

  const notify = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 2600);
  };

  // Links vindos da home: ?add=id (já adiciona), ?item=id (rola até o card)
  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    const add = params.get("add");
    const item = params.get("item");
    if (add && MENU_BY_ID[add]) {
      cart.add(add);
      setFocus(add);
      setTimeout(() => notify(`${MENU_BY_ID[add].name} na sacola`), 800);
    }
    if (item && MENU_BY_ID[item]) setFocus(item);
    if (add || item) setParams({}, { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setCustomer = (p: Partial<Customer>) => {
    setCustomerState((c) => ({ ...c, ...p }));
    setErrors((e) => {
      const next = { ...e };
      for (const k of Object.keys(p)) delete next[k as keyof Errors];
      return next;
    });
  };
  const setPayment = (p: Partial<Payment>) => {
    setPaymentState((c) => ({ ...c, ...p }));
    setErrors({});
  };

  const goTo = (s: Step) => {
    setErrors({});
    setStep(s);
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const next = () => {
    if (step === 0) return goTo(1);
    if (step === 1) {
      const e = validateDelivery(customer);
      if (Object.keys(e).length) return setErrors(e);
      return goTo(2);
    }
    if (step === 2) {
      const e = validatePayment(payment, totals.grand);
      if (Object.keys(e).length) return setErrors(e);
      return goTo(3);
    }
    if (step === 3) {
      const code = String(Math.floor(1000 + Math.random() * 9000));
      const link = whatsappLink(buildMessage({ code, items: cart.items, totals, customer, payment, scheduled: !status.open }));
      window.open(link, "_blank", "noopener");
      saveCustomer(customer);
      setSent({ code, link });
      cart.clear();
      goTo(4);
    }
  };

  const back = () => step > 0 && step < 4 && goTo((step - 1) as Step);

  // Sem itens não há o que preencher: volta para a escolha
  useEffect(() => {
    if (cart.count === 0 && step > 0 && step < 4) setStep(0);
  }, [cart.count, step]);

  const panel =
    step === 0 ? (
      <OrderMenu focus={focus} />
    ) : step === 1 ? (
      <DeliveryForm customer={customer} setCustomer={setCustomer} errors={errors} />
    ) : step === 2 ? (
      <PaymentForm payment={payment} setPayment={setPayment} errors={errors} grand={totals.grand} />
    ) : (
      <Review items={cart.items} customer={customer} payment={payment} totals={totals} goTo={goTo} />
    );

  return (
    <>
      <Header variant="order" />
      <main>
        <OrderHero step={step} goTo={goTo} />
        <div ref={topRef} className="wrap scroll-mt-24 pb-28">
          {step === 4 && sent ? (
            <Success code={sent.code} link={sent.link} name={customer.name} mode={customer.mode} />
          ) : (
            <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_400px] xl:gap-14">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 60, filter: "blur(6px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -60, filter: "blur(6px)" }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="min-w-0"
                >
                  {panel}
                </motion.div>
              </AnimatePresence>
              <div className="lg:sticky lg:top-24">
                <OrderSummary
                  step={step}
                  totals={totals}
                  mode={customer.mode}
                  onNext={next}
                  onBack={back}
                />
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      {step < 4 && <MobileCartBar variant="order" />}
      <Toast text={toast} />
    </>
  );
}
