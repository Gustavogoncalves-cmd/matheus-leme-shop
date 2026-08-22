# 📦 Componentes DaisyUI Prontos (Copy & Paste)

## 1. NAVBAR/HEADER Bonita

```vue
<script setup>
import { Menu, X, Moon, Sun } from 'lucide-vue-next'
import { ref } from 'vue'

const isOpen = ref(false)
const isDark = ref(false)
</script>

<template>
  <nav class="navbar bg-base-100 shadow-lg sticky top-0 z-50 animate__animated animate__slideInDown">
    <div class="flex-1">
      <a class="btn btn-ghost text-xl font-bold">Matheus Shop</a>
    </div>

    <div class="flex-none gap-2 hidden md:flex">
      <ul class="menu menu-horizontal px-1">
        <li><a href="/" class="hover:text-primary transition-colors">Home</a></li>
        <li><a href="/produtos" class="hover:text-primary transition-colors">Produtos</a></li>
        <li><a href="/contato" class="hover:text-primary transition-colors">Contato</a></li>
      </ul>
    </div>

    <div class="flex-none gap-2">
      <button class="btn btn-circle btn-ghost" @click="isDark = !isDark">
        <Moon v-if="isDark" size="24" />
        <Sun v-else size="24" />
      </button>
      <div class="badge badge-primary gap-2">
        <span>🛒</span> Carrinho
      </div>
    </div>
  </nav>
</template>
```

---

## 2. HERO SECTION Simples

```vue
<template>
  <div class="min-h-screen bg-gradient-to-r from-primary to-secondary flex items-center justify-center px-4">
    <div class="text-center text-white space-y-6 animate__animated animate__fadeIn">
      <h1 class="text-5xl md:text-7xl font-bold leading-tight">
        Bem-vindo ao <span class="text-accent">Matheus Shop</span>
      </h1>
      <p class="text-xl text-gray-200 max-w-2xl mx-auto">
        Descubra os melhores produtos com qualidade e estilo
      </p>
      <div class="flex flex-col md:flex-row gap-4 justify-center pt-8">
        <button class="btn btn-lg btn-accent gap-2">
          Explorar Produtos
        </button>
        <button class="btn btn-lg btn-outline text-white">
          Saber Mais
        </button>
      </div>
    </div>
  </div>
</template>
```

---

## 3. PRODUCT CARD Minimalista

```vue
<template>
  <div class="card bg-base-100 shadow-md hover:shadow-xl transition-all group">
    <figure class="h-64 overflow-hidden bg-gray-200">
      <img
        src="https://via.placeholder.com/300x300"
        alt="Produto"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform"
      />
    </figure>
    <div class="card-body">
      <h2 class="card-title text-lg">Nome do Produto</h2>
      <p class="text-sm text-gray-600">Descrição do produto aqui</p>
      <div class="flex justify-between items-center mt-4">
        <span class="text-2xl font-bold text-primary">R$ 99,90</span>
        <button class="btn btn-sm btn-primary">Comprar</button>
      </div>
    </div>
  </div>
</template>
```

---

## 4. GRID DE PRODUTOS (3 Colunas)

```vue
<template>
  <div class="container mx-auto px-4 py-12">
    <h2 class="text-4xl font-bold mb-12 text-center">Nossos Produtos</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Repita o ProductCard para cada produto -->
      <div class="card bg-base-100 shadow-md hover:shadow-xl transition-all">
        <figure class="h-64 bg-gray-200"></figure>
        <div class="card-body">
          <h2 class="card-title">Produto 1</h2>
          <p class="text-sm text-gray-600">Descrição</p>
          <div class="card-actions justify-between mt-4">
            <span class="text-xl font-bold">R$ 99,90</span>
            <button class="btn btn-sm btn-primary">Comprar</button>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 shadow-md hover:shadow-xl transition-all">
        <figure class="h-64 bg-gray-200"></figure>
        <div class="card-body">
          <h2 class="card-title">Produto 2</h2>
          <p class="text-sm text-gray-600">Descrição</p>
          <div class="card-actions justify-between mt-4">
            <span class="text-xl font-bold">R$ 149,90</span>
            <button class="btn btn-sm btn-primary">Comprar</button>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 shadow-md hover:shadow-xl transition-all">
        <figure class="h-64 bg-gray-200"></figure>
        <div class="card-body">
          <h2 class="card-title">Produto 3</h2>
          <p class="text-sm text-gray-600">Descrição</p>
          <div class="card-actions justify-between mt-4">
            <span class="text-xl font-bold">R$ 199,90</span>
            <button class="btn btn-sm btn-primary">Comprar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

---

## 5. FOOTER Moderno

```vue
<template>
  <footer class="bg-base-200 text-base-content py-12">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <!-- Company Info -->
        <div>
          <h3 class="text-xl font-bold mb-4">Matheus Shop</h3>
          <p class="text-sm text-gray-600">Produtos de qualidade com melhor preço</p>
          <div class="flex gap-4 mt-4">
            <a href="#" class="link link-hover">📘 Facebook</a>
            <a href="#" class="link link-hover">📱 Instagram</a>
          </div>
        </div>

        <!-- Links -->
        <div>
          <h4 class="font-bold mb-4">Produtos</h4>
          <ul class="space-y-2">
            <li><a href="#" class="link link-hover text-sm">Todas as Categorias</a></li>
            <li><a href="#" class="link link-hover text-sm">Promoções</a></li>
            <li><a href="#" class="link link-hover text-sm">Novidades</a></li>
          </ul>
        </div>

        <!-- Suporte -->
        <div>
          <h4 class="font-bold mb-4">Suporte</h4>
          <ul class="space-y-2">
            <li><a href="#" class="link link-hover text-sm">Fale Conosco</a></li>
            <li><a href="#" class="link link-hover text-sm">FAQ</a></li>
            <li><a href="#" class="link link-hover text-sm">Devoluções</a></li>
          </ul>
        </div>

        <!-- Newsletter -->
        <div>
          <h4 class="font-bold mb-4">Newsletter</h4>
          <div class="form-control">
            <input
              type="email"
              placeholder="seu@email.com"
              class="input input-bordered input-sm"
            />
            <button class="btn btn-primary btn-sm mt-2">Inscrever</button>
          </div>
        </div>
      </div>

      <div class="divider"></div>
      <div class="text-center text-sm text-gray-600">
        © 2025 Matheus Shop. Todos os direitos reservados.
      </div>
    </div>
  </footer>
</template>
```

---

## 6. BOTÕES COM EFEITOS

```vue
<!-- Botão Primário -->
<button class="btn btn-primary hover:scale-105 transition-transform">
  Clique Aqui
</button>

<!-- Botão Outline -->
<button class="btn btn-outline hover:bg-primary">
  Outline
</button>

<!-- Botão com Ícone -->
<button class="btn btn-primary gap-2">
  <ShoppingCart size="20" />
  Adicionar
</button>

<!-- Botão Desabilitado -->
<button class="btn btn-primary" disabled>
  Desabilitado
</button>

<!-- Botão Loading -->
<button class="btn btn-primary loading">
  Carregando...
</button>

<!-- Botão com Badge -->
<button class="btn gap-2">
  Carrinho
  <span class="badge badge-error">3</span>
</button>
```

---

## 7. ALERT/NOTIFICAÇÃO

```vue
<!-- Alerta de Sucesso -->
<div class="alert alert-success">
  <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  <span>Produto adicionado ao carrinho com sucesso!</span>
</div>

<!-- Alerta de Erro -->
<div class="alert alert-error">
  <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2" /></svg>
  <span>Erro ao adicionar produto. Tente novamente.</span>
</div>

<!-- Alerta de Aviso -->
<div class="alert alert-warning">
  <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 6v2M12 3a9 9 0 110 18 9 9 0 010-18z" /></svg>
  <span>Apenas alguns produtos em estoque!</span>
</div>

<!-- Alerta Info -->
<div class="alert alert-info">
  <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></path></svg>
  <span>Frete grátis em compras acima de R$ 100!</span>
</div>
```

---

## 8. ANIMAÇÕES (Animate.css)

```vue
<!-- Fade In -->
<div class="animate__animated animate__fadeIn">
  Conteúdo aparece suavemente
</div>

<!-- Slide In -->
<div class="animate__animated animate__slideInLeft">
  Desliza da esquerda
</div>

<!-- Bounce -->
<div class="animate__animated animate__bounce">
  Pula continuamente
</div>

<!-- Scale Up -->
<div class="animate__animated animate__scaleIn">
  Cresce ao aparecer
</div>

<!-- Customizar Delay -->
<div class="animate__animated animate__fadeIn" style="animation-delay: 0.2s">
  Aparece depois de 0.2s
</div>
```

---

## 9. MODAL/DIALOG

```vue
<script setup>
import { ref } from 'vue'
const isOpen = ref(false)
</script>

<template>
  <button class="btn btn-primary" @click="isOpen = true">
    Abrir Modal
  </button>

  <!-- Modal -->
  <div v-if="isOpen" class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Confirmar Compra?</h3>
      <p class="py-4">Tem certeza que deseja adicionar este produto ao carrinho?</p>
      <div class="modal-action">
        <button class="btn" @click="isOpen = false">Cancelar</button>
        <button class="btn btn-primary" @click="isOpen = false">Confirmar</button>
      </div>
    </div>
  </div>
</template>
```

---

## 10. SPINNER/LOADING

```vue
<!-- Spinner Padrão -->
<div class="loading loading-spinner"></div>

<!-- Spinner com Tamanho -->
<div class="loading loading-spinner loading-lg"></div>

<!-- Spinner Colorido -->
<div class="loading loading-spinner text-primary"></div>
<div class="loading loading-spinner text-secondary"></div>
<div class="loading loading-spinner text-accent"></div>

<!-- Dots -->
<div class="loading loading-dots"></div>

<!-- Ring -->
<div class="loading loading-ring"></div>

<!-- Ball -->
<div class="loading loading-ball"></div>
```

---

## Como Usar

1. Copie o código acima
2. Cole no seu componente `.vue`
3. Ajuste cores/textos conforme necessário
4. Rode `npm run dev` para ver

**Todos esses componentes já têm DaisyUI + Tailwind configurados!** ✨

---

## 🎯 Próxima Ação

Escolha um desses componentes, copie, teste no seu projeto!

Se quiser um design específico, **passe o prompt** tipo:
```
"Quero um Hero Section estilo [site], com:
- Cores [X, Y, Z]
- Título assim
- Imagem alinhada assim
- Botões com efeito tal
- Animação assim"
```

E eu faço! 🚀
