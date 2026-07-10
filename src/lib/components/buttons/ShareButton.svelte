<script lang="ts">
    import type {Snippet} from "svelte";

    interface Props {
        title: string;
        onClick?: (event: MouseEvent) => void;
        disabled?: boolean;
        icon?: Snippet;
        titleClass?: string;
        width?: number;
        height?: number;
        ariaLabel?: string;
    }

    let {
        title,
        onClick,
        disabled = false,
        icon,
        titleClass = "text-xl",
        width = 112,
        height = 47,
        ariaLabel,
    }: Props = $props();

    function handleClick(event: MouseEvent) {
        if (!disabled && onClick) {
            onClick(event);
        }
    }
</script>
<button
        aria-label={ariaLabel}
        onclick={handleClick}
        {disabled}
        class="relative flex items-center gap-2 px-4 cursor-pointer font-mantinia group/button"
        style="width: {width}px; height: {height}px;"
>
    {#if icon}
        <div class="relative z-10">
            {@render icon()}
        </div>
    {/if}
    <span
            class="uppercase relative z-10 transition-colors duration-300 {disabled ? 'text-[#363636]' : 'text-[#FFFFE0]'} {titleClass}"
    >
        {title}
    </span>
</button>

<style>
    button {
        position: relative;
        overflow: hidden;
    }

    button::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: linear-gradient(90deg,
        rgba(251, 228, 177, 0) 0%,
        rgba(250, 227, 176, 0.44) 51.5%,
        rgba(149, 135, 105, 0) 100%
        );
        transition: opacity 0.3s ease-out;
        opacity: 1;
    }

    button::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: linear-gradient(90deg,
        rgba(251, 228, 177, 0) 0%,
        rgba(250, 227, 176, 0.7) 51.5%,
        rgba(149, 135, 105, 0) 100%
        );
        transition: opacity 0.3s ease-out;
        opacity: 0;
    }

    button:hover::before {
        opacity: 0;
    }

    button:hover::after {
        opacity: 1;
    }

    button:disabled::before,
    button:disabled::after {
        background-image: linear-gradient(90deg,
        rgba(251, 228, 177, 0) 0%,
        rgba(250, 227, 176, 0.44) 51.5%,
        rgba(149, 135, 105, 0) 100%
        );
    }
</style>