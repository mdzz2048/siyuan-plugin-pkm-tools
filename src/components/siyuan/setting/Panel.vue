<template>
    <div
        :data-name="name"
        :class="[
            'config__tab-container', 
            {'config__tab-container--top': top, 'fn__none': !display}]"
    >
        <slot />
    </div>
</template>

<script setup lang="ts">
    import { IPanelPropsOption } from "."
    
    withDefaults(defineProps<IPanelPropsOption>(), {
        display: false,
        top: true,
    })
</script>