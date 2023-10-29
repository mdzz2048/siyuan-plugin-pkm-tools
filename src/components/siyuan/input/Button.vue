<template>
    <button 
        :disabled="disabled"
        :class="[
            'b3-button b3-button--outline', 
            {'fn__block': block, 'fn__flex-center': !block, 'fn__size200': !block && normal}]"
        @click="$emit('clicked', settingKey, settingValue)"
    >{{settingValue}}</button>
</template>

<script setup lang="ts">
    type IPropsOption = {
        settingKey: string,     // 标识符
        settingValue: string,   // 绑定的值
        block?: boolean,        // 使用 fn__block (width: 100%;)
        normal?: boolean,       // 使用 fn__size200 (width: 200px)
        disabled?: boolean,     // 关闭交互
    }
    withDefaults(defineProps<IPropsOption>(), {
        block: false,
        normal: true,
        disabled: false,
    });
    defineEmits(["clicked"]);
</script>