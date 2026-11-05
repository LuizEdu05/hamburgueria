import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const brl = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Curva de easing padrão do site (saída suave, sem "quique"). */
export const EASE = [0.2, 0.8, 0.2, 1] as const;

/*
 * Dados públicos da Street Burger and Hot Dog (Google, Instagram @streetburgerjaragua
 * e cardápio Você Pede), conferidos em 04/11/2026. Confirmar com a casa antes de publicar.
 */
export const CONFIG = {
  name: "Street Burger",
  fullName: "Street Burger and Hot Dog",
  // Telefone do perfil no Google. Confirmar se é o WhatsApp de pedidos.
  whatsapp: "5547988238455",
  phoneLabel: "(47) 98823-8455",
  address: "R. Domingos Rodrigues da Nova, 457 — Centro",
  city: "Jaraguá do Sul — SC, 89251-640",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Street+Burger+R.+Domingos+Rodrigues+da+Nova+457+Jaragu%C3%A1+do+Sul",
  instagram: "https://www.instagram.com/streetburgerjaragua/",
  orderUrl: "https://link.vocepede.online/streetburger",
  rating: 4.8,
  reviews: 478,
  deliveryMin: 60,
  pickupMin: 45,
  // Bio do Instagram: quarta a segunda, 17h45 às 23h30 (terça fechado)
  hours: { open: 17 * 60 + 45, close: 23 * 60 + 30, closedDays: [2] },
  hoursLabel: "Quarta a segunda · 17h45 às 23h30",
};

export const whatsappLink = (text: string) =>
  `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
