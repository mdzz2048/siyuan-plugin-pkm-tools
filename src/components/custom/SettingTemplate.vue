<template>
    <Panels :panels="setting.panels" @panelChanged="changeFocus">
        <!-- 面板 -->
        <Panel :name="panel.name" :display="panel.focus" v-for="panel of setting.panels">
            <!-- 页签 -->
            <template v-if="panel?.tabs">
                <Tabs :tabs="panel?.tabs" @tabChanged="changeFocus">
                    <Panel v-for="tab of panel.tabs" :display="tab.focus" :top="false">
                        <SettingItem v-for="item of tab.items" :item="item" :hindItems="hindItems" @refersh="refersh"/>
                        <SettingItem v-for="group of tab.groups" :group="group" :hindItems="hindItems" @refersh="refersh"/>
                    </Panel>
                </Tabs>
            </template>
            <template v-else>
                <!-- 配置项 -->
                <SettingItem v-for="item of panel.items" :item="item" :hindItems="hindItems" @refersh="refersh"/>
                <SettingItem v-for="group of panel.groups" :group="group" :hindItems="hindItems" @refersh="refersh"/>
            </template>
        </Panel>
    </Panels>
</template>

<script setup lang="ts">
    import { onMounted, ref, provide } from 'vue';
    import { ITab } from '../siyuan/setting';
    import { GlobalConfig } from '../../types/config';
    import { getNotebookOptions, getSettingConfig, getConfig } from './setting';
    import Tabs from '../siyuan/setting/Tabs.vue';
    import Panel from '../siyuan/setting/Panel.vue';
    import Panels from '../siyuan/setting/Panels.vue';
    import SettingItem from '../base/SettingItem.vue';

    const config = getConfig();
    const setting = ref(getSettingConfig());
    const panelOptions = ref(setting.value.panels);
    const tabOptions = ref(setting.value.panels.map(panel => panel?.tabs));
    // 需要切换显示的配置项
    const hindItems = ref({
        "savePath": {
            hind: config.setting.import.type !== '1',
            fn: (config: GlobalConfig) => { return config.setting.import.type !== '1' }
        },
        "savePathByDate": {
            hind: config.setting.import.type !== '2',
            fn: (config: GlobalConfig) => { return config.setting.import.type !== '2' }
        }
    });
    provide("config", config);

    onMounted(async () => {
        setting.value.panels[0].items[0]['input'].options = await getNotebookOptions();
    })

    function changeFocus(item: ITab, type: "panel" | "tab") {
        switch (type) {
            case "panel": 
                panelOptions.value.forEach(panel => {
                    panel?.tabs?.forEach(tab => tab.focus = false);
                    panel.focus = panel === item ? true : false;
                    if (panel === item && panel?.tabs?.[0]) { panel.tabs[0].focus = true }
                })

                break;
            case "tab":
                tabOptions?.value?.forEach(tabs => {
                    tabs?.forEach(tab => tab.focus = tab === item ? true : false);
                })
                break;
            default:
                console.log(`匹配失败: ${type}`, item);
                break;
        }
    }

    function refersh(pluginConfig: GlobalConfig) {
        console.log(pluginConfig);
        hindItems.value.savePath.hind = hindItems.value.savePath.fn(config);
        hindItems.value.savePathByDate.hind = hindItems.value.savePathByDate.fn(config);
    }
</script>