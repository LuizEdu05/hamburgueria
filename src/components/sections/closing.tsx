import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, ArrowUpRight, Bike, Check, Clock, Copy, MapPin, MessageCircle, Phone, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useCart } from "@/components/cart/cart-context";
import { Magnetic, Reveal, SectionLabel, SplitWords } from "@/components/ui/motion-primitives";
import { brl, CONFIG, whatsappLink } from "@/lib/utils";
import { Logo } from "./header";

/* ---------- Onde estamos ---------- */
export function Location() {
  const info = [
    [MapPin, "Rua Exemplo, 123 — Centro, Sua Cidade"],
    [Clock, "Terça a domingo · 18h às 23h30"],
    [Bike, "Entregamos num raio de 7 km"],
    [Phone, "(11) 99999-9999"],
  ] as const;
  return (
    <section id="local" className="py-28 md:py-36">
      <div className="wrap grid items-center gap-14 lg:grid-cols-2">
        <div>
          <SectionLabel index="06" className="text-mustard">
            Onde estamos
          </SectionLabel>
          <h2 className="font-display text-title font-black uppercase leading-[0.88] md:text-8xl">
            <SplitWords text="Delivery e salão." />
          </h2>
          <ul className="mt-10 divide-y divide-cream/10 border-y border-cream/10">
            {info.map(([Icon, text], i) => (
              <Reveal key={text} delay={i * 0.08}>
                <li className="flex items-start gap-4 py-4 text-cream/80">
                  <Icon size={18} className="mt-0.5 shrink-0 text-mustard" /> {text}
                </li>
              </Reveal>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href="#" className="group inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3.5 font-semibold text-ink transition hover:bg-mustard">
              Pedir no iFood <ArrowUpRight size={18} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <Link
              to="/pedido"
              className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-6 py-3.5 font-semibold transition hover:border-mustard hover:text-mustard"
            >
              <ShoppingBag size={18} /> Pedir pelo site
            </Link>
            <a
              href={whatsappLink("Olá! Tenho uma dúvida.")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-2 py-3.5 text-sm font-semibold text-cream/60 transition hover:text-mustard"
            >
              <MessageCircle size={18} /> Falar no WhatsApp
            </a>
          </div>
        </div>

        {/* Mapa estilizado — trocar por embed do Google Maps */}
        <Reveal>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-cream/10 bg-coal">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "linear-gradient(var(--color-char) 2px, transparent 2px), linear-gradient(90deg, var(--color-char) 2px, transparent 2px), linear-gradient(35deg, transparent 48%, var(--color-smoke) 49%, var(--color-smoke) 51%, transparent 52%)",
                backgroundSize: "56px 56px, 56px 56px, 100% 100%",
              }}
            />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-sauce" />
              <motion.span
                className="relative grid size-14 place-items-center rounded-full bg-sauce shadow-[0_0_0_6px_rgba(225,48,29,.25)]"
                initial={{ y: -80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.3 }}
              >
                <MapPin size={24} />
              </motion.span>
            </div>
            <div className="absolute bottom-5 left-5 rounded-2xl bg-ink/80 px-4 py-3 text-sm backdrop-blur">
              <b className="block">Brasa &amp; Blend</b>
              <span className="text-cream/60">Rua Exemplo, 123</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- CTA final com texto que corre no scroll ---------- */
export function FinalCta() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x1 = useTransform(scrollYProgress, [0, 1], ["5%", "-35%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-35%", "5%"]);
  return (
    <section ref={ref} className="overflow-hidden border-y border-cream/10 py-20 md:py-24">
      <motion.p style={{ x: x1 }} className="whitespace-nowrap font-display text-[17vw] font-black uppercase leading-[0.85]">
        Bateu a fome? <span className="text-outline">Bateu a fome?</span>
      </motion.p>
      <motion.p style={{ x: x2 }} className="whitespace-nowrap font-display text-[17vw] font-black uppercase leading-[0.85] text-sauce">
        Chega em 30 min. <span className="text-outline">Chega em 30 min.</span>
      </motion.p>
      <div className="mt-14 flex justify-center">
        <Magnetic strength={0.4}>
          <Link to="/pedido" className="grid size-36 place-items-center rounded-full bg-mustard sm:size-44 text-center font-display text-2xl font-black uppercase leading-none text-ink transition hover:scale-105 hover:bg-cream">
            Montar
            <br />
            pedido
          </Link>
        </Magnetic>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="pb-28 pt-14 md:pb-14">
      <div className="wrap flex flex-wrap items-center justify-between gap-6 text-sm text-cream/50">
        <Logo className="text-cream" />
        <nav className="flex gap-6">
          {["Instagram", "TikTok", "iFood"].map((s) => (
            <a key={s} href="#" className="transition hover:text-mustard">
              {s}
            </a>
          ))}
        </nav>
        <p className="w-full sm:w-auto">© 2026 Brasa &amp; Blend · CNPJ 00.000.000/0001-00</p>
      </div>
    </footer>
  );
}

/* ---------- Barra fixa no celular ---------- */
/** Na home leva ao /pedido; na página de pedido rola até a sacola. */
export function MobileCartBar({ variant = "home" }: { variant?: "home" | "order" }) {
  const { count, total } = useCart();
  const navigate = useNavigate();
  const go = () =>
    variant === "home" ? navigate("/pedido") : document.getElementById("sacola")?.scrollIntoView({ behavior: "smooth", block: "start" });
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-cream/10 bg-ink/90 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <button onClick={go} className="flex w-full items-center justify-between rounded-full bg-sauce py-3.5 pl-5 pr-3 font-semibold">
            <span className="flex items-center gap-2">
              <ShoppingBag size={18} /> Ver pedido ({count})
            </span>
            <span className="flex items-center gap-2">
              {brl(total)}
              <span className="grid size-8 place-items-center rounded-full bg-cream text-ink">
                <ArrowRight size={16} />
              </span>
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Cupom de primeira compra (tempo ou intenção de saída) ---------- */
export function CouponModal() {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("bb-coupon")) return;
    const trigger = () => {
      if (sessionStorage.getItem("bb-coupon")) return;
      sessionStorage.setItem("bb-coupon", "1");
      setShow(true);
    };
    const timer = setTimeout(trigger, CONFIG.couponDelayMs);
    const onLeave = (e: MouseEvent) => !e.relatedTarget && e.clientY < 10 && trigger();
    document.addEventListener("mouseout", onLeave);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseout", onLeave);
    };
  }, []);

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShow(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [show]);

  const copy = () => {
    navigator.clipboard?.writeText(CONFIG.coupon);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[95] grid place-items-center bg-ink/75 p-5 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && setShow(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Cupom de primeira compra"
            className="relative w-full max-w-lg overflow-hidden rounded-[2rem] bg-paper text-ink"
            initial={{ y: 60, scale: 0.92, rotate: -3 }}
            animate={{ y: 0, scale: 1, rotate: 0 }}
            exit={{ y: 40, scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
          >
            <button onClick={() => setShow(false)} aria-label="Fechar" className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full bg-ink/5 transition hover:bg-sauce hover:text-cream">
              <X size={16} />
            </button>
            <div className="bg-sauce px-6 pb-6 pt-10 text-cream sm:px-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em]">Primeiro pedido</p>
              <p className="font-display text-[clamp(4.5rem,24vw,7rem)] font-black uppercase leading-[0.8]">
                10%<span className="text-ink"> off</span>
              </p>
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-ink/70">Antes de ir: use o cupom abaixo no checkout. Válido só hoje.</p>
              <button onClick={copy} className="mt-5 flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-ink/25 px-5 py-4 transition hover:border-sauce">
                <span className="font-display text-2xl font-black tracking-widest sm:text-3xl">{CONFIG.coupon}</span>
                <span className="flex items-center gap-2 text-sm font-semibold text-sauce">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Copiado" : "Copiar"}
                </span>
              </button>
              <Link
                to={`/pedido?cupom=${CONFIG.coupon}`}
                onClick={() => setShow(false)}
                className="mt-4 flex items-center justify-center gap-2 rounded-full bg-ink py-4 font-semibold text-cream transition hover:bg-sauce"
              >
                Usar agora <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

