const img = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

export type Category = "burger" | "dog" | "porcao" | "drink" | "beer";
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
  /** Itens com tamanhos (porções, bebidas): mesmo `group`, um `size` cada. */
  group?: string;
  size?: string;
}

export const CATEGORY_LABEL: Record<Category, string> = {
  burger: "Hambúrguer",
  dog: "Hot dog",
  porcao: "Porção",
  drink: "Bebida",
  beer: "Cerveja",
};

/*
 * Cardápio e preços: cardápio online da Street Burger (Você Pede), conferido em 04/11/2026.
 * Fotos: Unsplash, ilustrativas. Trocar pelas fotos reais da casa.
 */
const P = {
  basic: img("photo-1550547660-d9450f859349"),
  classic: img("photo-1603064752734-4c48eff53d05"),
  bacon: img("photo-1550317138-10000687a72b"),
  baconTall: img("photo-1572802419224-296b0aeee0d9"),
  cheddar: img("photo-1586190848861-99aa4a171e90"),
  melty: img("photo-1565299507177-b0ac66763828"),
  dark: img("photo-1594212699903-ec8a3eca50f5"),
  pulled: img("photo-1606755962773-d324e0a13086"),
  double: img("photo-1607013251379-e6eecfffe234"),
  withFries: img("photo-1551782450-a2132b4ba21d"),
  veggie: img("photo-1520072959219-c595dc870360"),
  tall: img("photo-1568901346375-23c9450c58cd"),
  stack: img("photo-1553979459-d2229ba7433b"),
  combo: img("photo-1571091718767-18b5b1457add"),
  pair: img("photo-1561758033-d89a9ad46330"),
  redBun: img("photo-1596662951482-0c4ba74a6df6"),
  dogLoaded: img("photo-1619740455993-9e612b1af08a"),
  dogPlate: img("photo-1541214113241-21578d2d9b62"),
  dogSimple: img("photo-1599599810694-b5b37304c041"),
  dogRow: img("photo-1612392166886-ee8475b03af2"),
};

const burger = (id: string, name: string, price: number, tagline: string, ingredients: string[], photo: string, extra: Partial<MenuItem> = {}): MenuItem => ({
  id,
  cat: "burger",
  name,
  tagline,
  desc: ingredients.join(", ") + ".",
  price,
  img: photo,
  ingredients,
  meta: extra.meta ?? ["Costela"],
  ...extra,
});

const dog = (id: string, name: string, price: number, tagline: string, ingredients: string[], photo: string, extra: Partial<MenuItem> = {}): MenuItem => ({
  id,
  cat: "dog",
  name,
  tagline,
  desc: ingredients.join(", ") + ".",
  price,
  img: photo,
  ingredients,
  meta: ["Pão 25cm", "2 salsichas"],
  ...extra,
});

const BURGER_ITEMS: MenuItem[] = [
  burger("street-kids", "Street Kids", 27, "O começo de tudo, no tamanho certo.", ["Pão especial", "Hambúrguer de costela", "Queijo muçarela", "Molho da casa", "Alface"], P.basic, {
    badge: { label: "Kids", tone: "cream" },
  }),
  burger("street-basico", "Street Básico", 30, "Simples e bem feito.", ["Pão especial", "Hambúrguer de costela", "Queijo muçarela", "Molho de alho", "Tomate", "Alface"], P.classic),
  burger("street-bacon", "Street Bacon", 38, "Bacon em dobro: crocante e em fatia.", ["Pão especial", "Hambúrguer de costela", "Queijo muçarela", "BBQ (molho de churrasco)", "Bacon crocante", "Bacon", "Molho de ervas finas", "Tomate", "Alface"], P.bacon),
  burger("street-duplo-bacon", "Street Duplo Bacon", 40, "Pra quem acha que bacon nunca é demais.", ["Pão especial", "Hambúrguer de costela", "Queijo muçarela", "Duplo bacon crocante", "Molho de ervas finas", "BBQ (molho de churrasco)", "Tomate", "Alface"], P.baconTall),
  burger("street-cheddar", "Street Cheddar", 38, "Cheddar cremoso e cebola roxa.", ["Pão especial", "Hambúrguer de costela", "Bacon crocante", "Queijo cheddar cremoso", "Molho da casa", "Cebola roxa", "Tomate"], P.cheddar),
  burger("street-provolone", "Street Provolone", 40, "Provolone duplo com rúcula.", ["Pão especial", "Hambúrguer de costela", "Bacon crocante", "Duplo queijo provolone", "Molho da casa", "Tomate", "Rúcula", "Cebola roxa"], P.melty),
  burger("street-gorgonzola", "Street Gorgonzola", 40, "Gorgonzola e tomate seco.", ["Pão especial", "Hambúrguer de costela", "Bacon crocante", "Queijo gorgonzola", "Molho de ervas finas", "Tomate seco", "Rúcula", "Cebola roxa"], P.dark),
  burger("street-pig", "Street Pig", 40, "Pernil suíno com abacaxi grelhado.", ["Pão especial", "Hambúrguer de pernil suíno", "Bacon crocante", "Abacaxi grelhado", "Queijo muçarela", "Catupiry", "Molho de ervas finas", "Tomate", "Alface"], P.pulled, {
    badge: { label: "Pernil suíno", tone: "mustard" },
    meta: ["Pernil"],
  }),
  burger("street-monstro", "Street Monstro", 48, "Duas carnes. Fome que não negocia.", ["Pão especial", "2 hambúrgueres de costela", "Duplo bacon crocante", "Queijo muçarela", "Molho de ervas finas", "BBQ (molho de churrasco)", "Tomate", "Alface"], P.double, {
    badge: { label: "2 carnes", tone: "sauce" },
    meta: ["2x costela"],
  }),
  burger("street-churrasco", "Street Churrasco", 49, "Alcatra acebolada na baguete.", ["Pão baguete", "Lascas de aranha da alcatra acebolada", "Queijo muçarela", "Molho de ervas finas", "Rúcula", "Tomate"], P.withFries, {
    badge: { label: "Baguete", tone: "cream" },
    meta: ["Alcatra"],
  }),
  burger("street-vegui", "Street Vegui", 44, "Quatro queijos, zero carne.", ["Pão especial", "Molho de ervas finas", "Queijo gorgonzola", "Queijo muçarela", "Queijo prato", "Queijo provolone", "Cebola roxa", "Rúcula", "Alface", "Tomate", "Tomate seco"], P.veggie, {
    badge: { label: "Sem carne", tone: "mustard" },
    meta: ["4 queijos"],
  }),
  burger("street-linguica", "Street Linguiça", 43, "Linguiça defumada com alho-poró.", ["Pão especial", "Hambúrguer de linguiça defumada com alho-poró", "Cream cheese", "Queijo muçarela", "Molho de ervas finas", "Milho", "Alface", "Tomate"], P.tall, {
    meta: ["Linguiça"],
  }),
  burger("street-calabresa", "Street Calabresa", 33, "Costela com calabresa.", ["Pão especial", "Hambúrguer de costela", "Calabresa", "Queijo muçarela", "Molho de alho", "Tomate", "Alface"], P.stack),
  burger("street-doce-de-leite", "Street Doce de Leite", 35, "Doce e salgado na mesma mordida.", ["Pão especial", "Doce de leite", "Hambúrguer de costela", "Queijo muçarela", "Bacon"], P.combo),
  burger("street-honey", "Street Honey", 38, "Agridoce com cebola confitada.", ["Pão especial", "Hambúrguer de costela", "Duplo queijo prato", "Molho especial agridoce", "Cebola roxa confitada", "Tomate grelhado"], P.pair),
  burger("street-maracuja", "Street Maracujá", 40, "Brie, maracujá e nozes torradas.", ["Pão especial", "Molho de maracujá", "Rúcula", "Tomate", "Hambúrguer", "Queijo brie", "Bacon", "Nozes torradas"], P.redBun),
  burger("street-geleia-de-pimenta", "Street Geleia de Pimenta", 45, "Brie com geleia de damasco e pimenta.", ["Pão especial", "Molho de ervas finas", "Rúcula", "Tomate", "Hambúrguer", "Queijo brie", "Geleia de damasco com pimenta", "Bacon"], P.bacon),
];

const DOG_ITEMS: MenuItem[] = [
  dog("dog-simples", "Dog Simples", 30, "O clássico de rua.", ["Pão 25cm", "2 salsichas", "Molho vermelho", "Catchup", "Maionese", "Mostarda", "Tomate", "Batata palha"], P.dogSimple),
  dog("dog-alcatra", "Dog Alcatra", 42, "Alcatra com cebola confitada.", ["Pão 25cm", "2 salsichas", "Lascas de aranha da alcatra com cebola confitada", "Catupiry", "Molho vermelho", "Molho de ervas finas", "Catchup", "Milho", "Maionese", "Mostarda", "Batata palha"], P.dogLoaded, {
    badge: { label: "Alcatra", tone: "sauce" },
  }),
  dog("dog-coracao", "Dog Coração", 42, "Coração de frango com catupiry.", ["Pão 25cm", "2 salsichas", "Coração de frango", "Molho de ervas finas", "Catupiry", "Molho vermelho", "Catchup", "Maionese", "Mostarda", "Milho", "Batata palha"], P.dogPlate),
  dog("dog-frango", "Dog Frango", 35, "Frango desfiado e catupiry.", ["Pão 25cm", "2 salsichas", "Frango desfiado", "Molho vermelho", "Molho de ervas finas", "Catupiry", "Milho", "Catchup", "Maionese", "Mostarda", "Batata palha"], P.dogRow),
  dog("dog-calabresa", "Dog Calabresa", 35, "Calabresa com catupiry.", ["Pão 25cm", "2 salsichas", "Calabresa", "Catupiry", "Molho vermelho", "Molho de ervas finas", "Catchup", "Maionese", "Mostarda", "Batata palha"], P.dogPlate),
  dog("dog-bacon", "Dog Bacon", 35, "Bacon e molho da casa.", ["Pão 25cm", "2 salsichas", "Bacon", "Molho da casa", "Tomate", "Molho vermelho", "Catchup", "Maionese", "Mostarda", "Milho", "Batata palha"], P.dogRow),
  dog("dog-cheddar", "Dog Cheddar", 35, "Bacon e cheddar cremoso.", ["Pão 25cm", "2 salsichas", "Bacon", "Cheddar cremoso", "Molho vermelho", "Catchup", "Milho", "Maionese", "Mostarda", "Batata palha"], P.dogSimple),
];

/** Item com tamanhos: um MenuItem por tamanho, todos com o mesmo `group`. */
const sized = (cat: Category, group: string, name: string, desc: string, photo: string, sizes: [string, number][]): MenuItem[] =>
  sizes.map(([size, price]) => ({
    id: `${group}-${size}`.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, ""),
    cat,
    group,
    size,
    name: sizes.length > 1 ? `${name} ${size}` : name,
    tagline: "",
    desc,
    price,
    img: img(photo, 500),
  }));

const PORCAO_ITEMS: MenuItem[] = [
  ...sized("porcao", "fritas", "Fritas", "Batata frita", "photo-1630384060421-cb20d0e0649d", [["250g", 35], ["500g", 42], ["1kg", 58]]),
  ...sized("porcao", "rustica", "Rústica", "Batata rústica", "photo-1573080496219-bb080dd4f877", [["250g", 32], ["500g", 42], ["1kg", 58]]),
  ...sized("porcao", "aneis", "Anéis de cebola", "Anéis de cebola empanados", "photo-1639024471283-03518883512d", [["250g", 33], ["500g", 43], ["1kg", 58]]),
  ...sized("porcao", "polenta", "Polenta", "Polenta frita", "photo-1585109649139-366815a0d713", [["250g", 32], ["500g", 42], ["1kg", 58]]),
  ...sized("porcao", "frango", "Frango", "Lascas de frango", "photo-1627662168223-7df99068099a", [["250g", 25], ["500g", 37]]),
  ...sized("porcao", "alcatra", "Alcatra", "Peso cru", "photo-1529193591184-b1d58069ecdd", [["250g", 35], ["500g", 70], ["1kg", 100]]),
  ...sized("porcao", "coracao", "Coração", "Coração de frango · peso cru", "photo-1544025162-d76694265947", [["500g", 50], ["1kg", 80]]),
  ...sized("porcao", "mista", "Mista", "Alcatra acebolada, frango, coração, calabresa, pepinos, ovos de codorna e fritas", "photo-1544025162-d76694265947", [["1kg", 145], ["2kg", 185]]),
  ...sized("porcao", "chuleta", "Chuleta", "Alcatra chapeada, polenta frita com queijo, pepinos e ovos de codorna", "photo-1529193591184-b1d58069ecdd", [["", 48]]),
  ...sized("porcao", "salada", "Salada", "Frango desfiado, alface, rúcula, tomate, ovo de codorna e pepino", "photo-1512621776951-a57141f2eefd", [["", 35]]),
  ...sized("porcao", "pao-de-alho", "Pão de alho", "Pão de alho", "photo-1573080496219-bb080dd4f877", [["", 15]]),
];

const SODA = "photo-1622483767028-3f66f32aef97";
const BEER = "photo-1608270586620-248524c67de9";
const DRINK_ITEMS: MenuItem[] = [
  ...sized("drink", "coca", "Coca-Cola", "Gelada", SODA, [["Lata", 8.5], ["600ml", 10], ["1,5L", 15], ["2L", 18]]),
  ...sized("drink", "guarana", "Guaraná", "Gelado", SODA, [["Lata", 8.5], ["600ml", 10], ["1,5L", 15], ["2L", 15]]),
  ...sized("drink", "lata", "Refri lata", "Schweppes Citrus, Fanta Uva ou Tônica", SODA, [["Schweppes", 7.5], ["Fanta Uva", 7.5], ["Tônica", 7.5]]),
  ...sized("drink", "agua", "Água", "Garrafa", SODA, [["Sem gás", 5], ["Com gás", 5]]),
  ...sized("drink", "h2o", "H2O 500ml", "Garrafa 500ml", SODA, [["", 7.5]]),
  ...sized("drink", "energetico", "Energético", "Lata", SODA, [["", 13.5]]),
  ...sized("beer", "heineken", "Heineken", "Long neck, zero ou 600ml", BEER, [["Long neck", 15], ["Zero", 13], ["600ml", 18]]),
  ...sized("beer", "corona", "Corona", "Long neck", BEER, [["", 15]]),
  ...sized("beer", "budweiser", "Budweiser", "Long neck", BEER, [["", 15]]),
  ...sized("beer", "amstel", "Amstel Ultra", "Long neck", BEER, [["", 15]]),
  ...sized("beer", "original", "Original 600ml", "Garrafa 600ml", BEER, [["", 15]]),
  ...sized("beer", "smirnoff", "Smirnoff Ice", "Long neck", BEER, [["", 13]]),
];

export const MENU: MenuItem[] = [...BURGER_ITEMS, ...DOG_ITEMS, ...PORCAO_ITEMS, ...DRINK_ITEMS];

export const MENU_BY_ID: Record<string, MenuItem> = Object.fromEntries(MENU.map((i) => [i.id, i]));
/** Itens com card que vira (burgers e dogs). */
export const BURGERS = MENU.filter((i) => i.cat === "burger" || i.cat === "dog");
export const SIDES = PORCAO_ITEMS;
export const DRINKS = DRINK_ITEMS.filter((i) => i.cat === "drink");
export const BEERS = DRINK_ITEMS.filter((i) => i.cat === "beer");

/** Agrupa variações de tamanho na ordem do cardápio. */
export function groupItems(items: MenuItem[]) {
  const groups = new Map<string, MenuItem[]>();
  for (const i of items) groups.set(i.group ?? i.id, [...(groups.get(i.group ?? i.id) ?? []), i]);
  return [...groups.values()];
}

/** Destaque da home. */
export const FEATURED_ID = "street-monstro";

export const HERO_IMG = img("photo-1568901346375-23c9450c58cd", 1400);
