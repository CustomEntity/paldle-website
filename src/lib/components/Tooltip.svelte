<script lang="ts">
    import type {Snippet} from "svelte";
    import {fly} from 'svelte/transition';

    type Position = 'top' | 'bottom' | 'left' | 'right';

    let isVisible = $state(false);

    interface Props {
        text: string;
        children: Snippet;
        tooltipContainerClass?: string;
        maxWidth?: number;
        position?: Position;
    }

    const {text, children, tooltipContainerClass, maxWidth, position = 'bottom'}: Props = $props();

    const positions = {
        top: {
            tooltip: 'bottom-full left-1/2 mb-2',
            base: '-translate-x-1/2 -translate-y-1',
            visible: '-translate-x-1/2 translate-y-0'
        },
        bottom: {
            tooltip: 'top-full left-1/2 mt-2',
            base: '-translate-x-1/2 translate-y-1',
            visible: '-translate-x-1/2 translate-y-0'
        },
        left: {
            tooltip: 'right-full top-1/2 mr-2',
            base: '-translate-y-1/2 -translate-x-1',
            visible: '-translate-y-1/2 translate-x-0'
        },
        right: {
            tooltip: 'left-full top-1/2 ml-2',
            base: '-translate-y-1/2 translate-x-1',
            visible: '-translate-y-1/2 translate-x-0'
        }
    };
</script>

<div
        class="relative inline-block"
        onmouseenter={() => isVisible = true}
        onmouseleave={() => isVisible = false}
>
    {@render children?.()}
    {#key isVisible}
        <div
                in:fly={{y: -10, duration: 200}}
                class="absolute {positions[position].tooltip} px-3 py-2
                border-2 rounded-sm
                    border-white
                    bg-[#0b1224]/75
                   text-white font-poppins text-base italic font-medium leading-6
                   z-50 {maxWidth ? 'whitespace-normal' : 'whitespace-nowrap'}
                   pointer-events-none opacity-0 {positions[position].base}
                   transition-all duration-200 ease-out text-center
                   {isVisible ? 'opacity-100 ' + positions[position].visible : ''}
                   {tooltipContainerClass}"
                style="
 {maxWidth ? `max-width: ${maxWidth}px; width: max-content;` : ''}"
        >
            {text}
        </div>
    {/key}
</div>