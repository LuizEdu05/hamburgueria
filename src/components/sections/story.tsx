import { motion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight, AtSign, Star } from "lucide-react";
import { useRef } from "react";
import { Counter, MaskLine, Reveal, SectionLabel } from "@/components/ui/motion-primitives";
import { MENU } from "@/data/menu";
import { CONFIG } from "@/lib/utils";

/* ---------- Processo (seção clara) ---------- */
const STEPS = [
  ["Hambúrguer de costela", "A base de quase todo burger da casa. Também tem pernil suíno, linguiça defumada e uma opção sem carne."],
  ["Pão especial", "Todo burger vem no pão especial. O Street Churrasco vai na baguete, com lascas de alcatra acebolada."],
  ["Hot dog de 25 cm", "Duas salsichas, molho vermelho e batata palha. Sete sabores, do simples ao de alcatra com catupiry."],
  ["Porções pra dividir", "Fritas, rústica, polenta e anéis de cebola até 1 kg. A porção mista chega a 2 kg."],
] as const;

export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const line = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="processo" className="relative bg-cream py-28 text-ink md:py-36">
      <div className="wrap grid gap-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionLabel index="03" className="text-sauce">
            A casa
          </SectionLabel>
          <h2 className="font-display text-title font-black uppercase leading-[0.86] md:text-8xl">
            <MaskLine onView>Burger</MaskLine>
            <MaskLine onView delay={0.1}>de verdade.</MaskLine>
            <MaskLine onView delay={0.2}>
              <span className="text-sauce">Do jeito da casa.</span>
            </MaskLine>
          </h2>
          <Reveal delay={0.3}>
            <p className="mt-8 max-w-sm text-lg text-ink/70">Carne de costela, pão especial e os molhos da casa: ervas finas, alho e BBQ. É isso que segura o cardápio inteiro.</p>
          </Reveal>
        </div>

        <div ref={ref} className="relative pl-8 md:pl-16">
          <div className="absolute bottom-0 left-0 top-0 w-px bg-ink/10" />
          <motion.div className="absolute left-0 top-0 h-full w-px origin-top bg-sauce" style={{ scaleY: line }} />
          {STEPS.map(([title, text], i) => (
            <Reveal key={title} className="group/step relative border-b border-ink/10 py-10 first:pt-0 last:border-0">
              <span className="absolute -left-8 top-12 size-2.5 -translate-x-1/2 rounded-full bg-sauce group-first/step:top-2 md:-left-16" />
              <p className="font-display text-7xl font-black leading-none text-outline-ink sm:text-8xl md:text-9xl">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 font-display text-4xl font-black uppercase">{title}</h3>
              <p className="mt-3 max-w-md text-ink/70">{text}</p>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="wrap mt-24 grid grid-cols-2 gap-y-10 border-t border-ink/15 pt-12 md:grid-cols-4">
        {[
          { to: MENU.filter((i) => i.cat === "burger").length, suffix: "", label: "burgers no cardápio" },
          { to: MENU.filter((i) => i.cat === "dog").length, label: "sabores de hot dog" },
          { to: CONFIG.rating, decimals: 1, label: "nota no Google" },
          { to: CONFIG.reviews, label: "avaliações no Google" },
        ].map((c) => (
          <div key={c.label}>
            <Counter to={c.to} decimals={c.decimals} suffix={c.suffix} className="block font-display text-[clamp(2.4rem,11vw,3.75rem)] font-black text-sauce md:text-7xl" />
            <span className="text-sm text-ink/60">{c.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Avaliações (dados públicos do Google e Instagram) ---------- */
export function Reviews() {
  const stats = [
    { value: CONFIG.rating.toLocaleString("pt-BR"), label: "de 5 estrelas no Google", stars: true },
    { value: String(CONFIG.reviews), label: "avaliações no Google" },
    { value: "+4,8 mil", label: "seguidores no Instagram" },
  ];
  return (
    <section id="avaliacoes" className="overflow-hidden py-28 md:py-36">
      <div className="wrap">
        <SectionLabel index="04" className="text-mustard">
          Avaliações
        </SectionLabel>
        <h2 className="font-display text-title font-black uppercase leading-[0.88] md:text-8xl">
          <MaskLine onView>A nota de</MaskLine>
          <MaskLine onView delay={0.1}>
            <span className="text-outline">quem já comeu.</span>
          </MaskLine>
        </h2>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1}>
              <div className="h-full rounded-3xl border border-cream/10 bg-coal p-7">
                {s.stars && (
                  <div className="mb-4 flex text-mustard">
                    {Array.from({ length: 5 }, (_, k) => (
                      <Star key={k} size={18} fill="currentColor" strokeWidth={0} />
                    ))}
                  </div>
                )}
                <p className="font-display text-7xl font-black leading-none text-mustard">{s.value}</p>
                <p className="mt-2 text-cream/60">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href={CONFIG.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3.5 font-semibold text-ink transition hover:bg-mustard"
            >
              Ler as avaliações no Google <ArrowUpRight size={18} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <a
              href={CONFIG.instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-6 py-3.5 font-semibold transition hover:border-mustard hover:text-mustard"
            >
              <AtSign size={18} /> streetburgerjaragua
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
