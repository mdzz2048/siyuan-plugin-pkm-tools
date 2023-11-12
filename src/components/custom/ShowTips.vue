<template>
    <Tips
        cancelButtonText="取消"
        confirmButtonText="确认"
        @onCancle="cancel"
        @onConfirm="confirm"
    >
        tips
    </Tips>
</template>

<script setup lang="ts">
    import { Dialog } from 'siyuan';
    import Tips from '../siyuan/dialog/Tips.vue';

    type IPropsOption = {
        dialog: Dialog,
    }
    const props = defineProps<IPropsOption>();

    function cancel() {
        // props.dialog.destroy();
    }

    function confirm() {
        console.log('do something');
        props.dialog.destroy();
    }
</script>