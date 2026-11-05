/**
 * HoloFlipCard — card 3D que inclina em direção ao ponteiro, reflete um brilho
 * "holográfico" e vira ao clicar (frente / verso).
 *
 * Adaptado do componente "Holographic Business Card" de Aakash Mehra
 * (mesma técnica de tilt com springs, camadas de foil via CSS vars e flip
 * com troca de opacidade na metade do giro). Diferenças:
 * - conteúdo da frente/verso é livre (render props com `flip()`),
 * - sem `touch-none`: no celular a página continua rolando sobre os cards,
 * - o card é um `group`, não um `<button>`, para poder conter botões
 *   (ex.: "Adicionar ao pedido") sem aninhar elementos interativos,
 * - a face escondida recebe `inert`, então o Tab não cai em botões invisíveis.
 */
import { cn } from "@/lib/utils";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useState, type CSSProperties, type MouseEvent, type PointerEvent, type ReactNode } from "react";

/* ---------- Efeitos de foil ---------- */
export type FoilEffect = "ember" | "gold" | "silver" | "rainbow";

const RAINBOW =
  "repeating-linear-gradient(110deg, hsl(0 100% 72%) 0%, hsl(45 100% 68%) 6%, hsl(110 90% 70%) 12%, hsl(185 100% 70%) 18%, hsl(250 100% 76%) 24%, hsl(310 100% 74%) 30%, hsl(360 100% 72%) 36%)";

/** Poça de luz em volta do ponteiro. */
const spot: CSSProperties = {
  WebkitMaskImage:
    "radial-gradient(farthest-corner circle at var(--mx) var(--my), #000 0%, rgba(0,0,0,.4) 55%, transparent 100%)",
  maskImage:
    "radial-gradient(farthest-corner circle at var(--mx) var(--my), #000 0%, rgba(0,0,0,.4) 55%, transparent 100%)",
};

export const FOIL: Record<FoilEffect, { k: number; spot: boolean; layer: CSSProperties }> = {
  // Faixas quentes (vermelho → mostarda) que correm com o ponteiro
  ember: {
    k: 0.7,
    spot: true,
    layer: {
      backgroundImage:
        "repeating-linear-gradient(115deg, hsl(8 90% 58%) 0%, hsl(32 100% 60%) 6%, hsl(48 100% 72%) 11%, hsl(18 95% 56%) 17%, hsl(8 90% 58%) 23%), repeating-linear-gradient(-45deg, rgba(255,255,255,.08) 0 1px, transparent 1px 4px)",
      backgroundSize: "300% 300%, auto",
      backgroundPosition: "var(--mx) var(--my), 0 0",
      mixBlendMode: "overlay",
    },
  },
  gold: {
    k: 0.6,
    spot: false,
    layer: {
      backgroundImage:
        "linear-gradient(115deg, transparent 30%, rgba(255,214,120,.45) 41%, rgba(255,248,225,.95) 48%, rgba(255,232,160,.85) 51%, rgba(196,140,40,.5) 58%, transparent 70%), linear-gradient(rgba(214,168,72,.14), rgba(214,168,72,.14))",
      backgroundSize: "250% 250%, auto",
      backgroundPosition: "var(--mx) var(--my), 0 0",
    },
  },
  silver: {
    k: 0.65,
    spot: false,
    layer: {
      backgroundImage:
        "linear-gradient(115deg, transparent 30%, rgba(214,222,236,.5) 41%, rgba(255,255,255,.98) 48%, rgba(236,242,250,.9) 51%, rgba(140,152,170,.45) 58%, transparent 70%), repeating-linear-gradient(0deg, rgba(255,255,255,.18) 0 1px, rgba(120,130,150,.08) 1px 2px, transparent 2px 3px)",
      backgroundSize: "250% 250%, auto",
      backgroundPosition: "var(--mx) var(--my), 0 0",
    },
  },
  rainbow: {
    k: 0.42,
    spot: true,
    layer: {
      backgroundImage: `${RAINBOW}, repeating-linear-gradient(-45deg, rgba(255,255,255,.07) 0 1px, transparent 1px 4px)`,
      backgroundSize: "300% 300%, auto",
      backgroundPosition: "var(--mx) var(--my), 0 0",
    },
  },
};

const glare: CSSProperties = {
  backgroundImage:
    "radial-gradient(farthest-corner circle at var(--mx) var(--my), rgba(255,255,255,.28) 0%, rgba(255,255,255,.06) 30%, transparent 60%)",
  opacity: "calc(var(--holo) * var(--fx))",
};

export interface FlipApi {
  flip: () => void;
  flipped: boolean;
}

function Face({
  back,
  effect,
  opacity,
  hidden,
  className,
  children,
}: {
  back?: boolean;
  effect: FoilEffect;
  opacity: MotionValue<number>;
  hidden: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      inert={hidden}
      aria-hidden={hidden}
      className={cn(
        "absolute inset-0 overflow-hidden rounded-[1.75rem] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]",
        "shadow-[0_40px_70px_-30px_rgba(0,0,0,.9),0_6px_18px_rgba(0,0,0,.35)]",
        className,
      )}
      style={{ transform: back ? "rotateY(180deg)" : "translateZ(0)", opacity }}
    >
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ opacity: `calc(var(--holo) * var(--fx) * ${FOIL[effect].k})`, ...(FOIL[effect].spot && spot) }}
      >
        <span className="absolute inset-0" style={FOIL[effect].layer} />
      </span>
      <span aria-hidden className="pointer-events-none absolute inset-0" style={glare} />
    </motion.div>
  );
}

export function HoloFlipCard({
  front,
  back,
  label,
  effect = "ember",
  intensity = 0.55,
  idleGlow = 0.06,
  maxTilt = 12,
  hoverScale = 1.03,
  className,
  frontClassName,
  backClassName,
}: {
  front: (api: FlipApi) => ReactNode;
  back: (api: FlipApi) => ReactNode;
  /** Nome acessível do card (ex.: "Street Bacon, R$ 38,00"). */
  label: string;
  effect?: FoilEffect;
  /** Força do brilho no hover, 0..1. */
  intensity?: number;
  /** Brilho em repouso, 0..1. */
  idleGlow?: number;
  /** Inclinação máxima em graus. */
  maxTilt?: number;
  hoverScale?: number;
  /** Classes do wrapper — defina o tamanho aqui (ex.: `aspect-[4/5]`). */
  className?: string;
  frontClassName?: string;
  backClassName?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [flipped, setFlipped] = useState(false);

  // Posição do ponteiro sobre o card, 0..1 (0.5 = centro)
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 180, damping: 18, mass: 0.6 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);
  const holo = useSpring(idleGlow, { stiffness: 120, damping: 20 });
  const scale = useSpring(1, spring);

  const rotateY = useTransform(sx, [0, 1], [-maxTilt, maxTilt]);
  const rotateX = useTransform(sy, [0, 1], [maxTilt, -maxTilt]);
  const mx = useTransform(sx, (v) => `${v * 100}%`);
  const my = useTransform(sy, (v) => `${v * 100}%`);

  const flipAngle = useSpring(0, { stiffness: 140, damping: 18 });
  // Troca as faces na metade do giro (nem todo WebKit respeita backface-visibility)
  const frontOpacity = useTransform(flipAngle, (a): number => (a < 90 ? 1 : 0));
  const backOpacity = useTransform(flipAngle, (a): number => (a < 90 ? 0 : 1));

  const flip = () => {
    const next = flipAngle.get() < 90 ? 180 : 0;
    if (reduceMotion) flipAngle.jump(next);
    else flipAngle.set(next);
    setFlipped(next === 180);
  };

  // Rastreado no wrapper sem transformação: as bordas do card inclinado
  // saem de baixo do ponteiro e causariam "tremida".
  const track = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)));
    py.set(Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)));
    holo.set(1);
    scale.set(hoverScale);
  };
  const reset = () => {
    px.set(0.5);
    py.set(0.5);
    holo.set(idleGlow);
    scale.set(1);
  };

  // Clique em qualquer área "livre" do card vira; elementos com
  // [data-no-flip] (botões de adicionar etc.) não viram.
  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-no-flip]")) return;
    flip();
  };

  const api: FlipApi = { flip, flipped };

  return (
    <div
      className={cn("relative", className)}
      style={{ perspective: 1200 }}
      onPointerMove={track}
      onPointerLeave={reset}
    >
      <motion.div
        role="group"
        aria-label={label}
        onClick={onClick}
        className="relative h-full w-full cursor-pointer select-none [-webkit-tap-highlight-color:transparent]"
        style={
          {
            rotateX: reduceMotion ? 0 : rotateX,
            rotateY: reduceMotion ? 0 : rotateY,
            scale: reduceMotion ? 1 : scale,
            transformStyle: "preserve-3d",
            "--px": sx,
            "--py": sy,
            "--mx": mx,
            "--my": my,
            "--holo": holo,
            "--fx": Math.sqrt(Math.min(1, Math.max(0, intensity))),
          } as never
        }
      >
        <motion.div className="absolute inset-0 [transform-style:preserve-3d]" style={{ rotateY: flipAngle }}>
          <Face effect={effect} opacity={frontOpacity} hidden={flipped} className={frontClassName}>
            {front(api)}
          </Face>
          <Face back effect={effect} opacity={backOpacity} hidden={!flipped} className={backClassName}>
            {back(api)}
          </Face>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default HoloFlipCard;
