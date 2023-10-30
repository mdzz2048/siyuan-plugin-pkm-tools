<template>
    <select 
        :disabled="propsOption.disabled"
        :class="[
            'b3-select', 
            {'fn__block': block, 'fn__flex-center': !block, 'fn__size200': !block && normal}]"
        v-model="settingValue"
        @change="$emit('changed', propsOption.settingKey, settingValue)"
    >
        <option v-for="option in propsOption.options" :value="option.key">
            {{ option.text }}
        </option>
    </select>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    import type { IOptions } from '.'

    type IPropsOption = {
        settingKey: string,     // 标识符
        settingValue: string,   // 绑定的值
        options: IOptions,      // 可选列表 ({ key: string, text: string }[])
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
</script>./input.