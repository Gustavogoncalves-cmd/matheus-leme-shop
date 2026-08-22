# 🎨 Sites de Inspiração para Design

## E-commerce Bonitos (Referência Visual)

### **Lojas que Usam Design Moderno + Tailwind/DaisyUI Style**

1. **[Shopify Themes - Free Store Examples](https://www.shopify.com/themes)**
   - Filtrar por "modern", "clean", "minimalist"
   - Copiar ideia de layouts (hero, product grid, footer)

2. **[UI8 - E-commerce Templates](https://ui8.net/category/ecommerce)**
   - Designs profissionais (alguns free)
   - Ver estrutura: navbar, hero, produtos, footer

3. **[Dribbble - E-commerce Designs](https://dribbble.com/search/ecommerce)**
   - Filtrar "clean design", "modern"
   - Pegar inspiração de cores, espaçamento, tipografia

4. **[Behance - E-commerce Projects](https://www.behance.net/search/projects?search=ecommerce%20design)**
   - Case studies reais
   - Ver fluxo de design

5. **[Framer - Template Showcase](https://www.framer.com/templates/)**
   - Ver animações suaves
   - Interações modernas

## Sites Específicos com Design Incrível

| Site | Por quê | Copiar |
|------|--------|--------|
| [Apple.com](https://apple.com) | Hero seções, tipografia | Layout hero, spacing |
| [Nike.com](https://nike.com) | Animações, produtos | Product showcase |
| [Awwwwads.com](https://awwwwads.com) | Ads bonitos atualizados | Design trends |
| [Lapa.ninja](https://lapa.ninja/) | Landing pages modernas | Estrutura completa |
| [Siteinspire.com](https://www.siteinspire.com/) | Galeria de sites bonitos | Buscar "e-commerce" |

## Inspiração Pronta (GitHub)

### **Usar Esses Diretamente**

- **[bbulakh/tailwind-ecommerce](https://github.com/bbulakh/tailwind-ecommerce)**
  - Layouts prontos em Tailwind
  - Copy/paste direto pro seu projeto

- **[Fatma-Tawfeek/ecommerce-vue](https://github.com/Fatma-Tawfeek/ecommerce-vue)**
  - Vue 3 + Tailwind
  - Estrutura de componentes

- **[DaisyUI Store](https://daisyui.com/store/)**
  - Templates prontos com DaisyUI
  - Usa componentes que você instalou

## 🎯 Estratégia: Copiar Prompt Visual

### **Como Funciona**

1. **Ache um site/design que você gosta**
2. **Descreva visualmente:**
   ```
   "Quero um hero section como o Nike com:
   - Background gradiente azul→roxo
   - Imagem grande do produto à direita
   - Título branco, bold
   - Botão com hover efeito
   - Animação fade-in ao carregar"
   ```
3. **Passe o prompt pra mim**
4. **Eu implemento com DaisyUI + Tailwind + Animações**

### **Exemplos de Prompts Que Funcionam Bem**

```
"Hero section estilo Shopify:
- Gradient background (brand colors)
- Produto em destaque com shadow
- CTA button com hover scale effect
- Responsivo mobile/desktop"
```

```
"Product Grid como Apple:
- 3 colunas desktop, 1 mobile
- Cards com rounded corners
- Hover: scale + shadow
- Animação stagger ao aparecer"
```

```
"Header/Navbar estilo Nike:
- Logo à esquerda
- Menu links centro
- Dark mode toggle direita
- Sticky no scroll
- Hover effects suaves"
```

## 📸 Como Tirar Screenshot pro Prompt

1. Abra Chrome DevTools (F12)
2. Tire print do elemento que quer copiar
3. Cole no Obsidian/documento
4. Descreva: cores, fontes, espaçamento, animações

## ✨ Componentes DaisyUI Prontos (Use Esses)

```vue
<!-- Botão Bonito -->
<button class="btn btn-primary btn-lg hover:scale-105 transition-all">Comprar</button>

<!-- Card com Sombra -->
<div class="card bg-base-100 shadow-xl hover:shadow-2xl">
  <figure><img src="produto.jpg" alt="Produto" /></figure>
  <div class="card-body">
    <h2 class="card-title">Produto</h2>
    <p>Descrição</p>
    <div class="card-actions justify-end">
      <button class="btn btn-primary">Adicionar</button>
    </div>
  </div>
</div>

<!-- Navbar Bonita -->
<div class="navbar bg-base-100 shadow-lg sticky top-0 z-50">
  <div class="flex-1">
    <a class="btn btn-ghost text-xl">Logo</a>
  </div>
  <div class="flex-none gap-2">
    <ul class="menu menu-horizontal">
      <li><a>Home</a></li>
      <li><a>Produtos</a></li>
      <li><a>Contato</a></li>
    </ul>
  </div>
</div>

<!-- Animação de Entrada -->
<div class="animate__animated animate__fadeInUp">
  Conteúdo que entra com transição
</div>
```

---

## 🚀 Próximas Steps

1. **Escolha um site que você gosta** (Apple, Nike, Shopify, etc)
2. **Descreva o design** (cores, layout, animações)
3. **Passe o prompt:** "Quero um [componente] estilo [site]..."
4. **Eu implemento com DaisyUI**

**Exemplo real:**
> "Quero um Hero section estilo Apple com:
> - Gradiente fundo (roxo → azul)
> - Produto à direita com imagem grande
> - Titulo branco, bold 40px
> - Botão com efeito hover scale
> - Tudo responsivo
> - Animação fade-in ao carregar"

👉 **PASSE ESSE TIPO DE PROMPT PRA MIM E EU FAÇO!**
