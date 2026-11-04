# Brasa & Blend — site de hamburgueria

Site de uma hamburgueria artesanal (smash burger) com landing page animada e página de pedido completa, finalizando pelo WhatsApp.

**No ar:** https://hamburgueria-sigma-two.vercel.app

## Destaques

- **Landing animada** — títulos com máscara, parallax, contador regressivo do combo do dia, marquee, números que contam ao rolar e o "queijo escorrendo" no título (filtro SVG gooey + pingos em CSS).
- **Vitrine curva** — faixa de fotos girando num cilindro em perspectiva, desenhada em `<canvas>` coluna por coluna (sem emendas entre camadas 3D, em qualquer GPU).
- **Cards que viram** — cada burger mostra a foto na frente e os ingredientes no verso, com brilho holográfico que segue o mouse.
- **Página de pedido em etapas** — escolha → entrega (com busca de endereço pelo CEP) → pagamento → revisão → mensagem pronta no WhatsApp.
- **Sacola** com frete grátis progressivo, sugestão de acompanhamento, cupom de desconto e animação do item voando até o carrinho.
- **Responsivo** do celular de 320px ao monitor ultrawide, com menu de tela cheia no celular.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Motion · React Router · lucide-react · estrutura de componentes no padrão shadcn (`src/components/ui`).

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # checagem de tipos + build de produção em dist/
```

## Configuração

Número do WhatsApp, frete grátis, taxa de entrega, cupom e horário de funcionamento ficam em [`src/lib/utils.ts`](src/lib/utils.ts) (`CONFIG`). O cardápio, preços e fotos ficam em [`src/data/menu.ts`](src/data/menu.ts).

> Os dados atuais (telefone, endereço, avaliações e números de vendas) são **exemplos** e devem ser trocados pelos reais.

## Créditos

- Fotos: [Unsplash](https://unsplash.com).
- `HoloFlipCard` adaptado do componente "Holographic Business Card" de Aakash Mehra.
- `TiltedGridHero` baseado no componente "Tilted Grid Hero", reescrito em canvas.
