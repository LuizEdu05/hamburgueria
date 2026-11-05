import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowLeft, ArrowRight, MapPin, Menu, ShoppingBag, Truck, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router";
import { useCart } from "@/components/cart/cart-context";
import { useOpenStatus } from "@/hooks/use-time";
import { cn, CONFIG, EASE } from "@/lib/utils";

export function TopBar() {
  const status = useOpenStatus();
  return (
    <div className="relative z-50 bg-sauce text-[13px] font-medium text-cream">
      <div className="wrap flex h-10 items-center justify-center gap-6 overflow-hidden whitespace-nowrap md:justify-between">
        <span className="flex items-center gap-2">
          <span className="relative grid size-2 place-items-center">
            {status.open && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-cream" />}
            <span className={cn("size-2 rounded-full bg-cream", !status.open && "opacity-50")} />
          </span>
          {status.label}
        </span>
        <span className="hidden items-center gap-6 md:flex">
          <span className="flex items-center gap-2">
            <Truck size={15} /> Entrega em ~{CONFIG.deliveryMin} min · retirada em ~{CONFIG.pickupMin} min
          </span>
          <span className="flex items-center gap-2">
            <MapPin size={15} /> {CONFIG.address}
          </span>
        </span>
      </div>
    </div>
  );
}

const NAV = [
  ["Cardápio", "#cardapio"],
  ["Destaque", "#combo"],
  ["A casa", "#processo"],
  ["Avaliações", "#avaliacoes"],
  ["Onde estamos", "#local"],
] as const;

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("font-display text-[1.9rem] font-black uppercase leading-none tracking-tight", className)}>
      Street<span className="ml-1.5 text-sauce">Burger</span>
    </Link>
  );
}

const LINK_FX =
  "relative py-1 transition hover:text-cream after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-right after:scale-x-0 after:bg-mustard after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100";

const toSacola = () => document.getElementById("sacola")?.scrollIntoView({ behavior: "smooth", block: "start" });

/** `home`: navegação por âncoras e carrinho leva ao /pedido. `order`: volta ao site e carrinho rola até a sacola. */
/* ---------- Menu de celular (tela cheia) ---------- */
function MobileMenu({ open, onClose, variant }: { open: boolean; onClose: () => void; variant: "home" | "order" }) {
  const status = useOpenStatus();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, onClose]);

  const links: { label: string; href?: string; to?: string }[] =
    variant === "home" ? NAV.map(([label, href]) => ({ label, href })) : [{ label: "Início", to: "/" }, { label: "Combo do dia", to: "/#combo" }];

  // Portal: o header tem transform/backdrop-filter, que prenderiam o `fixed` dentro dele
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[75] flex flex-col bg-ink lg:hidden"
          initial={{ clipPath: "circle(0% at calc(100% - 2.6rem) 2.6rem)" }}
          animate={{ clipPath: "circle(150% at calc(100% - 2.6rem) 2.6rem)" }}
          exit={{ clipPath: "circle(0% at calc(100% - 2.6rem) 2.6rem)" }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <div className="wrap flex h-[72px] shrink-0 items-center justify-between">
            <Logo />
            <button onClick={onClose} aria-label="Fechar menu" className="grid size-11 place-items-center rounded-full border border-cream/15 bg-coal transition hover:border-mustard">
              <X size={18} />
            </button>
          </div>

          <nav className="wrap flex flex-1 flex-col justify-center gap-1 overflow-y-auto py-6">
            {links.map((l, i) => {
              const cls = "group flex items-center justify-between border-b border-cream/10 py-3 font-display text-[clamp(2.6rem,12vw,4rem)] font-black uppercase leading-none";
              const inner = (
                <>
                  <span className="transition group-hover:text-mustard">{l.label}</span>
                  <ArrowRight size={26} className="text-cream/30 transition group-hover:translate-x-1 group-hover:text-mustard" />
                </>
              );
              return (
                <motion.div
                  key={l.label}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 + i * 0.06, ease: EASE }}
                >
                  {l.to ? (
                    <Link to={l.to} onClick={onClose} className={cls}>
                      {inner}
                    </Link>
                  ) : (
                    <a href={l.href} onClick={onClose} className={cls}>
                      {inner}
                    </a>
                  )}
                </motion.div>
              );
            })}
          </nav>

          <motion.div
            className="wrap shrink-0 space-y-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease: EASE }}
          >
            <p className="flex items-center gap-2 text-sm text-cream/60">
              <span className={cn("size-2 rounded-full", status.open ? "bg-mustard" : "bg-cream/40")} /> {status.label}
            </p>
            {variant === "home" ? (
              <Link to="/pedido" onClick={onClose} className="flex items-center justify-between rounded-full bg-sauce py-4 pl-6 pr-3 font-semibold">
                Fazer meu pedido
                <span className="grid size-9 place-items-center rounded-full bg-cream text-ink">
                  <ArrowRight size={18} />
                </span>
              </Link>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  setTimeout(toSacola, 350);
                }}
                className="flex w-full items-center justify-between rounded-full bg-sauce py-4 pl-6 pr-3 font-semibold"
              >
                Ver minha sacola
                <span className="grid size-9 place-items-center rounded-full bg-cream text-ink">
                  <ShoppingBag size={18} />
                </span>
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function Header({ variant = "home" }: { variant?: "home" | "order" }) {
  const { count, bump, flights } = useCart();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Some ao rolar pra baixo, volta ao rolar pra cima
  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(latest > prev && latest > 240);
    setScrolled(latest > 20);
  });

  const closeMenu = useCallback(() => setMenu(false), []);

  // Mostra o header enquanto um item "voa" até o carrinho
  const visible = !hidden || flights.length > 0;

  return (
    <motion.header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-300",
        scrolled ? "border-cream/10 bg-ink/85 backdrop-blur-xl" : "border-transparent bg-transparent",
      )}
      animate={{ y: visible ? 0 : "-100%" }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      <div className="wrap flex h-[72px] items-center justify-between gap-4">
        <Logo />
        {variant === "home" ? (
          <nav className="hidden gap-8 text-sm font-medium text-cream/70 lg:flex">
            {NAV.map(([label, href]) => (
              <a key={href} href={href} className={LINK_FX}>
                {label}
              </a>
            ))}
          </nav>
        ) : (
          <Link to="/" className={cn(LINK_FX, "hidden items-center gap-2 text-sm font-medium text-cream/70 md:flex")}>
            <ArrowLeft size={16} /> Voltar ao site
          </Link>
        )}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="cart-button"
            onClick={() => (variant === "home" ? navigate("/pedido") : toSacola())}
            aria-label={`Abrir pedido, ${count} itens`}
            className="relative grid size-11 place-items-center rounded-full border border-cream/15 bg-coal transition hover:border-mustard"
          >
            <motion.span key={bump} initial={{ scale: bump ? 1.35 : 1, rotate: bump ? -12 : 0 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 400, damping: 12 }}>
              <ShoppingBag size={18} />
            </motion.span>
            {count > 0 && (
              <motion.span
                key={`c${count}`}
                initial={{ scale: 0.4 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-sauce px-1 text-[11px] font-bold"
              >
                {count}
              </motion.span>
            )}
          </button>
          {variant === "home" && (
            <Link to="/pedido" className="hidden rounded-full bg-cream px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-mustard sm:inline-block">
              Pedir agora
            </Link>
          )}
          <button
            onClick={() => setMenu(true)}
            aria-label="Abrir menu"
            aria-expanded={menu}
            className="grid size-11 place-items-center rounded-full border border-cream/15 bg-coal transition hover:border-mustard lg:hidden"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>
      <MobileMenu open={menu} onClose={closeMenu} variant={variant} />
    </motion.header>
  );
}

/** Barra de progresso de leitura no topo. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-mustard" style={{ scaleX: scrollYProgress }} />;
}
