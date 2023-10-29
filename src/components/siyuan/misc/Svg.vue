<template>
    <svg
        :data-id="id"
        :style="style"
        :class="[className, {'popover__block': regexp.id.test(id)}]"
    >
        <use :xlink:href="icon"></use>
    </svg>
</template>

<script setup lang="ts">
    import regexp from '../../../utils/regexp';

    type IPropsOption = {
        icon: string,
        id?: string,
        className?: string,
        style?: string,
    }
    withDefaults(defineProps<IPropsOption>(), {
        id: "",
        className: "",
        style: "",
    });
</script>