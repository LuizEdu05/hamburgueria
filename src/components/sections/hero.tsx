import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDownRight, ArrowRight, Clock, Flame, Star } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router";
import { MaskLine, Magnetic } from "@/components/ui/motion-primitives";
import { MeltLine } from "@/components/ui/melt-text";
import { FEATURED_ID, HERO_IMG, MENU_BY_ID } from "@/data/menu";
import { brl, CONFIG, EASE } from "@/lib/utils";

const featured = MENU_BY_ID[FEATURED_ID];

function RotatingBadge() {
  return (
    <div className="relative size-36 md:size-40">
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute inset-0 size-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        aria-hidden
      >
        <defs>
          <path id="badge-circle" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
        </defs>
        <circle cx="100" cy="100" r="98" className="fill-sauce" />
        <text className="fill-cream font-display text-[17px] font-bold uppercase tracking-[0.2em]">
          <textPath href="#badge-circle">Burger de verdade · Jaraguá do Sul · </textPath>
        </text>
      </motion.svg>
      <div className="absolute inset-0 grid place-items-center">
        <Flame className="text-mustard" size={34} strokeWidth={1.6} />
      </div>
    </div>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden pb-20 pt-10 md:pb-28 md:pt-14">
      <div className="wrap grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.div style={{ y: textY, opacity: fade }}>
          <motion.p
            className="mb-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-mustard"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <span className="h-px w-10 bg-mustard" /> Burger &amp; hot dog · Jaraguá do Sul
          </motion.p>

          <h1 className="font-display text-[clamp(4.2rem,10.5vw,9.5rem)] font-black uppercase leading-[0.82] tracking-[-0.01em] [container-type:inline-size]">
            <MaskLine delay={0.1}>Burger</MaskLine>
            <MaskLine delay={0.2}>
              <span className="text-outline">de verdade,</span>
            </MaskLine>
            <MaskLine delay={0.3}>queijo</MaskLine>
            <MeltLine text="escorrendo." delay={0.4} className="text-mustard" />
          </h1>

          <motion.p
            className="mt-4 max-w-md text-lg leading-relaxed text-cream/70"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease: EASE }}
          >
            Hambúrguer de costela no pão especial, hot dog de 25 cm com duas salsichas e porções pra dividir. No Centro de Jaraguá, de quarta a segunda.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap items-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.75, ease: EASE }}
          >
            <Magnetic>
              <Link to="/pedido" className="group inline-flex items-center gap-3 rounded-full bg-sauce py-4 pl-7 pr-4 font-semibold transition hover:bg-sauce-deep">
                Montar meu pedido
                <span className="grid size-9 place-items-center rounded-full bg-cream text-ink transition-transform duration-300 group-hover:rotate-[-45deg]">
                  <ArrowRight size={18} />
                </span>
              </Link>
            </Magnetic>
            <a href="#combo" className="group inline-flex items-center gap-2 font-semibold">
              <span className="border-b border-cream/30 pb-0.5 transition group-hover:border-mustard group-hover:text-mustard">Ver o maior da casa</span>
              <ArrowDownRight size={18} className="transition group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </a>
          </motion.div>

          <motion.div
            className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-cream/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <span className="flex items-center gap-2">
              <span className="flex text-mustard">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                ))}
              </span>
              <b className="text-cream">{CONFIG.rating.toLocaleString("pt-BR")}</b> · {CONFIG.reviews} avaliações no Google
            </span>
            <span className="flex items-center gap-2">
              <Clock size={15} /> Entrega em ~{CONFIG.deliveryMin} min
            </span>
          </motion.div>
        </motion.div>

        {/* Imagem em arco — formato de letreiro antigo */}
        <div className="relative mx-auto w-full max-w-[460px] lg:max-w-none">
          <motion.div
            className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[2rem] bg-char"
            initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            transition={{ duration: 1.3, delay: 0.2, ease: EASE }}
          >
            <motion.div className="absolute inset-0" style={{ y: imgY, scale: imgScale }}>
              <motion.img
                src={HERO_IMG}
                alt="Hambúrguer com queijo derretido (foto ilustrativa)"
                className="h-full w-full object-cover"
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.8, delay: 0.2, ease: EASE }}
              />
            </motion.div>
            <div className="absolute inset-0 bg-linear-to-t from-ink/50 via-transparent to-transparent" />
          </motion.div>

          <motion.div
            className="absolute -bottom-8 -left-6 md:-left-14"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 14, delay: 1 }}
          >
            <RotatingBadge />
          </motion.div>

          <motion.div
            className="absolute -right-3 top-[18%] rotate-6 rounded-2xl bg-cream px-5 py-4 text-ink shadow-2xl md:-right-8"
            initial={{ opacity: 0, x: 40, rotate: 20 }}
            animate={{ opacity: 1, x: 0, rotate: 6 }}
            transition={{ type: "spring", stiffness: 100, damping: 14, delay: 1.2 }}
          >
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sauce">O maior da casa</p>
              <p className="font-display text-3xl font-black uppercase leading-none">{featured.name}</p>
              <p className="mt-1 text-sm font-semibold">{brl(featured.price)}</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
