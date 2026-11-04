const img = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

export type Category = "smash" | "artesanal" | "combo" | "side" | "drink";
export type BadgeTone = "sauce" | "mustard" | "cream";

export interface MenuItem {
  id: string;
  cat: Category;
  name: string;
  /** Frase curta que aparece na frente do card. */
  tagline: string;
  desc: string;
  price: number;
  old?: number;
  img: string;
  badge?: { label: string; tone: BadgeTone };
  ingredients?: string[];
  meta?: string[];
}

export const CATEGORY_LABEL: Record<Category, string> = {
  smash: "Smash",
  artesanal: "Artesanal",
  combo: "Combo",
  side: "Acompanhamento",
  drink: "Bebida",
};

// ⚠ Selos de escassez ("Restam 9 hoje") e avaliações devem vir de dados REAIS em produção.
export const MENU: MenuItem[] = [
  {
    id: "smash-classico",
    cat: "smash",
    name: "Smash Clássico",
    tagline: "O começo de tudo.",
    desc: "Um smash fino e crocante nas bordas, cheddar derretendo por cima e o molho da casa.",
    price: 29.9,
    img: img("photo-1550547660-d9450f859349"),
    badge: { label: "Mais vendido", tone: "mustard" },
    ingredients: ["Smash 90g de blend angus", "Cheddar inglês", "Cebola tostada na chapa", "Picles da casa", "Molho Brasa", "Brioche selado na manteiga"],
    meta: ["90g", "610 kcal"],
  },
  {
    id: "smash-duplo",
    cat: "smash",
    name: "Smash Duplo",
    tagline: "Dobro de crosta, dobro de queijo.",
    desc: "Dois smash prensados a 250°C, duplo cheddar e bacon crocante. O favorito da casa.",
    price: 38.9,
    img: img("photo-1568901346375-23c9450c58cd"),
    badge: { label: "Top 1", tone: "sauce" },
    ingredients: ["2 smash 90g de blend angus", "Duplo cheddar inglês", "Bacon crocante", "Picles da casa", "Molho Brasa", "Brioche selado na manteiga"],
    meta: ["180g", "890 kcal"],
  },
  {
    id: "smash-triplo",
    cat: "smash",
    name: "Triplo Monstro",
    tagline: "Pra fome que não negocia.",
    desc: "Três camadas de smash, triplo cheddar, bacon e cebola crispy. Não é pra qualquer um.",
    price: 46.9,
    img: img("photo-1553979459-d2229ba7433b"),
    badge: { label: "Restam 9 hoje", tone: "cream" },
    ingredients: ["3 smash 90g de blend angus", "Triplo cheddar", "Bacon crocante", "Cebola crispy", "Molho Brasa", "Brioche selado na manteiga"],
    meta: ["270g", "1.180 kcal"],
  },
  {
    id: "brasa-bacon",
    cat: "artesanal",
    name: "Brasa Bacon",
    tagline: "Defumado, doce e salgado.",
    desc: "Blend alto de 180g, bacon caramelizado no maple e maionese defumada na lenha.",
    price: 42.9,
    img: img("photo-1572802419224-296b0aeee0d9"),
    badge: { label: "Receita da casa", tone: "mustard" },
    ingredients: ["Blend angus 180g", "Bacon caramelizado no maple", "Queijo prato", "Maionese defumada", "Alface americana", "Brioche da casa"],
    meta: ["180g", "940 kcal"],
  },
  {
    id: "cheddar-melt",
    cat: "artesanal",
    name: "Cheddar Melt",
    tagline: "Queijo escorrendo, sem dó.",
    desc: "Blend de 180g coberto com cheddar cremoso e cebola crispy pra dar textura.",
    price: 41.9,
    img: img("photo-1586190848861-99aa4a171e90"),
    badge: { label: "Novo", tone: "cream" },
    ingredients: ["Blend angus 180g", "Cheddar cremoso da casa", "Cebola crispy", "Picles", "Brioche da casa"],
    meta: ["180g", "920 kcal"],
  },
  {
    id: "diablo",
    cat: "artesanal",
    name: "Diablo",
    tagline: "Arde do jeito certo.",
    desc: "Pepper jack, jalapeño fresco e molho chipotle. Picante, mas com sabor.",
    price: 43.9,
    img: img("photo-1594212699903-ec8a3eca50f5"),
    badge: { label: "Picante", tone: "sauce" },
    ingredients: ["Blend angus 180g", "Queijo pepper jack", "Jalapeño fresco", "Molho chipotle", "Cebola roxa", "Brioche da casa"],
    meta: ["180g", "880 kcal"],
  },
  {
    id: "combo-dia",
    cat: "combo",
    name: "Combo do Dia",
    tagline: "Smash Duplo + fritas + refri.",
    desc: "O Smash Duplo com fritas rústicas de páprica e refri lata. Preço válido só hoje.",
    price: 44.9,
    old: 59.9,
    img: img("photo-1571091718767-18b5b1457add"),
    badge: { label: "-25% hoje", tone: "sauce" },
    ingredients: ["Smash Duplo", "Fritas rústicas M", "Refri lata 350ml"],
    meta: ["Serve 1"],
  },
  {
    id: "combo-casal",
    cat: "combo",
    name: "Combo Casal",
    tagline: "Pra dividir. Ou não.",
    desc: "Dois Smash Duplo, fritas grandes e dois refris. Já sai com frete grátis.",
    price: 99.9,
    old: 119.6,
    img: img("photo-1561758033-d89a9ad46330"),
    badge: { label: "Frete grátis", tone: "mustard" },
    ingredients: ["2 Smash Duplo", "Fritas rústicas G", "2 refri lata 350ml"],
    meta: ["Serve 2"],
  },
  { id: "fritas", cat: "side", name: "Fritas rústicas", tagline: "", desc: "Com casca, páprica defumada e maionese da casa", price: 18.9, img: img("photo-1573080496219-bb080dd4f877", 500) },
  { id: "fritas-cb", cat: "side", name: "Fritas cheddar & bacon", tagline: "", desc: "Cheddar cremoso e farofa de bacon", price: 27.9, img: img("photo-1585109649139-366815a0d713", 500) },
  { id: "onion", cat: "side", name: "Onion rings", tagline: "", desc: "Empanados na cerveja, com barbecue", price: 21.9, img: img("photo-1639024471283-03518883512d", 500) },
  { id: "shake", cat: "drink", name: "Milkshake Ovomaltine", tagline: "", desc: "500ml, sorvete artesanal de baunilha", price: 22.9, img: img("photo-1572490122747-3968b75cc699", 500) },
  { id: "limonada", cat: "drink", name: "Limonada suíça", tagline: "", desc: "500ml, batida na hora", price: 12.9, img: img("photo-1621263764928-df1444c5e859", 500) },
  { id: "refri", cat: "drink", name: "Refri lata", tagline: "", desc: "Coca-Cola, Guaraná ou Sprite — 350ml", price: 7.9, img: img("photo-1622483767028-3f66f32aef97", 500) },
];

export const MENU_BY_ID: Record<string, MenuItem> = Object.fromEntries(MENU.map((i) => [i.id, i]));
export const BURGERS = MENU.filter((i) => i.cat === "smash" || i.cat === "artesanal" || i.cat === "combo");
export const SIDES = MENU.filter((i) => i.cat === "side");
export const DRINKS = MENU.filter((i) => i.cat === "drink");

export const HERO_IMG = img("photo-1568901346375-23c9450c58cd", 1400);
