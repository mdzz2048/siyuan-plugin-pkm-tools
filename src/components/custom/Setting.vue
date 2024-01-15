<template>
    <Panels :panels="setting.panels" @panelChanged="changeFocus">
        <!-- 面板 -->
        <Panel :name="panel.name" :display="panel.focus" v-for="panel of setting.panels">
            <!-- 页签 -->
            <template v-if="panel?.tabs">
                <Tabs :tabs="panel?.tabs" @tabChanged="changeFocus">
                    <Panel v-for="tab of panel.tabs" :display="tab.focus" :top="false" :name="panel.name">
                        <template v-for="item of tab.items">
                            <Group v-if="item.isGroup" :title="item.title">
                                <MiniItem v-for="option of item.miniItems" v-bind="option"
                                    v-show="!hindItems?.[option.input.settingKey]" @change="refersh"
                                >
                                    <Input v-bind="option.input" @clicked="clicked" @changed="changed"/>
                                </MiniItem>
                            </Group>
                            <Item v-else v-bind="item" :key="item.index"
                                v-show="!hindItems?.[item.input.settingKey]" @change="refersh"
                            >
                                <Input v-bind="item.input" @clicked="clicked" @changed="changed"/>
                            </Item>
                        </template>
                    </Panel>
                </Tabs>
            </template>
            <!-- 配置项 -->
            <template v-else>
                <template v-for="item of panel.items">
                    <Group v-if="item.isGroup" :title="item.title">
                        <MiniItem v-for="option of item.miniItems" v-bind="option"
                            v-show="!hindItems?.[option.input.settingKey]" @change="refersh"
                        >
                            <Input v-bind="option.input" @clicked="clicked" @changed="changed"/>
                        </MiniItem>
                    </Group>
                    <Item v-else v-bind="item" :key="item.index"
                        v-show="!hindItems?.[item.input.settingKey]" @change="refersh"
                    >
                        <Input v-bind="item.input" @clicked="clicked" @changed="changed"/>
                    </Item>
                </template>
            </template>
        </Panel>
    </Panels>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ITab } from '../siyuan/setting';
import { CONFIG } from '../../utils/config';
import { fackBookmark } from '../../config/fake';
import { parseTemplate } from '../../utils/template';
import { 
    SETTING_CONFIG, getNotebookOptions, updateConfig, updateObjectByKey, ISettingConfig 
} from './setting';
import Tabs from '../siyuan/setting/Tabs.vue';
import Panel from '../siyuan/setting/Panel.vue';
import Panels from '../siyuan/setting/Panels.vue';
import Item from '../siyuan/setting/Item.vue';
import Input from '../siyuan/setting/Input.vue';
import Group from '../siyuan/setting/Group.vue';
import MiniItem from '../siyuan/setting/MiniItem.vue';

const config = CONFIG();
const setting = ref(SETTING_CONFIG());
// 需要切换显示的配置项
const hindItems = ref({
    "flomoSavePath": config.setting.flomo.memo_import_type !== "1",
    "flomoSaveDatePath": config.setting.flomo.memo_import_type !== "2",
    "cuboxSavePath": config.setting.cubox.article_import_type !== "1",
    "cuboxSaveDatePath": config.setting.cubox.article_import_type !== "2",
    "cuboxCleanRuleDate": config.setting.cubox.clean_type !== "2",
    "cuboxCleanRuleCount": config.setting.cubox.clean_type !== "3",
    "cuboxDocTemplateParsed": true,
});

onMounted(async () => {
    const notebooks = await getNotebookOptions();
    setting.value = SETTING_CONFIG(notebooks);
})

function changeFocus(item: ITab, type: "panel" | "tab") {
    switch (type) {
        case "panel": 
            setting.value.panels.forEach(panel => {
                panel.focus = panel.key === item.key ? true : false;
                panel?.tabs?.forEach(tab => tab.focus = false);
                if (panel.key === item.key && panel?.tabs?.[0]) { panel.tabs[0].focus = true }
            })
            break;
        case "tab":
            setting.value.panels.forEach(panel => {
                panel?.tabs?.forEach(tab => tab.focus = tab === item ? true : false);
            })
            break;
        default:
            console.log(`匹配失败: ${type}`, item);
            break;
    }
}

function refersh() {
    hindItems.value.flomoSavePath = config.setting.flomo.memo_import_type !== "1";
    hindItems.value.flomoSaveDatePath = config.setting.flomo.memo_import_type !== "2";
    hindItems.value.cuboxSavePath = config.setting.cubox.article_import_type !== "1";
    hindItems.value.cuboxSaveDatePath = config.setting.cubox.article_import_type !== "2";
    hindItems.value.cuboxCleanRuleDate = config.setting.cubox.clean_type !== "2";
    hindItems.value.cuboxCleanRuleCount = config.setting.cubox.clean_type !== "3";
}

/**
 * 设置界面点击事件
 * @param key 
 * @param value 
 */
function clicked(key: string, value: any) {
    switch (key) {
        case "cuboxDocTemplateTest":
            // 解析模板
            const template = config.setting.cubox.article_template;
            const parsed = parseTemplate(template, {
                bookmark: fackBookmark
            })
            console.log(parsed);
            // 显示解析内容
            hindItems.value.cuboxDocTemplateParsed = false;
            updateObjectByKey(setting.value, "cuboxDocTemplateParsed", parsed);
            break;
        case "flomoLoginTest":
            updateObjectByKey(setting.value, "flomoLoginTest", "114514") as ISettingConfig;
            console.log(setting.value);
            break;
        default:
            console.log(key);
            break;
    }
    console.log(key);
    console.log(value);
}

/**
 * 设置界面表单输入事件
 * @param key settingKey: 
 * @param value settingValue: 
 */
 function changed(key: string, value: any) {

    key === "flomoUser" && (config.account.flomo.email = value);
    key === "flomoPassword" && (config.account.flomo.password = value);
    key === "flomoSaveNotebook" && (config.setting.flomo.memo_box = value);
    key === "flomoInsertType" && (config.setting.flomo.memo_insert_before = value);
    key === "flomoSaveType" && (config.setting.flomo.memo_import_type = value);
    key === "flomoSavePath" && (config.setting.flomo.memo_path = value);
    key === "flomoSaveDatePath" && (config.setting.flomo.memo_date_path = value);
    key === "flomoGetLinkTitle" && (config.setting.flomo.get_link_title = value);
    key === "dnNotebook" && (config.setting.flomo.dn_box = value);
    key === "dnLinkDoc" && (config.setting.flomo.dn_link_doc = value);
    key === "dnInsertType" && (config.setting.flomo.dn_insert_before = value);
    key === "dnUseRef" && (config.setting.flomo.dn_use_ref = value);
    key === "cuboxUser" && (config.account.cubox.email = value);
    key === "cuboxPassword" && (config.account.cubox.password = value);
    key === "cuboxSaveNotebook" && (config.setting.cubox.article_box = value);
    key === "cuboxSaveType" && (config.setting.cubox.article_import_type = value);
    key === "cuboxSavePath" && (config.setting.cubox.article_path = value);
    key === "cuboxSaveDatePath" && (config.setting.cubox.article_date_path = value);
    key === "cuboxCleanType" && (config.setting.cubox.clean_type = value);
    key === "cuboxCleanRuleDate" && (config.setting.cubox.clean_rules_date = value);
    key === "cuboxCleanRuleCount" && (config.setting.cubox.clean_rules_count = value);
    key === "cuboxDocTemplate" && (config.setting.cubox.article_template = value);
    key === "cuboxBookmarkTemplate" && (config.setting.cubox.bookmark_template = value);
    key === "writeathonUser" && (config.account.cubox.email = value);
    key === "writeathonPassword" && (config.account.cubox.password = value);
    
    console.log(`${key}: ${value}`);
    updateConfig(config);
}
</script>