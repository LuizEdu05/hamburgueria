import { useEffect, useState } from "react";
import { CONFIG } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

const DAYS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const hhmm = (m: number) => `${Math.floor(m / 60)}h${m % 60 ? pad(m % 60) : ""}`;

function computeStatus() {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const { open, close, closedDays } = CONFIG.hours;
  const closedToday = closedDays.includes(now.getDay());
  if (!closedToday && mins >= open && mins < close) {
    const left = close - mins;
    return { open: true, label: `Aberto agora · fecha em ${Math.floor(left / 60)}h${pad(left % 60)}` };
  }
  if (!closedToday && mins < open) return { open: false, label: `Abre hoje às ${hhmm(open)} · agende seu pedido` };
  let next = (now.getDay() + 1) % 7;
  while (closedDays.includes(next)) next = (next + 1) % 7;
  const when = next === (now.getDay() + 1) % 7 ? "amanhã" : DAYS[next];
  return { open: false, label: `Fechado agora · abrimos ${when} às ${hhmm(open)}` };
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
