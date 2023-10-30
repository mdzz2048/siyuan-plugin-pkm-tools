<template>
    <textarea 
        :disabled="props.disabled"
        :class="[
            'b3-text-field', 
            {'fn__block': block, 'fn__flex-center': !block, 'fn__size200': !block && normal}]"
        type="text"
        :placeholder="props.placeholder"
        :style="props.height > 0 ? `${height}px` : undefined"
        v-model="settingValue"
        @change="$emit('changed', props.settingKey, settingValue)"
    />
</template>

<script setup lang="ts">
    import { ref } from 'vue';

    type IPropsOption = {
        settingKey: string,     // 标识符
        settingValue: string,   // 绑定的值
        placeholder?: string,   // 占位文本
        height?: number,        // 高度
        block?: boolean,        // 使用 fn__block (width: 100%;)
        normal?: boolean,       // 使用 fn__size200 (width: 200px)
        disabled?: boolean,     // 关闭交互
    }
    const props = withDefaults(defineProps<IPropsOption>(), {
        placeholder: "input",
        height: 0,
        block: false,
        normal: true,
        disabled: false,
    });
    defineEmits(["changed"]);
    const settingValue = ref(props.settingValue);
</script>