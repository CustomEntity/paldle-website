<!-- Hint.svelte -->
<script lang="ts">
    import type {Snippet} from "svelte";

    interface Props {
        id: string;
        enabled: boolean;
        active: boolean;
        text: string;
        enabledText: string;
        icon: Snippet[]
        content: Snippet;
        onClick: (id: string, active: boolean, content: Snippet) => void;
    }

    const {
        enabled = false, active = false, text = "",
        enabledText = "",
        id,
        icon,
        content,
        onClick
    }: Props = $props();

    function handleClick() {
        if (enabled) {
            onClick(id, !active, content);
        }
    }
</script>

<button
        onclick={handleClick}
        class:cursor-pointer={enabled}
        class:cursor-not-allowed={!enabled}
        class:hover:scale-110={enabled}
        class="flex flex-col items-center gap-2 transition-transform duration-200">
    <div class="w-[72px] h-[72px]">
        <div
                class="w-full h-full flex items-center justify-center">
            {@render icon?.()}
        </div>
    </div>
    <div class="h-[32px] flex items-start">
        <span class="text-white text-center font-normal font-lilita w-[84px] {
            enabled ? 'text-[17px]': 'text-[12px]'
        }">
            {enabled ? enabledText : text}
        </span>
    </div>
</button>