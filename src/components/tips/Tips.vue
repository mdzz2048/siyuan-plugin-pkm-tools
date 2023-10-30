<template>
    <Dialog
        cancelButtonText="取消"
        confirmButtonText="确定"
    >
        tips
    </Dialog>
</template>


<script setup lang="ts">
    import Dialog from '../siyuan/dialog/Dialog.vue';
    import { inject } from 'vue';
    import type { IMemoSyncTips } from '../../types/flomo';

    type IPropsOption = {
        memosTips: IMemoSyncTips
    }
    defineProps<IPropsOption>();
    const memosTips = inject<IMemoSyncTips>('memosTips');
    console.log(memosTips);
</script>