import { motion } from "motion/react";
import { useState, type CSSProperties } from "react";
import { cn, EASE } from "@/lib/utils";

/**
 * Texto "derretendo": um filtro SVG gooey (blur + limiar de alfa) arredonda
 * as letras e funde nelas os pingos que escorrem por baixo. Os pingos são
 * animações CSS (não motion), então continuam rodando mesmo com
 * prefers-reduced-motion, como a faixa curva — escolha do dono do site.
 *
 * x: posição sob a palavra (% da largura) · len: comprimento máximo (em)
 * w: espessura (em) · dur/delay: segundos
 */
const DRIPS = [
  { x: 4.5, len: 0.32, w: 0.075, dur: 5.2, delay: 0.2 },
  { x: 13, len: 0.18, w: 0.06, dur: 4.4, delay: 2.1 },
  { x: 22.5, len: 0.46, w: 0.085, dur: 6.1, delay: 0.9 },
  { x: 33, len: 0.22, w: 0.065, dur: 4.8, delay: 3.2 },
  { x: 42, len: 0.38, w: 0.08, dur: 5.6, delay: 1.5 },
  { x: 51.5, len: 0.17, w: 0.055, dur: 4.1, delay: 2.8 },
  { x: 60, len: 0.52, w: 0.09, dur: 6.6, delay: 0.5 },
  { x: 70.5, len: 0.26, w: 0.07, dur: 5, delay: 3.8 },
  { x: 79, len: 0.35, w: 0.075, dur: 5.8, delay: 1.1 },
  { x: 88.5, len: 0.21, w: 0.06, dur: 4.6, delay: 2.5 },
];

// Gotas "paradas" que formam a borda mole do queijo sob as letras.
const BLOBS = [
  { x: 9, len: 0.08, w: 0.11 },
  { x: 27, len: 0.1, w: 0.12 },
  { x: 47, len: 0.07, w: 0.1 },
  { x: 65, len: 0.11, w: 0.13 },
  { x: 84, len: 0.08, w: 0.11 },
];

/** Filtro gooey; o desfoque escala com o tamanho do texto via dois níveis. */
function GooFilters() {
  const matrix = "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10";
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <defs>
        {[
          ["bb-goo-sm", 2.6],
          ["bb-goo-lg", 5],
        ].map(([id, sd]) => (
          <filter key={id} id={String(id)} x="-10%" y="-10%" width="120%" height="200%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation={sd} result="blur" />
            <feColorMatrix in="blur" mode="matrix" values={matrix} result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        ))}
      </defs>
    </svg>
  );
}

type Drip = { x: number; len: number; w: number; dur?: number; delay?: number };

const dripStyle = (d: Drip, start: number): CSSProperties =>
  ({
    left: `${d.x}%`,
    "--len": `${d.len}em`,
    "--w": `${d.w}em`,
    "--dur": `${d.dur ?? 0}s`,
    "--delay": `${start + (d.delay ?? 0)}s`,
  }) as CSSProperties;

/** Palavra com pingos. `start` atrasa o primeiro pingo (ex.: até o título aparecer). */
export function MeltText({ text, start = 0, className }: { text: string; start?: number; className?: string }) {
  return (
    <span className={cn("relative inline-block", className)}>
      <GooFilters />
      <span className="melt relative inline-block">
        <span className="relative">{text}</span>
        {/* linha de base das letras: é dali que o queijo escorre */}
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-[calc(100%-0.2em)] h-0">
          {BLOBS.map((d) => (
            <span key={`b${d.x}`} className="drip drip-static" style={dripStyle(d, 0)} />
          ))}
          {DRIPS.map((d) => (
            <span key={d.x} className="drip" style={dripStyle(d, start)}>
              <span className="drip-drop" />
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}

/**
 * Última linha do título do hero: entra de baixo da máscara como as outras
 * e, assim que aparece, libera o overflow para os pingos escorrerem para
 * fora da linha (o pb em "em" reserva espaço para eles, proporcional ao
 * tamanho da fonte). Encolhe para caber inteira (sem hifenizar) na largura do
 * <h1>, que precisa de `container-type: inline-size`.
 */
export function MeltLine({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className={cn(
        "block whitespace-nowrap pb-[0.62em] text-[length:min(1em,19.4cqw)]",
        open ? "overflow-visible" : "overflow-hidden",
        className,
      )}
    >
      <motion.span
        className="block origin-bottom-left"
        initial={{ y: "110%", rotate: 4 }}
        animate={{ y: "0%", rotate: 0 }}
        transition={{ duration: 1, delay, ease: EASE }}
        onAnimationComplete={() => setOpen(true)}
      >
        <MeltText text={text} start={delay + 0.9} />
      </motion.span>
    </span>
  );
}
