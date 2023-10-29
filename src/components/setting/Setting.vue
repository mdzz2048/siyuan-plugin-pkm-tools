<template>
    <Panels
        :panels="panelOptions"
        :searchEnable="false"
        @panelChanged="changeFocus"
    >
        <Panel :name="panelOptions[0].name" :display="panelOptions[0].focus">
            <Item
                title="导入位置"
                text="选择导入的笔记本"
            >
                <Select
                    setting-key="saveNotebook"
                    :setting-value="saveNotebook"
                    :options="saveNotebookOptions"
                    @changed="changeConfig"
                />
            </Item>
            <Item
                title="导入方式"
                text="1: 全部导入一个文档;<br>2: 按创建日期拆分;"
            >
                <Select
                    setting-key="saveType"
                    :setting-value="saveType"
                    :options="saveTypeOptions"
                    @changed="changeConfig"
                />
            </Item>
            <Item
                title="保存路径"
                text="设置保存文档路径"
                v-if="saveType === '1'"
            >
                <Text
                    setting-key="savePath"
                    :setting-value="savePath"
                    @changed="changeConfig"
                />
            </Item>
            <Item
                title="拆分粒度"
                text="设置保存的路径"
                v-else-if="saveType === '2'"
            >
                <Select
                    setting-key="savePathByDate"
                    :setting-value="savePathByDate"
                    :options="savePathByDateOptions"
                    @changed="changeConfig"
                />

            </Item>
        </Panel>
        <Panel :name="panelOptions[1].name" :display="panelOptions[1].focus">
            <Tabs
                :tabs="tabOptions"
                @tabChanged="changeFocus"
            >
                <Panel :name="tabOptions[0].name" :display="tabOptions[0].focus" :top="false">
                    <Item
                        title="测试"
                        text="点击测试连通性"
                    >
                        <Button 
                            setting-key="flomo"
                            setting-value="测试"
                            @clicked="changed"
                        />
                    </Item>
                    <Group title="账号信息">
                        <MiniItem min-width="100%" margin-right="0px" :fullWidth="true">
                            <template #title>
                                <div class="b3-list-item__text">账号</div>
                            </template>
                            <template #input>
                                <Text
                                    setting-key="flomoUser"
                                    :setting-value="flomoUser"
                                    @changed="changeConfig"
                                />
                            </template>
                        </MiniItem>
                        <MiniItem min-width="100%" margin-right="0px" :fullWidth="true">
                            <template #title>
                                <div class="b3-list-item__text">密码</div>
                            </template>
                            <template #input>
                                <Password
                                    setting-key="flomoPassword"
                                    :setting-value="flomoPassword"
                                    @changed="changeConfig"
                                />
                            </template>
                        </MiniItem>
                    </Group>
                    <Item
                        title="文档模板"
                        text="使用文档模板"
                    >
                        <Textarea 
                            setting-key="文档模板"
                            setting-value="this is"
                            @changed="changed"
                        />
                    </Item>
                </Panel>
                <Panel :name="tabOptions[1].name" :display="tabOptions[1].focus" :top="false">
                    <Item
                        title="测试"
                        text="点击测试账密是否正确"
                    >
                        <Button 
                            setting-key="按键 key"
                            setting-value="按键"
                            @clicked="clicked"
                        />
                    </Item>
                </Panel>
                <Panel :name="tabOptions[2].name" :display="tabOptions[2].focus" :top="false">
                    <Item
                        title="登录"
                        text="点击按钮登录"
                    >
                        <Checkbox 
                            setting-key="开关 key"
                            setting-value="开关"
                            @changed="changed"
                        />
                    </Item>
                </Panel>
            </Tabs>
        </Panel>
    </Panels>
</template>

<script setup lang="ts">
    import { ref, Ref, onMounted } from 'vue';
    import Select from '../siyuan/input/Select.vue';
    import Text from '../siyuan/input/Text.vue';
    import Button from '../siyuan/input/Button.vue';
    import Password from '../siyuan/input/Password.vue';
    import Textarea from '../siyuan/input/Textarea.vue';
    import Checkbox from '../siyuan/input/Checkbox.vue';
    import Item from '../siyuan/setting/Item.vue';
    import MiniItem from '../siyuan/setting/MiniItem.vue';
    import Group from '../siyuan/setting/Group.vue';
    import Panel from '../siyuan/setting/Panel.vue';
    import Panels from '../siyuan/setting/Panels.vue';
    import Tabs from '../siyuan/setting/Tabs.vue';
    import type { ITab } from '../siyuan/setting'
    import type { IOption } from '../siyuan/input';
    import * as api from './setting';

    const saveNotebookOptions = ref([]);
    const panelOptions: Ref<ITab[]> = ref([
        {
            key: "1",
            text: "常规设置",
            focus: true,
            name: "常规设置",
            icon: "#iconSettings",
        },
        {
            key: "2",
            text: "其他设置",
            focus: false,
            name: "其他设置",
            icon: "#iconDownload"
        }
    ])
    const tabOptions: Ref<ITab[]> = ref([
        {
            key: "1",
            text: "Flomo",
            focus: true,
            name: "Flomo",
            icon: "#iconFlomo"
        },
        {
            key: "2",
            text: "Writeathon",
            focus: false,
            name: "Writeathon",
            icon: "#iconWriteathon"
        },
        {
            key: "2",
            text: "Cubox",
            focus: false,
            name: "Cubox",
            icon: "#iconCubox"
        },
    ])
    const saveTypeOptions: IOption[] = [
        { key: "1", text: "导入文档" },
        { key: "2", text: "按日期拆分" }
    ]
    const savePathByDateOptions: IOption[] = [
        { key: "1", text: "年" },
        { key: "2", text: "年-月" },
        { key: "3", text: "年-月-日" }
    ]
    const config = api.getConfig();
    const saveNotebook = ref(config.setting.import.box);
    const saveType = ref(config.setting.import.type);
    const savePath = ref(config.setting.import.path);
    const savePathByDate = ref(config.setting.import.path_date);
    const flomoUser = ref(config.account.flomo.email);
    const flomoPassword = ref(config.account.flomo.password);
    
    onMounted(async () => {
        saveNotebookOptions.value = await api.getNotebookOptions();
    })

    function changed(key: string, value: any) {
        console.log(key);
        console.log(value);
    }

    function clicked(key: string, value: any) {
        console.log(key);
        console.log(value);
    }

    function changeFocus(item: ITab, type: "panel" | "tab") {
        switch (type) {
            case "panel": 
                panelOptions.value.forEach(panel => {
                    panel.focus = panel === item ? true : false; 
                })
                break;
            case "tab":
                tabOptions.value.forEach(tab => {
                    tab.focus = tab === item ? true : false; 
                })
                break;
            default:
                console.log(`匹配失败: ${type}`, item);
                break;
        }
    }

    function changeConfig(key: string, value: any) {
        const pluginConfig = api.getConfig();

        key === "flomoUser" && (pluginConfig.account.flomo.email = value);
        key === "flomoPassword" && (pluginConfig.account.flomo.password = value);
        key === "saveNotebook" && (pluginConfig.setting.import.box = value);
        key === "savePathByDate" && (pluginConfig.setting.import.path_date = value);
        key === "savePath" && (pluginConfig.setting.import.path = value);
        key === "saveType" && (() => {
            pluginConfig.setting.import.type = value;
            saveType.value = value;
        })();
        // key === "" && (pluginConfig);
        // key === "" && (pluginConfig);


        console.log(`${key}: ${value}`);
        api.updateConfig(pluginConfig);
    }
</script>