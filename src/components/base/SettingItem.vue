<template>
    <!-- item -->
    <Item v-if="itemOption" v-bind="$props.item" 
        v-show="!hindItems?.[itemOption?.input.settingKey]?.hind"
        @change="$emit('refersh', pluginConfig)"
    >
        <Input v-bind="$props.item.input" @clicked="clicked" @changed="changed"/>
    </Item>

    <!-- group -->
    <Group v-if="groupOption" :title="groupOption.title" 
        v-show="!hindItems?.[groupOption?.title]?.hind"
        @change="$emit('refersh', pluginConfig)"
    >
        <MiniItem v-for="option , index of groupOption.miniItems" v-bind="option">
            <Input v-bind="$props.group.miniItems[index].input" @clicked="clicked" @changed="changed"/>
        </MiniItem>
    </Group>
</template>

<script setup lang="ts">
    import Item from '../siyuan/setting/Item.vue';
    import Input from '../siyuan/setting/Input.vue';
    import Group from '../siyuan/setting/Group.vue';
    import MiniItem from '../siyuan/setting/MiniItem.vue';
    import { inject } from 'vue';
    import { GlobalConfig } from '../../types/config';
    import { 
        ISettingItemInfo, 
        ISettingGroupInfo, 
        ISettingHindItem, 
        clicked, changed 
    } from '../custom/setting';

    type ISettingItem = {
        item?: ISettingItemInfo,
        group?: ISettingGroupInfo,
        hindItems: ISettingHindItem
    }
    const propsOption = defineProps<ISettingItem>();
    defineEmits(['refersh']);
    const pluginConfig = inject<GlobalConfig>("config");
    const itemOption = propsOption?.item;
    const groupOption = propsOption?.group;
</script>