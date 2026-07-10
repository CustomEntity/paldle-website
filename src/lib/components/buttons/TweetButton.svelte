<script lang="ts">
    import type {Snippet} from "svelte";

    interface Props {
        title: string;
        text: string;
        width?: number;
        height?: number;
        icon?: Snippet;
        titleClass?: string;
        disabled?: boolean;
        ariaLabel?: string;
    }

    let {
        title,
        text,
        width = 112,
        height = 47,
        titleClass = "text-xl",
        disabled = false,
        icon,
        ariaLabel,
    }: Props = $props();
</script>

<a
aria-label={ariaLabel}
href={disabled ? undefined : `https://twitter.com/intent/tweet?text=${text}`}
target="_blank"
class="relative flex items-center gap-2 px-4 cursor-pointer font-mantinia group/button"
style="width: {width}px; height: {height}px;"
>
{#if icon}
    <div class="relative z-10">
        {@render icon()}
    </div>
{/if}
<span
        class="uppercase relative z-10 text-[13px] transition-colors duration-300 {disabled ? 'text-[#363636]' : 'text-[#FFFFE0]'} {titleClass}"
>
        {title}
    </span>
</a>

<style>
    a {
        position: relative;
        overflow: hidden;
    }

    a::before {
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

    a::after {
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

    a:hover::before {
        opacity: 0;
    }

    a:hover::after {
        opacity: 1;
    }

    a:not([href])::before,
    a:not([href])::after {
        background-image: linear-gradient(90deg,
        rgba(251, 228, 177, 0) 0%,
        rgba(250, 227, 176, 0.44) 51.5%,
        rgba(149, 135, 105, 0) 100%
        );
    }
</style>