import { client } from "../../api/siyuan";
import { GlobalConfig } from "../../types/config";
import { DEFAULT_CONFIG } from "../../config/default";
import { updatePluginConfig, getConfigBlob, PLUGIN_NAME, CONFIG } from "../../utils/config";
import type { IOption } from "../siyuan/setting/input";
import { IGroupPropsOption, IInputPropsOption, IItemPropsOption, IMiniItemPropsOption, IPanelsPropsOption, ITab } from "../siyuan/setting";

/**
 * 获取思源笔记本信息
 * @returns 符合 IOption 配置接口的思源笔记本信息
 */
async function getNotebookOptions(): Promise<IOption[]> {
    const response = await client.lsNotebooks();
    const options = response.data.notebooks.map(notebook => {
        return {
            key: notebook.id,
            text: notebook.name,
        } as IOption
    })
    return options;
}

/**
 * 更新插件配置文件 (config.json)
 * @param config 插件配置文件
 */
function updateConfig(config: GlobalConfig) {
    const configBlob = getConfigBlob(config);
    updatePluginConfig(PLUGIN_NAME, "config.json", configBlob);
}

/**
 * 设置界面表单输入事件
 * @param key settingKey: 
 * @param value settingValue: 
 * @param pluginConfig 插件配置文件
 */
function changed(key: string, value: any, pluginConfig: GlobalConfig) {

    key === "flomoUser" && (pluginConfig.account.flomo.email = value);
    key === "flomoPassword" && (pluginConfig.account.flomo.password = value);
    key === "saveNotebook" && (pluginConfig.setting.import.box = value);
    key === "savePathByDate" && (pluginConfig.setting.import.path_date = value);
    key === "savePath" && (pluginConfig.setting.import.path = value);
    key === "insertType" && (pluginConfig.setting.import.type_insert = value);
    key === "saveType" && (pluginConfig.setting.import.type = value);
    // key === "" && (pluginConfig);

    console.log(`${key}: ${value}`);
    updateConfig(pluginConfig);
}

/**
 * 设置界面点击事件
 * @param key 
 * @param value 
 */
function clicked(key: string, value: any) {
    console.log(key);
    console.log(value);
}

/* ------------------------ 设置界面的 interface 定义 ------------------------ */

interface ISettingConfig extends IPanelsPropsOption{
    panels: ISettingPanel[],
}

interface ISettingPanel extends ITab {
    tabs?: ISettingTab[],
    items?: ISettingItemInfo[],
    groups?: ISettingGroupInfo[],
}

interface ISettingTab extends ITab {
    items?: ISettingItemInfo[],
    groups?: ISettingGroupInfo[],
}

interface ISettingItemInfo extends IItemPropsOption {
    input: IInputPropsOption,
    isGroup?: boolean,
}

interface ISettingGroupInfo extends IGroupPropsOption {
    miniItems: ISettingMiniItemInfo[],
    isGroup?: boolean,
}

interface ISettingMiniItemInfo extends IMiniItemPropsOption {
    input: IInputPropsOption,
}

interface ISettingHindItem {
    [key: string]: {
        hind: boolean,
        fn: (config: GlobalConfig) => boolean
    }
}

const SETTING_CONFIG = () => { return {
    panels: [
        {
            key: "1",
            text: "常规设置",
            focus: true,
            name: "常规设置",
            icon: "#iconSettings",
            items: [
                {
                    title: '导入位置',
                    text: '选择导入笔记本',
                    input: {
                        type: 'select',
                        settingKey: 'saveNotebook',
                        settingValue: CONFIG().setting.import.box,
                        options: [],
                    }
                },
                {
                    title: '插入方式',
                    text: '开启: 新笔记放在最前面;<br>关闭: 新笔记放在最后面;',
                    input: {
                        type: 'checkbox',
                        settingKey: 'insertType',
                        settingValue: `${CONFIG().setting.import.type_insert}`,
                        options: [
                            { key: "1", text: "插入前置子块" },
                            { key: "2", text: "插入后置子块" }
                        ] as IOption[]
                    }
                },
                {
                    title: '导入方式',
                    text: '1: 全部导入一个文档;<br>2: 按创建日期拆分;',
                    input: {
                        type: 'select',
                        settingKey: 'saveType',
                        settingValue: CONFIG().setting.import.type,
                        options: [
                            { key: "1", text: "导入文档" },
                            { key: "2", text: "按日期拆分" }
                        ] as IOption[]
                    }
                },
                {
                    title: '保存路径',
                    text: '设置保存文档路径',
                    input: {
                        type: 'text',
                        settingKey: 'savePath',
                        settingValue: CONFIG().setting.import.path,
                    },
                },
                {
                    title: '拆分粒度',
                    text: '设置保存的路径',
                    input: {
                        type: 'select',
                        settingKey: 'savePathByDate',
                        settingValue: CONFIG().setting.import.path_date,
                        options: [
                            { key: "1", text: "年" },
                            { key: "2", text: "年/年-月" },
                            { key: "3", text: "年/年-月/年月日" }
                        ] as IOption[]
                    },
                }
            ],
        },
        {
            key: "2",
            text: "其他设置",
            focus: false,
            name: "其他设置",
            icon: "#iconDownload",
            tabs: [
                {
                    key: "1",
                    text: "Flomo",
                    focus: true,
                    name: "Flomo",
                    icon: "#iconFlomo",
                    items: [
                        {
                            title: "测试",
                            text: "点击测试连通性",
                            input: {
                                type: "button",
                                settingKey: "flomo",
                                settingValue: "测试"
                            }
                        }
                    ],
                    groups: [
                        {
                            title: "账号信息",
                            isGroup: true,
                            miniItems: [
                                {
                                    title: "账号",
                                    input: {
                                        type: "text",
                                        settingKey: "flomoUser",
                                        settingValue: CONFIG().account.flomo.email
                                    },
                                    minWidth: "100%",
                                    marginRight: "0px",
                                    fullWidth: true
                                },
                                {
                                    title: "密码",
                                    input: {
                                        type: "password",
                                        settingKey: "flomoPassword",
                                        settingValue: CONFIG().account.flomo.password
                                    },
                                    minWidth: "100%",
                                    marginRight: "0px",
                                    fullWidth: true
                                }
                            ]
                        },
                    ]
                },
                {
                    key: "2",
                    text: "Writeathon",
                    focus: false,
                    name: "Writeathon",
                    icon: "#iconWriteathon",
                    items: [],
                    groups: [
                        {
                            title: "账号信息",
                            isGroup: true,
                            miniItems: [
                                {
                                    title: "账号",
                                    input: {
                                        type: "text",
                                        settingKey: "WriteathonUser",
                                        settingValue: CONFIG().account.writeathon.email
                                    },
                                    minWidth: "100%",
                                    marginRight: "0px",
                                    fullWidth: true
                                },
                                {
                                    title: "密码",
                                    input: {
                                        type: "password",
                                        settingKey: "WriteathonPassword",
                                        settingValue: CONFIG().account.writeathon.password
                                    },
                                    minWidth: "100%",
                                    marginRight: "0px",
                                    fullWidth: true
                                }
                            ]
                        },
                    ]
                },
                {
                    key: "3",
                    text: "Cubox",
                    focus: false,
                    name: "Cubox",
                    icon: "#iconCubox",
                    items: [],
                    groups: [
                        {
                            title: "账号信息",
                            isGroup: true,
                            miniItems: [
                                {
                                    title: "账号",
                                    input: {
                                        type: "text",
                                        settingKey: "cuboxUser",
                                        settingValue: CONFIG().account.cubox.email
                                    },
                                    minWidth: "100%",
                                    marginRight: "0px",
                                    fullWidth: true
                                },
                                {
                                    title: "密码",
                                    input: {
                                        type: "password",
                                        settingKey: "cuboxPassword",
                                        settingValue: CONFIG().account.cubox.password
                                    },
                                    minWidth: "100%",
                                    marginRight: "0px",
                                    fullWidth: true
                                }
                            ]
                        },
                    ]
                },
            ]
        },
        {
            key: "3",
            text: "导入模板",
            focus: false,
            name: "导入模板",
            icon: "#iconMarkdown",
            tabs: [
                {
                    key: "1",
                    text: "Flomo",
                    focus: true,
                    name: "Flomo",
                    icon: "#iconFlomo",
                    items: [
                        {
                            title: "文档模板",
                            text: "使用文档模板",
                            input: {
                                type: "textarea",
                                settingKey: "文档模板",
                                settingValue: "this is"
                            }
                        }
                    ],
                },
                {
                    key: "2",
                    text: "Writeathon",
                    focus: false,
                    name: "Writeathon",
                    icon: "#iconWriteathon",
                    items: [
                        {
                            title: "文档模板",
                            text: "使用文档模板",
                            input: {
                                type: "textarea",
                                settingKey: "文档模板",
                                settingValue: "this is"
                            }
                        }
                    ],
                },
                {
                    key: "3",
                    text: "Cubox",
                    focus: false,
                    name: "Cubox",
                    icon: "#iconCubox",
                    items: [
                        {
                            title: "文档模板",
                            text: "使用文档模板",
                            input: {
                                type: "textarea",
                                settingKey: "文档模板",
                                settingValue: "this is"
                            }
                        }
                    ],
                },
            ]
        }
    ]
} as ISettingConfig}

export type { ISettingConfig, ISettingItemInfo, ISettingGroupInfo, ISettingHindItem };
export {
    PLUGIN_NAME,
    DEFAULT_CONFIG,
    SETTING_CONFIG,

    updateConfig,
    getNotebookOptions, 
    changed,
    clicked
};
