import { MENU_BY_ID } from "@/data/menu";
import { brl, CONFIG } from "@/lib/utils";

export const STEPS = ["Escolha", "Entrega", "Pagamento", "Revisão"] as const;
/** 0–3 seguem STEPS; 4 = pedido enviado. */
export type Step = 0 | 1 | 2 | 3 | 4;

export type Mode = "delivery" | "pickup";
export type PayMethod = "pix" | "card" | "cash";

export interface Customer {
  name: string;
  phone: string;
  mode: Mode;
  cep: string;
  street: string;
  number: string;
  district: string;
  complement: string;
  reference: string;
}

export interface Payment {
  method: PayMethod;
  change: string;
  notes: string;
}

export const PAY_LABEL: Record<PayMethod, string> = {
  pix: "Pix",
  card: "Cartão na entrega",
  cash: "Dinheiro",
};

export type Errors = Partial<Record<keyof Customer | "change", string>>;

const CUSTOMER_KEY = "bb-customer";

export const EMPTY_CUSTOMER: Customer = {
  name: "",
  phone: "",
  mode: "delivery",
  cep: "",
  street: "",
  number: "",
  district: "",
  complement: "",
  reference: "",
};

/** Dados do último pedido ficam só no aparelho do cliente, para preencher o próximo mais rápido. */
export function loadCustomer(): Customer {
  try {
    return { ...EMPTY_CUSTOMER, ...JSON.parse(localStorage.getItem(CUSTOMER_KEY) || "{}") };
  } catch {
    return EMPTY_CUSTOMER;
  }
}
export const saveCustomer = (c: Customer) => localStorage.setItem(CUSTOMER_KEY, JSON.stringify(c));

export const onlyDigits = (v: string) => v.replace(/\D/g, "");

export function maskPhone(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function maskCep(v: string) {
  const d = onlyDigits(v).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

/** Converte "100", "100,50" ou "R$ 100" em número. */
export const parseMoney = (v: string) => Number(v.replace(/[^\d,]/g, "").replace(",", ".")) || 0;

export function validateDelivery(c: Customer): Errors {
  const e: Errors = {};
  if (c.name.trim().length < 2) e.name = "Como podemos te chamar?";
  if (onlyDigits(c.phone).length < 10) e.phone = "WhatsApp com DDD";
  if (c.mode === "delivery") {
    if (!c.street.trim()) e.street = "Informe a rua";
    if (!c.number.trim()) e.number = "Nº";
    if (!c.district.trim()) e.district = "Informe o bairro";
  }
  return e;
}

export function validatePayment(p: Payment, grand: number): Errors {
  if (p.method === "cash" && p.change.trim() && parseMoney(p.change) < grand) return { change: `Precisa ser pelo menos ${brl(grand)}` };
  return {};
}

export interface Totals {
  subtotal: number;
  grand: number;
  /** A taxa de entrega da casa não é pública: é combinada no WhatsApp. */
  feePending: boolean;
}

export function computeTotals(subtotal: number, mode: Mode): Totals {
  return { subtotal, grand: subtotal, feePending: mode === "delivery" };
}

export function buildMessage(opts: {
  code: string;
  items: Record<string, number>;
  totals: Totals;
  customer: Customer;
  payment: Payment;
  scheduled: boolean;
}) {
  const { code, items, totals, customer: c, payment: p, scheduled } = opts;
  const lines = Object.entries(items).map(([id, q]) => `${q}x ${MENU_BY_ID[id].name} — ${brl(MENU_BY_ID[id].price * q)}`);
  const address =
    c.mode === "pickup"
      ? "Retirada no balcão"
      : [`${c.street}, ${c.number}${c.complement ? ` (${c.complement})` : ""}`, c.district, c.cep && `CEP ${c.cep}`, c.reference && `Ref.: ${c.reference}`]
          .filter(Boolean)
          .join(" · ");
  const pay = p.method === "cash" && p.change.trim() ? `Dinheiro (troco para ${brl(parseMoney(p.change))})` : PAY_LABEL[p.method];

  return [
    `*Pedido #${code} — ${CONFIG.fullName}*`,
    scheduled ? "_(enviado fora do horário: preparar na abertura)_" : "",
    "",
    ...lines,
    "",
    `Subtotal: ${brl(totals.subtotal)}`,
    `*Total dos itens: ${brl(totals.grand)}*`,
    c.mode === "delivery" ? "Taxa de entrega: a combinar" : "",
    "",
    `Pagamento: ${pay}`,
    p.notes.trim() ? `Obs.: ${p.notes.trim()}` : "",
    "",
    `Cliente: ${c.name.trim()} · ${c.phone}`,
    `${c.mode === "delivery" ? "Endereço" : "Modo"}: ${address}`,
  ]
    .filter((l, i, all) => l !== "" || all[i - 1] !== "")
    .join("\n");
}
