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
                <Input
                    type="select"
                    setting-key="saveNotebook"
                    :setting-value="saveNotebook"
                    :options="saveNotebookOptions"
                    @changed="changeConfig"
                />
            </Item>
            <Item
                title="插入方式"
                text="开启: 新笔记放在最前面;<br>关闭: 新笔记放在最后面;"
            >
                <Input
                    type="checkbox"
                    setting-key="insertType"
                    :setting-value="insertType"
                    :options="insertTypeOptions"
                    @changed="changeConfig"
                />
            </Item>
            <Item
                title="导入方式"
                text="1: 全部导入一个文档;<br>2: 按创建日期拆分;"
            >
                <Input
                    type="select"
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
                <Input
                    type="text"
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
                <Input
                    type="select"
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
                        <Input
                            type="button" 
                            setting-key="flomo"
                            setting-value="测试"
                            @clicked="testLogin"
                        />
                    </Item>
                    <Group title="账号信息">
                        <MiniItem min-width="100%" margin-right="0px" :fullWidth="true">
                            <template #title>
                                <div class="b3-list-item__text">账号</div>
                            </template>
                            <Input
                                type="text"
                                setting-key="flomoUser"
                                :setting-value="flomoUser"
                                @changed="changeConfig"
                            />
                        </MiniItem>
                        <MiniItem min-width="100%" margin-right="0px" :fullWidth="true">
                            <template #title>
                                <div class="b3-list-item__text">密码</div>
                            </template>
                            <Input
                                type="password"
                                setting-key="flomoPassword"
                                :setting-value="flomoPassword"
                                @changed="changeConfig"
                            />
                        </MiniItem>
                    </Group>
                    <Item
                        title="文档模板"
                        text="使用文档模板"
                    >
                        <Input
                            type="textarea"
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
                        <Input
                            type="button" 
                            setting-key="按键 key"
                            setting-value="按键"
                            @clicked="clicked"
                        />
                    </Item>
                </Panel>
                <Panel :name="tabOptions[2].name" :display="tabOptions[2].focus" :top="false">
                    <Item
                        title="测试"
                        text="点击测试连通性"
                    >
                        <Input
                            type="button" 
                            setting-key="cubox"
                            setting-value="测试"
                            @clicked="testLogin"
                        />
                    </Item>
                    <Group title="账号信息">
                        <MiniItem min-width="100%" margin-right="0px" :fullWidth="true">
                            <template #title>
                                <div class="b3-list-item__text">账号</div>
                            </template>
                            <Input
                                type="text"
                                setting-key="cuboxUser"
                                :setting-value="cuboxUser"
                                @changed="changeConfig"
                            />
                        </MiniItem>
                        <MiniItem min-width="100%" margin-right="0px" :fullWidth="true">
                            <template #title>
                                <div class="b3-list-item__text">密码</div>
                            </template>
                            <Input
                                type="password"
                                setting-key="cuboxPassword"
                                :setting-value="cuboxPassword"
                                @changed="changeConfig"
                            />
                        </MiniItem>
                    </Group>
                </Panel>
            </Tabs>
        </Panel>
    </Panels>
</template>

<script setup lang="ts">
    import { ref, Ref, onMounted } from 'vue';
    import { loginFlomo } from '../../api/flomo';
    import { loginCubox } from '../../api/cubox';
    import Input from '../siyuan/setting/Input.vue';
    import Item from '../siyuan/setting/Item.vue';
    import Group from '../siyuan/setting/Group.vue';
    import MiniItem from '../siyuan/setting/MiniItem.vue';
    import Panel from '../siyuan/setting/Panel.vue';
    import Panels from '../siyuan/setting/Panels.vue';
    import Tabs from '../siyuan/setting/Tabs.vue';
    import type { ITab } from '../siyuan/setting'
    import type { IOption } from '../siyuan/setting/input/index';
    import * as api from './setting';

    const saveNotebookOptions: Ref<IOption[]> = ref([]);
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
    const insertTypeOptions: IOption[] = [
        { key: "1", text: "插入前置子块" },
        { key: "2", text: "插入后置子块" }
    ]
    const savePathByDateOptions: IOption[] = [
        { key: "1", text: "年" },
        { key: "2", text: "年/年-月" },
        { key: "3", text: "年/年-月/年月日" }
    ]
    const config = api.getConfig();
    const saveNotebook = ref(config.setting.import.box);
    const saveType = ref(config.setting.import.type);
    const savePath = ref(config.setting.import.path);
    const insertType = ref(config.setting.import.type_insert);
    const savePathByDate = ref(config.setting.import.path_date);
    const flomoUser = ref(config.account.flomo.email);
    const flomoPassword = ref(config.account.flomo.password);
    const cuboxUser = ref(config.account.cubox.email);
    const cuboxPassword = ref(config.account.cubox.password);
    
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

        key === "saveNotebook" && (pluginConfig.setting.import.box = value);
        key === "savePathByDate" && (pluginConfig.setting.import.path_date = value);
        key === "savePath" && (pluginConfig.setting.import.path = value);
        key === "insertType" && (pluginConfig.setting.import.type_insert = value);
        key === "saveType" && (pluginConfig.setting.import.type = value);
        key === "flomoUser" && (pluginConfig.account.flomo.email = value);
        key === "flomoPassword" && (pluginConfig.account.flomo.password = value);
        key === "cuboxUser" && (pluginConfig.account.cubox.email = value);
        key === "cuboxPassword" && (pluginConfig.account.cubox.password = value);
        // key === "" && (pluginConfig);

        key === "saveType" && (saveType.value = value);

        console.log(`${key}: ${value}`);
        api.updateConfig(pluginConfig);
    }

    async function testLogin(key: string, value: any) {
        const pluginConfig = api.getConfig();

        switch (key) {
            case 'flomo':
                const flomoEmail = pluginConfig.account.flomo.email;
                const flomoPassword = pluginConfig.account.flomo.password;
                const flomoToken = await loginFlomo(flomoEmail, flomoPassword);
                if (flomoToken) {
                    console.log('flomo token: ', flomoToken);
                    pluginConfig.token.flomo = flomoToken;
                }
                api.updateConfig(pluginConfig);
                break;
            case 'cubox':
                const cuboxEmail = pluginConfig.account.cubox.email;
                const cuboxPassword = pluginConfig.account.cubox.password;
                const cuboxToken = await loginCubox(cuboxEmail, cuboxPassword);
                if (cuboxToken) {
                    console.log('cubox token: ', cuboxToken);
                    pluginConfig.token.cubox = cuboxToken;
                }
                api.updateConfig(pluginConfig);
                break;
            default:
                console.log("[ERROR]配置错误 (setting)", key, value);
                break;
        }
    }
</script>