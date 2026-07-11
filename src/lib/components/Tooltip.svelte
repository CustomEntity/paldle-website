<script lang="ts">
    import type {Snippet} from "svelte";
    import {fade} from 'svelte/transition';

    type Position = 'top' | 'bottom' | 'left' | 'right';

    interface Props {
        text: string;
        children: Snippet;
        tooltipContainerClass?: string;
        maxWidth?: number;
        position?: Position;
    }

    const {text, children, tooltipContainerClass, maxWidth, position = 'bottom'}: Props = $props();

    let isVisible = $state(false);
    let triggerEl: HTMLElement | undefined = $state();
    let coords = $state({x: 0, y: 0});

    // Anchor the fixed tooltip to the trigger's viewport rect. Rendered in <body> (see portal)
    // so no transformed/overflowing ancestor (e.g. the flipped grid cells) can clip or restack it.
    function computeCoords() {
        if (!triggerEl) return;
        const r = triggerEl.getBoundingClientRect();
        const gap = 8;
        if (position === 'top') coords = {x: r.left + r.width / 2, y: r.top - gap};
        else if (position === 'bottom') coords = {x: r.left + r.width / 2, y: r.bottom + gap};
        else if (position === 'left') coords = {x: r.left - gap, y: r.top + r.height / 2};
        else coords = {x: r.right + gap, y: r.top + r.height / 2};
    }
    const show = () => { computeCoords(); isVisible = true; };
    const hide = () => { isVisible = false; };

    const anchor: Record<Position, string> = {
        top: 'translate(-50%, -100%)',
        bottom: 'translate(-50%, 0)',
        left: 'translate(-100%, -50%)',
        right: 'translate(0, -50%)'
    };

    // move the tooltip node to <body> so it escapes every overflow/stacking/transform ancestor
    function portal(node: HTMLElement) {
        document.body.appendChild(node);
        return { destroy() { node.remove(); } };
    }
</script>

<span
        bind:this={triggerEl}
        class="inline-flex"
        onmouseenter={show}
        onmouseleave={hide}
        onfocusin={show}
        onfocusout={hide}
>
    {@render children?.()}
</span>

{#if isVisible}
    <div
            use:portal
            in:fade={{duration: 120}}
            out:fade={{duration: 100}}
            class="pal-tooltip fixed text-sm font-semibold leading-tight text-center
                   pointer-events-none z-[9999]
                   {maxWidth ? 'whitespace-normal' : 'whitespace-nowrap'} {tooltipContainerClass}"
            style="left: {coords.x}px; top: {coords.y}px; transform: {anchor[position]};
                   {maxWidth ? `max-width: ${maxWidth}px; width: max-content;` : ''}"
    >
        {text}
    </div>
{/if}
