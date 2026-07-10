<script lang="ts">

    import type {Snippet} from "svelte";

    interface Props {
        title: string;
        content: Snippet;
        class?: string;
    }

    let {title, content, ...rest}: Props = $props();
</script>

<section class="flex flex-col gap-2.5 {rest.class}">
    <div class="flex w-full h-7 max-w-[450px] text-white uppercase font-refrigerator-deluxe bg-[#80AEE266]">
        <div class="flex items-center gap-2 px-4 pt-0.5 [clip-path:polygon(0_0,95%_0,100%_100%,0_100%)] bg-[#80AEE280]">
        <span class="flex items-center text-base font-normal uppercase leading-4 text-center [text-underline-position:from-font] [text-decoration-skip-ink:none]">
            {title}
        </span>
        </div>
    </div>
    <div>
        {@render content()}
    </div>
</section>