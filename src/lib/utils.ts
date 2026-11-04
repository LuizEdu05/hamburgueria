import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const brl = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Curva de easing padrão do site (saída suave, sem "quique"). */
export const EASE = [0.2, 0.8, 0.2, 1] as const;

export const CONFIG = {
  whatsapp: "5511999999999", // trocar pelo número real
  freeShipping: 80,
  deliveryFee: 7.9,
  coupon: "PRIMEIRA10",
  couponPct: 0.1,
  couponDelayMs: 20000,
  // minutos desde 00:00 — Ter a Dom, 18h às 23h30 (segunda fechado)
  hours: { open: 18 * 60, close: 23 * 60 + 30, closedDays: [1] },
};

export const whatsappLink = (text: string) =>
  `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
