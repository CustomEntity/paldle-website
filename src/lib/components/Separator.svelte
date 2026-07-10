<script lang="ts">

    interface Props {
       class?: string;
    }

    const {class: clazz = 'w-[100%] h-[2px] bg-white'}: Props = $props();
</script>

<div class="{clazz}">
</div>
