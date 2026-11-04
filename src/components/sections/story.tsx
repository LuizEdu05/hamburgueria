import { motion, useScroll, useTransform } from "motion/react";
import { Star } from "lucide-react";
import { useRef } from "react";
import { Counter, MaskLine, Reveal, SectionLabel } from "@/components/ui/motion-primitives";
import { EASE } from "@/lib/utils";

/* ---------- Processo (seção clara) ---------- */
const STEPS = [
  ["Blend moído no dia", "Acém, peito e costela angus. Moemos toda manhã e o que sobra não volta no dia seguinte."],
  ["Brioche da casa", "Fermentação de 12 horas, assado diariamente e selado na manteiga na hora de montar."],
  ["Smash a 250°C", "A bola de carne é prensada na chapa bem quente. É isso que cria a crosta caramelizada."],
  ["Molhos autorais", "Maionese defumada, chipotle e o Molho Brasa. Receitas que você só encontra aqui."],
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
            Processo
          </SectionLabel>
          <h2 className="font-display text-title font-black uppercase leading-[0.86] md:text-8xl">
            <MaskLine onView>Nada</MaskLine>
            <MaskLine onView delay={0.1}>congelado.</MaskLine>
            <MaskLine onView delay={0.2}>
              <span className="text-sauce">Nada pronto.</span>
            </MaskLine>
          </h2>
          <Reveal delay={0.3}>
            <p className="mt-8 max-w-sm text-lg text-ink/70">Cada burger é montado na hora em que você pede. Por isso chega do jeito que saiu da chapa.</p>
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
          { to: 52000, suffix: "+", label: "burgers servidos" },
          { to: 4.9, decimals: 1, label: "nota média no iFood" },
          { to: 98, suffix: "%", label: "voltam a pedir" },
          { to: 32, suffix: " min", label: "tempo médio de entrega" },
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

/* ---------- Avaliações (marquee) ---------- */
const REVIEWS = [
  ["Mariana C.", "iFood", "Melhor smash da cidade, sem exagero. Chegou quente, crocante e o cheddar escorrendo."],
  ["Rafael S.", "Google", "O Brasa Bacon é absurdo. Bacon no maple com a maionese defumada… virei cliente."],
  ["Juliana P.", "Instagram", "Embalagem caprichada, nada amassado. O milkshake de Ovomaltine é obrigatório."],
  ["Thiago M.", "iFood", "Pedi o Triplo Monstro achando que não ia dar conta. Dei conta. Volto semana que vem."],
  ["Camila R.", "Google", "Atendimento rápido e o pão é outro nível. Dá pra sentir que é feito na casa."],
  ["Bruno A.", "iFood", "Chegou antes do prazo e ainda quente. O Diablo arde na medida certa."],
] as const;

export function Reviews() {
  const list = [...REVIEWS, ...REVIEWS];
  return (
    <section id="avaliacoes" className="overflow-hidden py-28 md:py-36">
      <div className="wrap mb-14 flex flex-wrap items-end justify-between gap-6">
        <div>
          <SectionLabel index="04" className="text-mustard">
            Avaliações
          </SectionLabel>
          <h2 className="font-display text-title font-black uppercase leading-[0.88] md:text-8xl">
            <MaskLine onView>Quem comeu,</MaskLine>
            <MaskLine onView delay={0.1}>
              <span className="text-outline">voltou.</span>
            </MaskLine>
          </h2>
        </div>
        <Reveal className="text-right">
          <p className="font-display text-8xl font-black leading-none text-mustard">4,9</p>
          <p className="text-sm text-cream/60">média de +2.300 avaliações</p>
        </Reveal>
      </div>

      <div className="group flex">
        <div className="flex shrink-0 animate-marquee gap-6 pr-6 [animation-duration:60s] group-hover:[animation-play-state:paused]">
          {list.map(([name, src, text], i) => (
            <figure key={i} className="w-[min(340px,82vw)] shrink-0 rounded-3xl border border-cream/10 bg-coal p-6 md:w-[400px] md:p-7">
              <div className="flex text-mustard">
                {Array.from({ length: 5 }, (_, k) => (
                  <Star key={k} size={16} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <blockquote className="mt-5 text-lg leading-snug">“{text}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 text-sm">
                <span className="grid size-10 place-items-center rounded-full bg-sauce font-display text-lg font-bold">{name[0]}</span>
                <span>
                  <b className="block">{name}</b>
                  <span className="text-cream/50">via {src}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Fidelidade ---------- */
export function Loyalty() {
  const filled = 7;
  return (
    <section id="fidelidade" className="relative overflow-hidden bg-sauce py-28 md:py-32">
      <div className="wrap grid items-center gap-16 lg:grid-cols-2">
        <div>
          <SectionLabel index="05">Clube Brasa</SectionLabel>
          <h2 className="font-display text-title font-black uppercase leading-[0.86] md:text-8xl">
            <MaskLine onView>Junte 10 selos.</MaskLine>
            <MaskLine onView delay={0.1}>
              <span className="text-ink">O próximo é</span>
            </MaskLine>
            <MaskLine onView delay={0.2}>
              <span className="text-ink">por nossa conta.</span>
            </MaskLine>
          </h2>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-md text-lg text-cream/85">Cada burger vale um selo. Cadastre seu WhatsApp no primeiro pedido e acompanhe por lá. Aniversariante do mês ganha milkshake.</p>
          </Reveal>
        </div>

        <motion.div
          className="mx-auto w-full max-w-md rounded-[2rem] bg-paper p-6 text-ink sm:p-8 shadow-[0_50px_80px_-30px_rgba(0,0,0,.6)]"
          initial={{ rotate: 0, y: 60, opacity: 0 }}
          whileInView={{ rotate: 3, y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: EASE }}
        >
          <div className="flex items-baseline justify-between border-b border-dashed border-ink/20 pb-4">
            <span className="font-display text-3xl font-black uppercase">
              Brasa<span className="text-sauce">&amp;</span>Blend
            </span>
            <span className="text-xs uppercase tracking-[0.2em] text-ink/50">Cartão fidelidade</span>
          </div>
          <div className="mt-6 grid grid-cols-5 gap-2 sm:gap-3">
            {Array.from({ length: 10 }, (_, i) => {
              const on = i < filled;
              const prize = i === 9;
              return (
                <motion.span
                  key={i}
                  className={`grid aspect-square place-items-center rounded-full font-display text-[10px] font-black sm:text-sm ${
                    on ? "bg-sauce text-cream" : prize ? "border-2 border-sauce text-sauce" : "border-2 border-dashed border-ink/20 text-ink/30"
                  }`}
                  initial={on ? { scale: 0, rotate: -40 } : { opacity: 0 }}
                  whileInView={on ? { scale: 1, rotate: -12 } : { opacity: 1 }}
                  viewport={{ once: true }}
                  transition={on ? { type: "spring", stiffness: 300, damping: 12, delay: 0.4 + i * 0.12 } : { delay: 0.4 + i * 0.12 }}
                >
                  {on ? "B&B" : prize ? "GRÁTIS" : i + 1}
                </motion.span>
              );
            })}
          </div>
          <p className="mt-6 text-sm">
            Faltam <b className="text-sauce">3 selos</b> para o seu burger grátis.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
