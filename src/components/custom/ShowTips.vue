<template>
    <Tips
        cancelButtonText="取消"
        confirmButtonText="确认"
        @onCancle="cancel"
        @onConfirm="confirm"
    >
        <div v-html="tips"></div>
    </Tips>
</template>

<script setup lang="ts">
    import Tips from '../siyuan/dialog/Tips.vue';

    type IPropsOption = {
        tips: string,
        cancel: void | (() => void),
        confirm: void | (() => void),
    }
    defineProps<IPropsOption>();
</script>