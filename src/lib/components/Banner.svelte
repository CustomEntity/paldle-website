<script lang="ts">
    import locale from "$lib/stores/locale.svelte";

    let { class: className = "" } = $props();
    let isVisible = $state(true);

    function closeBanner() {
        isVisible = false;
    }
</script>

{#if isVisible}
    <div class="w-full {className}">
        <div class="relative overflow-hidden bg-gradient-to-r from-[#F2BC1B]/90 to-[#F2BC1B]/70 px-4 py-2 md:py-3">
            <!-- Animated background -->
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>

            <!-- Content -->
            <div class="relative z-10 flex items-center justify-between">
                <div class="flex items-center justify-center gap-2 md:gap-4 flex-1">
                    <!-- Medal.tv mini logo -->
                    <div class="flex-shrink-0">
                        <div class="flex h-5 w-10 items-center justify-center rounded border border-black/20 bg-black/10 md:h-6 md:w-12">
                            <div class="relative mx-1">
                                <img src="/medal-logo.png" alt="Medal.tv" class="absolute scale-75 md:scale-100"
                                     style="clip-path: inset(0px 70% 0px 0px);">
                                <img src="/medal-logo.png" alt="Medal.tv" class="invert scale-75 md:scale-100"
                                     style="clip-path: inset(0px 0px 0px 30%);">
                            </div>
                        </div>
                    </div>

                    <!-- Message -->
                    <span class="font-refrigerator-deluxe text-xs md:text-sm font-bold text-black">
                    Post your clips with
                    <span class="font-mono bg-black/20 px-1 rounded">#rivalsdle</span>
                    + rank to get featured!
                </span>

                    <!-- CTA -->
                    <a
                            href="https://medal.tv"
                            target="_blank"
                            class="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 md:px-3 md:py-1.5 bg-black/80 hover:bg-black text-white text-xs md:text-sm font-bold rounded transition-all duration-200 transform hover:scale-105"
                    >
                        <span>Post</span>
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                    </a>
                </div>

                <!-- Close button -->
                <button
                        onclick={closeBanner}
                        class="flex-shrink-0 ml-2 p-1 hover:bg-black/20 rounded transition-colors duration-200 group"
                        aria-label="Close banner"
                >
                    <svg class="w-4 h-4 text-black/70 group-hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
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
        animation: shimmer 4s ease-in-out infinite;
        background: linear-gradient(
                90deg,
                transparent,
                rgba(255, 255, 255, 0.2),
                transparent
        );
        background-size: 200% 100%;
    }
</style>