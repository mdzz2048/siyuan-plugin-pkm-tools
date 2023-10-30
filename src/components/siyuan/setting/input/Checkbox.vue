<template>
    <input 
        :disabled="disabled"
        :class="['b3-switch', {'fn__block': block, 'fn__flex-center': !block}]"
        type="checkbox"
        v-model="settingValue"
        @change="$emit('changed', settingKey, settingValue)"
    />
</template>

<script setup lang="ts">
    import { ref } from 'vue';

    type IPropsOption = {
        settingKey: string,     // 标识符
        settingValue: boolean,   // 绑定的值
        block?: boolean,        // 使用 fn__block (width: 100%;)
        normal?: boolean,       // 使用 fn__size200 (width: 200px)
        disabled?: boolean,     // 关闭交互
    }
    const propsOption = withDefaults(defineProps<IPropsOption>(), {
        block: false,
        normal: true,
        disabled: false,
    });
    defineEmits(["changed"]);
    const settingValue = ref(propsOption.settingValue);
</script>