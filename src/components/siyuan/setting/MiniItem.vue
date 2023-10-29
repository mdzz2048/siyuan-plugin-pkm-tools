<template>
    <label
        class="fn__flex"
        :style="`min-width: ${minWidth}; margin-right: ${marginRight}`"
    >
        <slot name="icon" />

        <span class="fn__space" v-if="!fullWidth"/>
        <div class="fn__flex-1">
            <slot name="title" />
        </div>
        <span class="fn__space" v-if="!fullWidth"/>
        
        <slot name="input" />
    </label>
</template>

<script setup lang="ts">
    type IPropsOption = {
        minWidth?: string,
        marginRight?: string,
        fullWidth?: boolean,
    }
    withDefaults(defineProps<IPropsOption>(), {
        minWidth: "24em",
        marginRight: "2em",
        fullWidth: false,
    });
</script>

<style>
    label {
        width: unset;
        margin: 0.5em 0;
        align-items: center;
    }
</style>