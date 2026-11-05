import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, ArrowUpRight, Bike, Clock, MapPin, MessageCircle, Phone, ShoppingBag } from "lucide-react";
import { useRef } from "react";
import { Link, useNavigate } from "react-router";
import { useCart } from "@/components/cart/cart-context";
import { Magnetic, Reveal, SectionLabel, SplitWords } from "@/components/ui/motion-primitives";
import { brl, CONFIG, whatsappLink } from "@/lib/utils";
import { Logo } from "./header";

/* ---------- Onde estamos ---------- */
export function Location() {
  const info = [
    [MapPin, `${CONFIG.address} · ${CONFIG.city}`],
    [Clock, `${CONFIG.hoursLabel} (cozinha a partir das 17h30)`],
    [Bike, `Entrega em ~${CONFIG.deliveryMin} min · retirada em ~${CONFIG.pickupMin} min`],
    [Phone, CONFIG.phoneLabel],
  ] as const;
  return (
    <section id="local" className="py-28 md:py-36">
      <div className="wrap grid items-center gap-14 lg:grid-cols-2">
        <div>
          <SectionLabel index="05" className="text-mustard">
            Onde estamos
          </SectionLabel>
          <h2 className="font-display text-title font-black uppercase leading-[0.88] md:text-8xl">
            <SplitWords text="No Centro de Jaraguá." />
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
            <a href={CONFIG.mapsUrl} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3.5 font-semibold text-ink transition hover:bg-mustard">
              Como chegar <ArrowUpRight size={18} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
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

        {/* Mapa real (embed sem chave de API) */}
        <Reveal>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-cream/10 bg-coal">
            <iframe
              title={`Mapa: ${CONFIG.fullName}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(`${CONFIG.fullName}, ${CONFIG.address.replace(" — ", ", ")}, ${CONFIG.city}`)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0 [filter:invert(.92)_hue-rotate(180deg)_saturate(.6)_brightness(.95)]"
            />
            <a
              href={CONFIG.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-5 left-5 rounded-2xl bg-ink/85 px-4 py-3 text-sm backdrop-blur transition hover:bg-ink"
            >
              <b className="block">{CONFIG.fullName}</b>
              <span className="text-cream/60">{CONFIG.address}</span>
            </a>
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
        Burger de verdade. <span className="text-outline">Burger de verdade.</span>
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
          {[
            ["Instagram", CONFIG.instagram],
            ["Cardápio online", CONFIG.orderUrl],
            ["Google Maps", CONFIG.mapsUrl],
          ].map(([label, href]) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" className="transition hover:text-mustard">
              {label}
            </a>
          ))}
        </nav>
        <p className="w-full sm:w-auto">© 2026 {CONFIG.fullName} · {CONFIG.city.split(" — ")[0]}</p>
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
