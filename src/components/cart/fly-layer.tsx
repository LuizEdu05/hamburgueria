import { motion } from "motion/react";
import { useCart, type Flight } from "./cart-context";

const SIZE = 56;

/** Alvo do voo: a sacola lateral (página de pedido) se estiver visível, senão o botão do header. */
function flyTarget() {
  for (const id of ["sacola-target", "cart-button"]) {
    const r = document.getElementById(id)?.getBoundingClientRect();
    if (r && r.width > 0 && r.bottom > 0 && r.top < window.innerHeight) return r;
  }
  return undefined;
}

function FlyingItem({ flight, onDone }: { flight: Flight; onDone: () => void }) {
  const target = flyTarget();
  const tx = target ? target.left + target.width / 2 : window.innerWidth - 40;
  const ty = target ? target.top + target.height / 2 : 30;
  const dx = tx - flight.from.x;
  const dy = ty - flight.from.y;

  return (
    <motion.img
      src={flight.img}
      alt=""
      className="absolute rounded-full object-cover shadow-xl ring-2 ring-mustard"
      style={{ width: SIZE, height: SIZE, left: flight.from.x - SIZE / 2, top: flight.from.y - SIZE / 2 }}
      initial={{ x: 0, y: 0, scale: 0.4, opacity: 0 }}
      animate={{
        x: [0, dx * 0.35, dx],
        y: [0, Math.min(dy, 0) * 0.5 - 140, dy],
        scale: [0.4, 1.15, 0.25],
        opacity: [0, 1, 1],
        rotate: [0, -25, 0],
      }}
      transition={{ duration: 0.85, times: [0, 0.4, 1], ease: "easeInOut" }}
      onAnimationComplete={onDone}
    />
  );
}

/** Camada fixa onde o item "voa" do botão até o ícone do carrinho. */
export function FlyLayer() {
  const { flights, land } = useCart();
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90]">
      {flights.map((f) => (
        <FlyingItem key={f.key} flight={f} onDone={() => land(f.key)} />
      ))}
    </div>
  );
}
