import { motion, useInView } from "motion/react";
import { Plus } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router";
import { Magnetic, Reveal, RollingDigits, SectionLabel, SplitWords } from "@/components/ui/motion-primitives";
import { MENU_BY_ID } from "@/data/menu";
import { useCountdownToMidnight } from "@/hooks/use-time";
import { brl, EASE } from "@/lib/utils";

export function Combo() {
  const combo = MENU_BY_ID["combo-dia"];
  const navigate = useNavigate();
  const t = useCountdownToMidnight();
  const imgRef = useRef<HTMLDivElement>(null);
  const imgInView = useInView(imgRef, { once: true, margin: "-100px" });

  return (
    <section id="combo" className="relative py-28 md:py-36">
      <div className="wrap grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div ref={imgRef} className="relative mx-auto w-full max-w-md lg:max-w-none">
          <motion.div
            className="relative aspect-[5/6] overflow-hidden rounded-[2rem]"
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={imgInView ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
            transition={{ duration: 1.2, ease: EASE }}
          >
            <motion.img
              src={combo.img}
              alt="Combo do dia: smash duplo com fritas"
              className="h-full w-full object-cover"
              initial={{ scale: 1.25 }}
              animate={imgInView ? { scale: 1 } : undefined}
              transition={{ duration: 1.6, ease: EASE }}
            />
          </motion.div>
          <motion.div
            className="absolute -right-2 -top-6 grid size-28 place-items-center sm:size-32 rounded-full bg-mustard text-ink md:-right-8 md:size-36"
            initial={{ scale: 0, rotate: -120 }}
            whileInView={{ scale: 1, rotate: -12 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 140, damping: 12, delay: 0.5 }}
          >
            <span className="text-center font-display font-black uppercase leading-[0.85]">
              <span className="block text-4xl sm:text-5xl">-25%</span>
              <span className="block text-sm tracking-widest">só hoje</span>
            </span>
          </motion.div>
        </div>

        <div>
          <SectionLabel index="01" className="text-mustard">
            Combo do dia
          </SectionLabel>
          <h2 className="font-display text-title font-black uppercase leading-[0.88] md:text-7xl">
            <SplitWords text="Smash Duplo, fritas e refri." />
          </h2>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-md text-lg text-cream/70">{combo.desc}</p>

            <div className="mt-8 flex flex-wrap items-end gap-x-4 gap-y-1">
              <span className="font-display text-[clamp(3.2rem,16vw,4.5rem)] font-black leading-none text-mustard">{brl(combo.price)}</span>
              <span className="mb-2 text-lg text-smoke line-through">{brl(combo.old!)}</span>
            </div>

            <div className="mt-10">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-smoke">Acaba em</p>
              <div className="flex items-end gap-2 font-display text-[clamp(2.8rem,13vw,3.75rem)] font-black leading-none md:text-7xl">
                <RollingDigits value={t.h} />
                <span className="pb-2 text-3xl text-smoke">:</span>
                <RollingDigits value={t.m} />
                <span className="pb-2 text-3xl text-smoke">:</span>
                <RollingDigits value={t.s} className="text-sauce" />
              </div>
            </div>

            <div className="mt-10 max-w-md">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-cream/70">Vendidos hoje</span>
                <span className="font-semibold">72%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-char">
                <motion.div
                  className="h-full rounded-full bg-linear-to-r from-mustard to-sauce"
                  initial={{ width: "0%" }}
                  whileInView={{ width: "72%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.6, delay: 0.3, ease: EASE }}
                />
              </div>
            </div>

            <Magnetic className="mt-10">
              <button
                onClick={() => navigate(`/pedido?add=${combo.id}`)}
                className="group inline-flex items-center gap-3 rounded-full bg-cream py-4 pl-7 pr-4 font-semibold text-ink transition hover:bg-mustard"
              >
                Garantir meu combo
                <span className="grid size-9 place-items-center rounded-full bg-sauce text-cream transition-transform duration-300 group-hover:rotate-90">
                  <Plus size={18} />
                </span>
              </button>
            </Magnetic>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
