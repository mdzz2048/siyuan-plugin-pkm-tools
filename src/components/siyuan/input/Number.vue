<template>
    <input 
        :disabled="propsOption.disabled"
        :class="['b3-text-field', {'fn__block': block, 'fn__flex-center': !block, 'fn__size200': !block && normal}]"
        type="number"
        :min="propsOption.limit.min"
        :max="propsOption.limit.max"
        :step="propsOption.limit.step"
        v-model="settingValue"
        @change="$emit('changed', propsOption.settingKey, settingValue)"
    />
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    import type { ILimits } from '.';
    
    type IPropsOption = {
        settingKey: string,     // 标识符
        settingValue: string,   // 绑定的值
        limit?: ILimits,        // 范围 ({ min: 0, max: 100, step: 1 })
        block?: boolean,        // 使用 fn__block (width: 100%;)
        normal?: boolean,       // 使用 fn__size200 (width: 200px)
        disabled?: boolean,     // 关闭交互
    }
    const propsOption = withDefaults(defineProps<IPropsOption>(), {
        block: false,
        normal: true,
        disabled: false,
        limit: () => { return { min: 0, max: 100, step: 1 } as ILimits }
    }) ;
    defineEmits(["changed"]);
    const settingValue = ref(propsOption.settingValue);
</script>./input.