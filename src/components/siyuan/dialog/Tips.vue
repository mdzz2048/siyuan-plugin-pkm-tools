<template>
    <div
        class="b3-dialog__content"
        :style="userSelect"
    >
        <!-- 内容 -->
        <slot />
    </div>

    <!-- 按钮 -->
    <div class="b3-dialog__action">
        <button
            class="b3-button b3-button--cancel"
            v-bind="cancel"
            @click="$emit('onCancle')"
        >
            {{ cancelButtonText }}
        </button>
        <div class="fn__space" />
        <button
            class="b3-button b3-button--text"
            v-bind="confirm"
            @click="$emit('onConfirm')"
        >
            {{ confirmButtonText }}
        </button>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue';

    type IPropsOption = {
        selectable?: boolean,        // 是否可选
        cancelButtonText?: string,   // 取消按钮文本
        confirmButtonText?: string,  // 确定按钮文本
    }
    const props = withDefaults(defineProps<IPropsOption>(), {
        selectable: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Confirm",
    })
    const cancel = ref();
    const confirm = ref();
    const userSelect = `user-select: ${props.selectable} ? true : none`
    defineEmits(["onCancle", "onConfirm"]);
</script>