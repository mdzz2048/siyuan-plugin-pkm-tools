<template>
    <div class="b3-label">
        <span v-html="props.title"></span>
        <div class="config-query">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { IGroupPropsOption } from '.';

    const props = defineProps<IGroupPropsOption>();
</script>