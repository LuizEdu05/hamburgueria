import { Spark } from "@/components/ui/motion-primitives";
import { cn } from "@/lib/utils";

const WORDS = ["Blend moído no dia", "Pão brioche da casa", "Smash a 250°C", "Molhos autorais", "Bacon no maple", "Nada congelado"];

function Row({ reverse, outline }: { reverse?: boolean; outline?: boolean }) {
  // Lista duplicada → loop contínuo com translateX(-50%)
  const items = [...WORDS, ...WORDS];
  return (
    <div className="flex overflow-hidden">
      <div className={cn("flex shrink-0 items-center gap-10 pr-10", reverse ? "animate-marquee-reverse" : "animate-marquee")}>
        {items.map((w, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className={cn("font-display text-5xl font-black uppercase md:text-7xl", outline && "text-outline")}>{w}</span>
            <Spark className={cn("size-7 shrink-0 md:size-9", outline ? "text-sauce" : "text-mustard")} />
          </span>
        ))}
      </div>
    </div>
  );
}

export function Marquee() {
  return (
    <div aria-hidden className="relative z-10 -rotate-2 space-y-3 bg-sauce py-5 shadow-[0_30px_60px_-20px_rgba(0,0,0,.7)]">
      <Row />
      <div className="bg-ink py-3">
        <Row reverse outline />
      </div>
    </div>
  );
}
