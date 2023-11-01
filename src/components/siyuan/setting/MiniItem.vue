<template>
    <label
        class="fn__flex"
        :style="`min-width: ${minWidth}; margin-right: ${marginRight}`"
    >
        <slot name="icon"><span v-html="icon"></span></slot>

        <span class="fn__space" v-if="!fullWidth"/>
        <div class="fn__flex-1">
            <slot name="title"><span v-html="title"></span></slot>
        </div>
        <span class="fn__space" v-if="!fullWidth"/>
        
        <slot/>
    </label>
</template>

<script setup lang="ts">
    import { IMiniItemPropsOption } from "./index";

    withDefaults(defineProps<IMiniItemPropsOption>(), {
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