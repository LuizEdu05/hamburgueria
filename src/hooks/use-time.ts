import { useEffect, useState } from "react";
import { CONFIG } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

function computeStatus() {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const { open, close, closedDays } = CONFIG.hours;
  const closedToday = closedDays.includes(now.getDay());
  if (!closedToday && mins >= open && mins < close) {
    const left = close - mins;
    return { open: true, label: `Aberto agora · fecha em ${Math.floor(left / 60)}h${pad(left % 60)}` };
  }
  if (!closedToday && mins < open) return { open: false, label: "Abre hoje às 18h · agende seu pedido" };
  return { open: false, label: "Fechado agora · abrimos ter a dom às 18h" };
}

/** Status aberto/fechado calculado pelo horário real. */
export function useOpenStatus() {
  const [status, setStatus] = useState(computeStatus);
  useEffect(() => {
    const t = setInterval(() => setStatus(computeStatus()), 30_000);
    return () => clearInterval(t);
  }, []);
  return status;
}

/** Tempo restante até 23:59:59 de hoje (fim do combo do dia). */
export function useCountdownToMidnight() {
  const compute = () => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    const diff = Math.max(0, end.getTime() - now.getTime());
    return {
      h: pad(Math.floor(diff / 3.6e6)),
      m: pad(Math.floor((diff % 3.6e6) / 6e4)),
      s: pad(Math.floor((diff % 6e4) / 1000)),
    };
  };
  const [t, setT] = useState(compute);
  useEffect(() => {
    const id = setInterval(() => setT(compute()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}
