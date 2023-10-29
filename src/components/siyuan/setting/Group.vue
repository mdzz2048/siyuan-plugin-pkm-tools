<template>
    <div class="b3-label">
        <span v-html="props.tilte"></span>
        <div class="config-query">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
    type IPropsOption = {
        tilte: string,
    }
    const props = defineProps<IPropsOption>();
</script>