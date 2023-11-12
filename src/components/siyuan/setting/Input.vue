<template>
    <!-- button -->
    <button 
        v-if="propsOption.type === 'button'"
        :disabled="disabled"
        :readonly="propsOption.readonly"
        :class="[
            'b3-button b3-button--outline', 
            {'fn__block': block, 'fn__flex-center': !block, 'fn__size200': !block && normal}]"
        :style="style"
        @click="$emit('clicked', settingKey, value)"
    >{{ value }}</button>

    <!-- checkbox -->
    <input 
        v-if="propsOption.type === 'checkbox'"
        type="checkbox"
        :disabled="disabled"
        :readonly="propsOption.readonly"
        :class="['b3-switch', {'fn__block': block, 'fn__flex-center': !block}]"
        :style="style"
        v-model="value"
        @change="$emit('changed', settingKey, value)"
    />

    <!-- number -->
    <input 
        v-if="propsOption.type === 'number'"
        type="number"
        :disabled="disabled"
        :readonly="propsOption.readonly"
        :class="['b3-text-field', {'fn__block': block, 'fn__flex-center': !block, 'fn__size200': !block && normal}]"
        :min="limit.min"
        :max="limit.max"
        :step="limit.step"
        :style="style"
        v-model="value"
        @change="$emit('changed', settingKey, value)"
    />

    <!-- password -->
    <template v-if="propsOption.type === 'password'">
        <input 
            type="password"
            :disabled="disabled"
            :readonly="propsOption.readonly"
            :class="[
                'b3-text-field', 
                {'fn__block': block, 'fn__flex-center': !block, 'fn__size200': !block && normal}]"
            :placeholder="placeholder"
            :style="style"
            v-model="value"
            @change="$emit('changed', settingKey, value)"
        />
        <span class="custom-password-preview">
            <Svg icon="#iconPreview" class="b3-list-item__graphic" @click="showPassword"></Svg>
        </span>
    </template>

    <!-- select -->
    <select 
        v-if="propsOption.type === 'select'"
        :disabled="disabled"
        :readonly="propsOption.readonly"
        :class="[
            'b3-select', 
            {'fn__block': block, 'fn__flex-center': !block, 'fn__size200': !block && normal}]"
        :style="style"
        v-model="value"
        @change="$emit('changed', settingKey, value)"
    >
        <option v-for="option in propsOption.options" :value="option.key">
            {{ option.text }}
        </option>
    </select>

    <!-- slider -->
    <input 
        v-if="propsOption.type === 'slider'"
        type="range"
        :disabled="disabled"
        :readonly="propsOption.readonly"
        :class="['b3-slider', {'fn__block': block, 'fn__size200': !block && normal}]"
        :min="limit.min"
        :max="limit.max"
        :step="limit.step"
        :style="style"
        v-model="value"
        @change="$emit('changed', settingKey, value)"
    />

    <!-- text -->
    <input 
        v-if="propsOption.type === 'text'"
        type="text"
        :disabled="disabled"
        :readonly="propsOption.readonly"
        :class="[
            'b3-text-field', 
            {'fn__block': block, 'fn__flex-center': !block, 'fn__size200': !block && normal}]"
        :placeholder="placeholder"
        :style="style"
        v-model="value"
        @change="$emit('changed', settingKey, value)"
    />

    <!-- textarea -->
    <textarea 
        v-if="propsOption.type === 'textarea'"
        type="text"
        :disabled="disabled"
        :readonly="propsOption.readonly"
        :class="[
            'b3-text-field', 
            {'fn__block': block, 'fn__flex-center': !block, 'fn__size200': !block && normal}]"
        :placeholder="placeholder"
        :style="style"
        v-model="value"
        @change="$emit('changed', settingKey, value)"
    />

</template>

<script setup lang="ts">
    import { computed, ref } from 'vue';
    import { IInputPropsOption, ILimits } from '.';
    import Svg from '../misc/Svg.vue';

    const propsOption = withDefaults(defineProps<IInputPropsOption>(), {
        block: false,
        normal: true,
        alterable: true,
        disabled: false,
        readonly: false,
        style: "",
        limit: () => { return { min: 0, max: 100, step: 1 } as ILimits },
        placeholder: "",
    });
    defineEmits(["clicked", "changed"]);
    const dynamicValue = ref(propsOption.settingValue);
    const value = computed({
        get() {
            return propsOption.alterable ? dynamicValue.value : propsOption.settingValue
        },
        set(newValue) {
            dynamicValue.value = newValue
        }
    })

    function showPassword(event: Event) {
        const targetElement = event.target as HTMLElement;
        const parentElement = targetElement.parentElement;
        const previousElement = parentElement.previousElementSibling as HTMLInputElement;
        previousElement.type = previousElement.type === "password" ? "text" : "password";
    }
</script>

<style>
    .custom-password-preview {
        position: absolute;
        right: 30px;
    }

    .custom-password-preview > svg{
        display: flex;
    }
</style>