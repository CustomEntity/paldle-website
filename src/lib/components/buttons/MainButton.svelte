<script lang="ts">
    import {onMount} from 'svelte';
    import {goto} from "$app/navigation";

    interface Props {
        href: string;
        title: string;
        subtitle: string;
        soon?: boolean;
        class?: string;
    }

    let {
        href = '',
        title = 'CLASSIC',
        subtitle = 'GUESS THE SKIN FROM A VIDEO',
        class: className = 'w-[433px] h-[128px]',
        soon = false
    }: Props = $props();

    let isHovered = $state(false);
    let buttonElement: HTMLAnchorElement;

    function handleMouseEnter() {
        if (soon) return;
        isHovered = true;
    }

    function handleMouseLeave() {
        if (soon) return;
        isHovered = false;
    }

    function handleClick(event: MouseEvent) {
        if (!soon) {
            event.preventDefault();
            goto(href, {replaceState: false});
        }
    }
</script>

<a
{href}
class="flex justify-center relative block cursor-pointer transition-transform duration-200 text-center overflow-visible no-underline button-container {className}"
class:hover:scale-95={!soon}
onmouseenter={handleMouseEnter}
onmouseleave={handleMouseLeave}
onclick={handleClick}
bind:this={buttonElement}
data-sveltekit-preload="hover"
>
<svg class="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 219 109" fill="none">
    <defs>
        <clipPath id="cardClip" clipPathUnits="objectBoundingBox">
            <path d="M 0.991 0.01 L 0.952 0.983 L 0.009 0.983 L 0.051 0.017 Z" />
        </clipPath>
    </defs>
    <path d="M216.931 1.08582C217.155 1.08582 217.369 1.1802 217.521 1.34558C217.672 1.51084 217.747 1.73172 217.728 1.95496L208.52 107.142C208.483 107.556 208.137 107.873 207.723 107.873H2C1.77486 107.873 1.5598 107.778 1.4082 107.611C1.25676 107.445 1.18216 107.222 1.20312 106.998L11.0469 1.8114C11.0854 1.40025 11.4308 1.08582 11.8438 1.08582H216.931Z" fill="#D9D9D9" stroke="black" stroke-width="1.6" stroke-linejoin="round"/>
</svg>

<!-- Fond en haut avec clip-path seulement sur lui -->
<div class="absolute top-0 left-0 right-0 h-4 bg-gray-600 z-[5]" style="clip-path: url(#cardClip);"></div>

<div class="relative z-10">
    <slot></slot>
</div>
</a>