import { useEffect } from "react";
import { useLocation } from "react-router";
import { FinalCta, Footer, Location, MobileCartBar } from "@/components/sections/closing";
import { Combo } from "@/components/sections/combo";
import { Header } from "@/components/sections/header";
import { Hero } from "@/components/sections/hero";
import { Marquee } from "@/components/sections/marquee";
import { Showcase } from "@/components/sections/showcase";
import { Process, Reviews } from "@/components/sections/story";

/** Landing: apresenta a casa e os burgers. Todo pedido acontece em /pedido. */
export default function HomePage() {
  const { hash } = useLocation();

  // Vindo de outra página com âncora (ex.: /#combo): rola depois que a cortina abre
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" }), 900);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <>
      <Header variant="home" />
      <main>
        <Hero />
        <Marquee />
        <Combo />
        <Showcase />
        <Process />
        <Reviews />
        <Location />
        <FinalCta />
      </main>
      <Footer />
      <MobileCartBar variant="home" />
    </>
  );
}
