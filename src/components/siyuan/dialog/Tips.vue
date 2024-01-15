<template>
    <!-- 内容 -->
    <div
        class="b3-dialog__content"
        :style="userSelect"
    >
        <slot/>
    </div>

    <!-- 按钮 -->
    <div class="b3-dialog__action">
        <button
            class="b3-button b3-button--cancel"
            @click="$emit('onCancle')"
        >
            {{ cancelButtonText }}
        </button>
        <div class="fn__space" />
        <button
            class="b3-button b3-button--text"
            @click="$emit('onConfirm')"
        >
            {{ confirmButtonText }}
        </button>
    </div>
</template>

<script setup lang="ts">
    type IPropsOption = {
        selectable?: boolean,       // 是否可选
        cancelButtonText?: string,  // 取消按钮文本
        confirmButtonText?: string, // 确定按钮文本
    }
    const props = withDefaults(defineProps<IPropsOption>(), {
        selectable: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Confirm",
    })
    const userSelect = `user-select: ${props.selectable} ? true : none`
    defineEmits(["onCancle", "onConfirm"]);
</script>