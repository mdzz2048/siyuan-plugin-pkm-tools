<template>
    <label class="fn__flex b3-label">
        <div
            class="fn__flex-1"
            :class="{visible: block}"
        >
            <slot name="title"><span v-html="title"></span></slot>
            <div class="b3-label__text">
                <slot name="text"><span v-html="text"></span></slot>
            </div>
            <template v-if="block">
                <div class="fn__hr"></div>

                <slot />
            </template>
        </div>

        <template v-if="!block">
            <span class="fn__space"></span>

            <slot />
        </template>
    </label>
</template>

<script setup lang="ts">
    import { IItemPropsOption } from ".";

    withDefaults(defineProps<IItemPropsOption>(), {
        block: false,
    });
</script>

<style>
    .visible {
        overflow: visible;
    }
</style>