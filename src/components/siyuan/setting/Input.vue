<template>
    <!-- button -->
    <button 
        v-if="propsOption.type === 'button'"
        :disabled="disabled"
        :class="[
            'b3-button b3-button--outline', 
            {'fn__block': block, 'fn__flex-center': !block, 'fn__size200': !block && normal}]"
        @click="$emit('clicked', settingKey, settingValue, config)"
    >{{ settingValue }}</button>

    <!-- checkbox -->
    <input 
        v-if="propsOption.type === 'checkbox'"
        :disabled="disabled"
        :class="['b3-switch', {'fn__block': block, 'fn__flex-center': !block}]"
        type="checkbox"
        v-model="settingValue"
        @change="$emit('changed', settingKey, settingValue, config)"
    />

    <!-- number -->
    <input 
        v-if="propsOption.type === 'number'"
        :disabled="disabled"
        :class="['b3-text-field', {'fn__block': block, 'fn__flex-center': !block, 'fn__size200': !block && normal}]"
        type="number"
        :min="limit.min"
        :max="limit.max"
        :step="limit.step"
        v-model="settingValue"
        @change="$emit('changed', settingKey, settingValue, config)"
    />

    <!-- password -->
    <template v-if="propsOption.type === 'password'">
        <input 
            :disabled="disabled"
            :class="[
                'b3-text-field', 
                {'fn__block': block, 'fn__flex-center': !block, 'fn__size200': !block && normal}]"
            type="password"
            :placeholder="placeholder"
            v-model="settingValue"
            @change="$emit('changed', settingKey, settingValue, config)"
        />
        <span class="custom-password-preview">
            <Svg icon="#iconPreview" class="b3-list-item__graphic" @click="showPassword"></Svg>
        </span>
    </template>

    <!-- select -->
    <select 
        v-if="propsOption.type === 'select'"
        :disabled="disabled"
        :class="[
            'b3-select', 
            {'fn__block': block, 'fn__flex-center': !block, 'fn__size200': !block && normal}]"
        v-model="settingValue"
        @change="$emit('changed', settingKey, settingValue, config)"
    >
        <option v-for="option in propsOption.options" :value="option.key">
            {{ option.text }}
        </option>
    </select>

    <!-- slider -->
    <input 
        v-if="propsOption.type === 'slider'"
        :disabled="disabled"
        :class="['b3-slider', {'fn__block': block, 'fn__size200': !block && normal}]"
        type="range"
        :min="limit.min"
        :max="limit.max"
        :step="limit.step"
        v-model="settingValue"
        @change="$emit('changed', settingKey, settingValue, config)"
    />

    <!-- text -->
    <input 
        v-if="propsOption.type === 'text'"
        :disabled="disabled"
        :class="[
            'b3-text-field', 
            {'fn__block': block, 'fn__flex-center': !block, 'fn__size200': !block && normal}]"
        type="text"
        :placeholder="placeholder"
        v-model="settingValue"
        @change="$emit('changed', settingKey, settingValue, config)"
    />

    <!-- textarea -->
    <textarea 
        v-if="propsOption.type === 'textarea'"
        :disabled="disabled"
        :class="[
            'b3-text-field', 
            {'fn__block': block, 'fn__flex-center': !block, 'fn__size200': !block && normal}]"
        type="text"
        :placeholder="placeholder"
        :style="height > 0 ? `${height}px` : undefined"
        v-model="settingValue"
        @change="$emit('changed', settingKey, settingValue, config)"
    />

</template>

<script setup lang="ts">
    import { ref, inject } from 'vue';
    import { IInputPropsOption, ILimits } from '.';
    import Svg from '../misc/Svg.vue';

    const propsOption = withDefaults(defineProps<IInputPropsOption>(), {
        block: false,
        normal: true,
        disabled: false,
        height: 0,
        limit: () => { return { min: 0, max: 100, step: 1 } as ILimits },
        placeholder: "",
    });
    defineEmits(["clicked", "changed"]);
    const settingValue = ref(propsOption.settingValue);
    const config = inject("config");

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