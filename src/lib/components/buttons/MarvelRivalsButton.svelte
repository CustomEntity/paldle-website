<!-- Stardew wood button (keeps the old API so every call site restyles at once) -->
<script lang="ts">
    import type {Snippet} from "svelte";

    interface Props {
        onClick: () => void;
        title?: string;
        ariaLabel?: string;
        width?: string;
        height?: string;
        icon?: Snippet;
        class?: string;
        disabled?: boolean;
        slant?: string; // legacy prop, ignored
    }

    let {
        onClick,
        title = 'BUTTON',
        ariaLabel,
        width,
        height,
        icon,
        class: clazz = '',
        disabled = false,
    }: Props = $props();

    function handleClick(event: MouseEvent) {
        if (disabled) { event.preventDefault(); return; }
        onClick();
    }
</script>

<button
        aria-label={ariaLabel ?? title}
        onclick={handleClick}
        {disabled}
        style="{width ? `width:${width};` : ''}{height ? `height:${height};` : ''}"
        class="sv-btn {clazz} {disabled ? 'is-disabled' : ''}"
>
    <span class="lbl">
        <span class="uppercase whitespace-nowrap">{title}</span>
        {#if icon}{@render icon()}{/if}
    </span>
</button>

<style>
    .lbl {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        width: 100%;
        height: 100%;
        font-size: 15px;
        letter-spacing: 0.3px;
    }
</style>
