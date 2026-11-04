import { motion, useMotionValue, useSpring } from "motion/react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { TiltedGridHero, type TiltedGridImage } from "@/components/ui/tilted-grid-hero";
import { Magnetic, MaskLine, Reveal, SectionLabel } from "@/components/ui/motion-primitives";
import { BURGERS, CATEGORY_LABEL, MENU, type MenuItem } from "@/data/menu";
import { brl, EASE } from "@/lib/utils";

// Fotos maiores para a faixa curva (os tiles chegam a ~55% da largura no celular)
const big = (src: string) => src.replace(/w=\d+/, "w=1200");
const IMAGES: TiltedGridImage[] = MENU.map((i) => ({ src: big(i.img), alt: i.name }));

/* ---------- Vitrine: faixa curva com os burgers + cardápio impresso ---------- */
export function Showcase() {
  const [hover, setHover] = useState<MenuItem | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28 });
  const sy = useSpring(y, { stiffness: 260, damping: 28 });

  return (
    <section id="cardapio" className="relative py-24 md:py-32">
      <TiltedGridHero
        images={IMAGES}
        speed={3.5}
        tileHeight={31}
        aspectRatio={4 / 3}
        axis={54}
        curve={72}
        fade={10}
        className="h-[740px] w-full md:h-[840px]"
      >
        <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-between py-6 text-center md:py-10">
          <div className="px-6">
            <SectionLabel index="02" className="justify-center text-mustard">
              Cardápio
            </SectionLabel>
            <h2 className="font-display text-[clamp(2.6rem,13vw,7rem)] font-black uppercase leading-[0.86]">
              <MaskLine onView>Saiu da chapa,</MaskLine>
              <MaskLine onView delay={0.1}>
                <span className="text-outline">passou aqui.</span>
              </MaskLine>
            </h2>
          </div>
          <Reveal className="pointer-events-auto flex flex-col items-center gap-5 px-6">
            <p className="max-w-md text-balance text-cream/70">
              {BURGERS.length} burgers e combos, acompanhamentos e shakes. Escolha com calma na página de pedido: lá cada burger vira e mostra o que vai dentro.
            </p>
            <Magnetic>
              <Link to="/pedido" className="group inline-flex items-center gap-3 rounded-full bg-sauce py-4 pl-7 pr-4 font-semibold transition hover:bg-sauce-deep">
                Escolher meu burger
                <span className="grid size-9 place-items-center rounded-full bg-cream text-ink transition-transform duration-300 group-hover:rotate-[-45deg]">
                  <ArrowRight size={18} />
                </span>
              </Link>
            </Magnetic>
          </Reveal>
        </div>
      </TiltedGridHero>

      {/* Cardápio impresso: nome, preço e atalho para o item na página de pedido */}
      <div
        className="wrap relative mt-20"
        onPointerMove={(e) => {
          x.set(e.clientX);
          y.set(e.clientY);
        }}
      >
        <ul className="grid gap-x-14 md:grid-cols-2">
          {BURGERS.map((item, i) => (
            <Reveal key={item.id} delay={(i % 2) * 0.08} y={24}>
              <li
                onPointerEnter={(e) => e.pointerType === "mouse" && setHover(item)}
                onPointerLeave={() => setHover(null)}
                className="border-b border-cream/10"
              >
                <Link to={`/pedido?item=${item.id}`} className="group flex items-center gap-4 py-5">
                  <span className="w-7 font-display text-sm font-bold text-smoke">{String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-3xl font-black uppercase leading-none transition group-hover:text-mustard">{item.name}</span>
                      <span className="mb-1 h-px flex-1 border-b border-dotted border-cream/25" />
                      <span className="font-display text-2xl font-bold">{brl(item.price)}</span>
                    </div>
                    <p className="mt-1 text-sm text-cream/50">
                      <span className="text-mustard/80">{CATEGORY_LABEL[item.cat]}</span> · {item.tagline}
                    </p>
                  </div>
                  <ArrowUpRight size={20} className="shrink-0 text-cream/40 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-mustard" />
                </Link>
              </li>
            </Reveal>
          ))}
        </ul>

        <motion.div
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-30 hidden size-52 overflow-hidden rounded-2xl shadow-2xl md:block"
          style={{ x: sx, y: sy, translateX: "-50%", translateY: "-115%" }}
          animate={{ opacity: hover ? 1 : 0, scale: hover ? 1 : 0.5, rotate: hover ? -6 : 0 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          {hover && <img src={hover.img} alt="" className="h-full w-full object-cover" />}
        </motion.div>
      </div>
    </section>
  );
}
