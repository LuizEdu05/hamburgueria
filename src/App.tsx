import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { useRef, type ReactNode } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import { CartProvider } from "@/components/cart/cart-context";
import { FlyLayer } from "@/components/cart/fly-layer";
import { ScrollProgress, TopBar } from "@/components/sections/header";
import HomePage from "@/pages/home";
import OrderPage from "@/pages/order";

/**
 * Cortina vermelha entre páginas: sobe de baixo ao sair, abre para cima ao entrar.
 * No primeiro carregamento ela já nasce aberta, para não cobrir a entrada do hero.
 * (Não usar `initial={false}` no AnimatePresence: isso desliga a animação de entrada
 * de TODOS os componentes da página, não só da cortina.)
 */
function Page({ children, first }: { children: ReactNode; first: boolean }) {
  return (
    <>
      {children}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[90] grid place-items-center bg-sauce"
        initial={{ y: first ? "-100%" : "0%" }}
        animate={{ y: "-100%", transition: { duration: 0.75, delay: 0.15, ease: [0.7, 0, 0.2, 1] } }}
        exit={{ y: ["100%", "0%"], transition: { duration: 0.55, ease: [0.7, 0, 0.2, 1] } }}
      >
        <span className="font-display text-[18vw] font-black uppercase leading-none text-ink/15">B&amp;B</span>
      </motion.div>
    </>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const firstKey = useRef(location.key);
  const first = location.key === firstKey.current;
  return (
    <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo({ top: 0, behavior: "instant" })}>
      <Routes location={location} key={location.pathname}>
        <Route path="/pedido" element={<Page first={first}><OrderPage /></Page>} />
        <Route path="*" element={<Page first={first}><HomePage /></Page>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <CartProvider>
        <BrowserRouter>
          <ScrollProgress />
          <TopBar />
          <AnimatedRoutes />
          <FlyLayer />
          <div className="grain" aria-hidden />
        </BrowserRouter>
      </CartProvider>
    </MotionConfig>
  );
}
