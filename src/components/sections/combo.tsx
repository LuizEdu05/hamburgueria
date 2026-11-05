import { motion, useInView } from "motion/react";
import { Plus } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router";
import { Magnetic, Reveal, SectionLabel, SplitWords } from "@/components/ui/motion-primitives";
import { FEATURED_ID, MENU_BY_ID } from "@/data/menu";
import { brl, EASE } from "@/lib/utils";

/** Destaque da casa: o burger mais carregado do cardápio. */
export function Combo() {
  const item = MENU_BY_ID[FEATURED_ID];
  const navigate = useNavigate();
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
              src={item.img}
              alt={`${item.name} (foto ilustrativa)`}
              className="h-full w-full object-cover"
              initial={{ scale: 1.25 }}
              animate={imgInView ? { scale: 1 } : undefined}
              transition={{ duration: 1.6, ease: EASE }}
            />
          </motion.div>
          <motion.div
            className="absolute -right-2 -top-6 grid size-28 place-items-center rounded-full bg-mustard text-ink sm:size-32 md:-right-8 md:size-36"
            initial={{ scale: 0, rotate: -120 }}
            whileInView={{ scale: 1, rotate: -12 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 140, damping: 12, delay: 0.5 }}
          >
            <span className="text-center font-display font-black uppercase leading-[0.85]">
              <span className="block text-4xl sm:text-5xl">2x</span>
              <span className="block text-sm tracking-widest">costela</span>
            </span>
          </motion.div>
        </div>

        <div>
          <SectionLabel index="01" className="text-mustard">
            O maior da casa
          </SectionLabel>
          <h2 className="font-display text-title font-black uppercase leading-[0.88] md:text-7xl">
            <SplitWords text={`${item.name}.`} />
          </h2>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-md text-lg text-cream/70">{item.tagline} Dois hambúrgueres de costela, bacon crocante em dobro e BBQ.</p>

            <div className="mt-8 flex flex-wrap items-end gap-x-4 gap-y-1">
              <span className="font-display text-[clamp(3.2rem,16vw,4.5rem)] font-black leading-none text-mustard">{brl(item.price)}</span>
            </div>

            <ul className="mt-10 flex max-w-md flex-wrap gap-2">
              {item.ingredients?.map((ing, i) => (
                <motion.li
                  key={ing}
                  className="rounded-full border border-cream/15 px-4 py-2 text-sm text-cream/80"
                  initial={{ opacity: 0, y: 12, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.06, ease: EASE }}
                >
                  {ing}
                </motion.li>
              ))}
            </ul>

            <Magnetic className="mt-10">
              <button
                onClick={() => navigate(`/pedido?add=${item.id}`)}
                className="group inline-flex items-center gap-3 rounded-full bg-cream py-4 pl-7 pr-4 font-semibold text-ink transition hover:bg-mustard"
              >
                Quero o {item.name.replace("Street ", "")}
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
