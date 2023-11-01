<template>
    <div class="fn__flex-column" style="height: 100%;">
        <!-- 页签列表 -->
        <div class="layout-tab-bar fn__flex">
            <div
                role="button"
                v-for="tab in tabs"
                :data-type="tab.name"
                :class="['item item--full', {'item--focus': tab.focus}]"
                @click="$emit('tabChanged', tab, 'tab')"
            >
                <span class="fn__flex-1" />

                <Svg className="b3-list-item__graphic" :icon="tab.icon"></Svg>
                <span class="item__text" v-html="tab.text"></span>
                
                <span class="fn__flex-1" />
            </div>
        </div>
        <!-- 页签内容主体 -->
        <div class="fn__flex-1">
            <slot>Container</slot>
        </div>
    </div>
</template>

<script setup lang="ts">
    import Svg from '../misc/Svg.vue';
    import { ITabsPropsOption } from '.'

    defineProps<ITabsPropsOption>();
    defineEmits(['tabChanged']);
</script>