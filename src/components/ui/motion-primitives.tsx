import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useSpring,
} from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn, EASE } from "@/lib/utils";

/** Sobe + fade quando entra na tela (uma vez). */
export function Reveal({
  children,
  delay = 0,
  y = 40,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Linha de texto que "nasce" de baixo de uma máscara. */
export function MaskLine({
  children,
  delay = 0,
  onView = false,
  className,
}: {
  children: ReactNode;
  delay?: number;
  /** true = anima ao entrar na tela; false = anima no carregamento. */
  onView?: boolean;
  className?: string;
}) {
  // Observa o contêiner (não o texto): o texto começa fora da área recortada
  // e o IntersectionObserver nunca o consideraria visível.
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const show = onView ? inView : true;
  return (
    <span ref={ref} className={cn("block overflow-hidden pb-[0.06em]", className)}>
      <motion.span
        className="block origin-bottom-left"
        initial={{ y: "110%", rotate: 4 }}
        animate={show ? { y: "0%", rotate: 0 } : undefined}
        transition={{ duration: 1, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/** Quebra o texto em palavras e revela uma a uma. */
export function SplitWords({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <span ref={ref} className={cn("inline-block", className)}>
      {text.split(" ").map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={inView ? { y: "0%" } : undefined}
            transition={{ duration: 0.8, delay: delay + i * 0.06, ease: EASE }}
          >
            {word}
            {" "}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Puxa o filho levemente em direção ao cursor. */
export function Magnetic({ children, strength = 0.3, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 15 });
  const sy = useSpring(y, { stiffness: 220, damping: 15 });
  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/** Número que conta até o alvo quando entra na tela. */
export function Counter({ to, decimals = 0, suffix = "", className }: { to: number; decimals?: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration: 1.8, ease: EASE, onUpdate: setValue });
    return () => controls.stop();
  }, [inView, to]);
  return (
    <span ref={ref} className={className}>
      {value.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

/** Dígitos que "rolam" quando mudam (contador regressivo). */
export function RollingDigits({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn("inline-flex", className)} aria-label={value}>
      {value.split("").map((d, i) => (
        <span key={i} aria-hidden className="relative inline-block h-[1em] w-[0.6em] overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={d}
              className="absolute inset-0 text-center"
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              {d}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}

/** Estrela de 4 pontas usada como separador. */
export function Spark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z" fill="currentColor" />
    </svg>
  );
}

/** Título de seção com índice editorial "(02)". */
export function SectionLabel({ index, children, className }: { index: string; children: ReactNode; className?: string }) {
  return (
    <p className={cn("mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em]", className)}>
      <span className="opacity-60">({index})</span>
      <span className="h-px w-8 bg-current opacity-40" />
      {children}
    </p>
  );
}
