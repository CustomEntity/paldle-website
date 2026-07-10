<script lang="ts">
    import { browser } from '$app/environment';

    let isVisible = $state(false);

    // Check localStorage on mount
    $effect(() => {
        if (browser) {
            const dismissed = localStorage.getItem('translation-apology-dismissed');
            isVisible = !dismissed;
        }
    });

    function closeBanner() {
        isVisible = false;
        if (browser) {
            localStorage.setItem('translation-apology-dismissed', 'true');
        }
    }
</script>

{#if isVisible}
    <div class="w-full fixed top-0 left-0 right-0 z-[9999]">
        <div class="relative overflow-hidden bg-gradient-to-r from-blue-600/95 to-blue-500/90 px-4 py-3 shadow-lg">
            <!-- Animated background -->
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>

            <!-- Content -->
            <div class="relative z-10 flex items-center justify-between max-w-7xl mx-auto">
                <div class="flex items-center justify-center gap-2 md:gap-3 flex-1 pr-2">
                    <!-- Info icon -->
                    <div class="flex-shrink-0">
                        <svg class="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                        </svg>
                    </div>

                    <!-- Message -->
                    <p class="text-xs md:text-sm text-white leading-relaxed text-center md:text-left">
                        <span class="font-semibold">Apologies for the site translations!</span>
                        We didn't expect such enthusiasm at release. We're fixing this as quickly as possible. Thank you for your support!
                    </p>
                </div>

                <!-- Close button -->
                <button
                    onclick={closeBanner}
                    class="flex-shrink-0 p-1.5 hover:bg-white/20 rounded-lg transition-all duration-200 group"
                    aria-label="Close banner"
                >
                    <svg class="w-4 h-4 md:w-5 md:h-5 text-white/90 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    @keyframes shimmer {
        0% {
            transform: translateX(-100%);
        }
        100% {
            transform: translateX(100%);
        }
    }

    .animate-shimmer {
        animation: shimmer 5s ease-in-out infinite;
    }
</style>
