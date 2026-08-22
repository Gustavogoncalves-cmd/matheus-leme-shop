<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-slate-950 dark:to-slate-900 py-8 px-4 flex items-center justify-center">
    <div class="w-full max-w-2xl">
      <!-- Cancel Card -->
      <div class="bg-white dark:bg-slate-900 rounded-lg shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 px-6 md:px-8 py-12 md:py-16 text-center">
          <!-- Alert Icon Animation -->
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white dark:bg-slate-800 mb-6 mx-auto">
            <svg
              class="w-12 h-12 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
            Pagamento Cancelado
          </h1>
          <p class="text-orange-100">Sua transação foi interrompida</p>
        </div>

        <!-- Content -->
        <div class="px-6 md:px-8 py-8 md:py-12">
          <!-- Info Sections -->
          <div class="space-y-8">
            <!-- What Happened -->
            <div class="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
              <h2 class="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z" clip-rule="evenodd" />
                </svg>
                O que aconteceu?
              </h2>
              <p class="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                Você cancelou o pagamento durante a transação no MercadoPago. Sua compra não foi finalizada.
              </p>
            </div>

            <!-- Good News -->
            <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <h2 class="font-semibold text-green-900 dark:text-green-400 mb-3 flex items-center gap-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                Boas Notícias!
              </h2>
              <p class="text-green-800 dark:text-green-300 text-sm leading-relaxed">
                Seus itens continuam no carrinho. Você pode revisá-los e tentar novamente quando quiser.
              </p>
            </div>

            <!-- Reason Selection (Optional) -->
            <div>
              <h2 class="font-semibold text-slate-900 dark:text-white mb-3">
                Por que você cancelou?
              </h2>
              <div class="space-y-2">
                <label
                  v-for="reason in cancelReasons"
                  :key="reason"
                  class="flex items-center p-3 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  <input
                    v-model="selectedReason"
                    type="radio"
                    :value="reason"
                    class="mr-3"
                  />
                  <span class="text-slate-700 dark:text-slate-300">{{ reason }}</span>
                </label>
              </div>
            </div>

            <!-- Support -->
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h2 class="font-semibold text-blue-900 dark:text-blue-400 mb-2 flex items-center gap-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                Precisa de Ajuda?
              </h2>
              <p class="text-blue-800 dark:text-blue-300 text-sm mb-3 leading-relaxed">
                Se encontrou algum problema durante o pagamento, entre em contato com nosso suporte.
              </p>
              <a
                href="mailto:support@matheuslemeshop.com"
                class="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Envie um Email
              </a>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <router-link
              to="/cart"
              class="flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 dark:bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-700 dark:hover:bg-brand-600 transition"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 8m0 0a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              Voltar ao Carrinho
            </router-link>

            <router-link
              to="/checkout"
              class="flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Tentar Novamente
            </router-link>
          </div>

          <!-- Back to Shop -->
          <div class="mt-4 text-center">
            <router-link
              to="/"
              class="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium text-sm"
            >
              Continuar Comprando
            </router-link>
          </div>
        </div>
      </div>

      <!-- FAQ -->
      <div class="mt-8 bg-white dark:bg-slate-900 rounded-lg shadow p-6 md:p-8">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-6">
          Perguntas Frequentes
        </h2>

        <div class="space-y-4">
          <details class="group">
            <summary class="flex cursor-pointer items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 p-4 font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition">
              Meu carrinho será apagado?
              <svg class="h-5 w-5 transition group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </summary>
            <p class="px-4 pt-4 pb-4 text-slate-700 dark:text-slate-300">
              Não, seus itens continuam no carrinho. Você pode voltar e tentar novamente quando quiser.
            </p>
          </details>

          <details class="group">
            <summary class="flex cursor-pointer items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 p-4 font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition">
              Vou ser cobrado mesmo assim?
              <svg class="h-5 w-5 transition group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </summary>
            <p class="px-4 pt-4 pb-4 text-slate-700 dark:text-slate-300">
              Não, você não será cobrado. Como você cancelou antes de confirmar o pagamento, nenhuma transação foi processada.
            </p>
          </details>

          <details class="group">
            <summary class="flex cursor-pointer items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 p-4 font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition">
              Como faço para tentar novamente?
              <svg class="h-5 w-5 transition group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </summary>
            <p class="px-4 pt-4 pb-4 text-slate-700 dark:text-slate-300">
              Clique no botão "Tentar Novamente" acima ou volte ao seu carrinho. Você poderá revisar os itens e tentar fazer o checkout novamente.
            </p>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const cancelReasons = [
  'Mudei de ideia sobre a compra',
  'Preço muito alto',
  'Problemas com o pagamento',
  'Frete muito caro',
  'Encontrei outro lugar mais barato',
  'Outro',
];

const selectedReason = ref('');

const sendFeedback = async () => {
  if (selectedReason.value) {
    console.log('Cancel reason:', selectedReason.value);
    // Você pode enviar essa informação para o backend para análise
  }
};

onMounted(() => {
  sendFeedback();
});
</script>
