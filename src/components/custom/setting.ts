import { client } from "../../api/siyuan";
import { GlobalConfig } from "../../types/config";
import { DEFAULT_CONFIG } from "../../config/default";
import { updatePluginConfig, getConfigBlob, PLUGIN_NAME, CONFIG } from "../../utils/config";
import { 
    IGroupPropsOption, IInputPropsOption, IItemPropsOption, IMiniItemPropsOption, IPanelsPropsOption, ITab, IOption 
} from "../siyuan/setting";

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

function findObjectByKey(obj: object, key: string) {
    // 如果当前对象是目标对象，则返回当前对象
    if (obj.hasOwnProperty("settingKey") && obj["settingKey"] === key) {
        return obj;
    }
    // 如果当前对象是一个数组，则遍历数组中的每个元素
    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            const result = findObjectByKey(obj[i], key);
            // 如果找到了目标对象，则返回结果
            if (result) return result
        }
    }
    // 如果当前对象是一个对象，则遍历对象的所有属性
    if (typeof obj === "object") {
        for (const prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                const result = findObjectByKey(obj[prop], key);
                // 如果找到了目标对象，则返回结果
                if (result) return result
            }
        }
    }
    // 如果没有找到目标对象，则返回 null
    return null;
}

function updateObjectByKey(obj: object, key: string, value: string) {
    // 如果当前对象是目标对象，并且具有目标键，则更新值
    if (obj?.["settingKey"] && obj["settingKey"] === key) {
        obj["settingValue"] = value;
    }
    // 如果当前对象是一个数组，则遍历数组中的每个元素
    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            updateObjectByKey(obj[i], key, value);
        }
    }
    // 如果当前对象是一个对象，则遍历对象的所有属性
    if (typeof obj === "object") {
        for (const prop in obj) {
            if (obj?.[prop]) {
                updateObjectByKey(obj[prop], key, value);
            }
        }
    }
    // 返回修改后的对象
    return obj;
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

const SETTING_CONFIG = (notebooks?: IOption[]) => { return {
    panels: [
        {
            key: "1",
            text: "Flomo",
            focus: true,
            name: "Flomo",
            icon: "#icon-pkm-tools-flomo-c",
            tabs: [
                {
                    key: "1",
                    text: "账号配置",
                    focus: true,
                    name: "账号配置",
                    icon: "#iconAccount",
                    items: [
                        {
                            title: "测试",
                            text: "点击测试连通性",
                            input: {
                                type: "button",
                                settingKey: "flomoLoginTest",
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
                    text: "导入配置",
                    focus: false,
                    name: "导入配置",
                    icon: "#iconSettings",
                    items: [
                        {
                            title: '导入位置',
                            text: '选择导入笔记本',
                            input: {
                                type: 'select',
                                settingKey: 'flomoSaveNotebook',
                                settingValue: CONFIG().setting.flomo.memo_box,
                                options: notebooks ? notebooks : [],
                            }
                        },
                        {
                            title: '插入方式',
                            text: '开启: 新笔记放在最前面;<br>关闭: 新笔记放在最后面;',
                            input: {
                                type: 'checkbox',
                                settingKey: 'flomoInsertType',
                                settingValue: `${CONFIG().setting.flomo.memo_insert_before}`,
                            }
                        },
                        {
                            title: '链接标题',
                            text: '开启: 获取 http 开头的链接的标题;<br>关闭: 保留原链接格式;<br>注意：该选项会影响导入性能',
                            input: {
                                type: 'checkbox',
                                settingKey: 'flomoGetLinkTitle',
                                settingValue: `${CONFIG().setting.flomo.get_link_title}`,
                            }
                        },
                        {
                            title: '导入方式',
                            text: '1: 全部导入一个文档;<br>2: 按创建日期拆分;',
                            input: {
                                type: 'select',
                                settingKey: 'flomoSaveType',
                                settingValue: CONFIG().setting.flomo.memo_import_type,
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
                                settingKey: 'flomoSavePath',
                                settingValue: CONFIG().setting.flomo.memo_path,
                            },
                        },
                        {
                            title: '拆分粒度',
                            text: '设置保存的路径',
                            input: {
                                type: 'select',
                                settingKey: 'flomoSaveDatePath',
                                settingValue: CONFIG().setting.flomo.memo_date_path,
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
                    text: "Daily Note",
                    focus: false,
                    name: "Daily Note",
                    icon: "#iconCalendar",
                    items: [
                        {
                            title: "日记笔记本",
                            text: "日记笔记本",
                            input: {
                                type: 'select',
                                settingKey: 'dnNotebook',
                                settingValue: CONFIG().setting.flomo?.dn_box,
                                options: notebooks ? notebooks : [],
                            }
                        },
                        {
                            title: "链接文档",
                            text: "文档右键菜单引用 Memos 时链接到该文档",
                            input: {
                                type: "text",
                                settingKey: "dnLinkDoc",
                                settingValue: CONFIG().setting.flomo?.dn_link_doc,
                            }
                        },
                        {
                            title: '链接插入最前',
                            text: '文档右键菜单引用 Memos 时插入的位置。<br>开启后将引用插入文档最前方',
                            input: {
                                type: 'checkbox',
                                settingKey: 'dnInsertType',
                                settingValue: `${CONFIG().setting.flomo?.dn_insert_before}`
                            }
                        },
                        {
                            title: '链接使用块引',
                            text: '文档右键菜单引用 Memos 时的引用方式。<br>开启后将使用块引用方式链接',
                            input: {
                                type: 'checkbox',
                                settingKey: 'dnUseRef',
                                settingValue: `${CONFIG().setting.flomo?.dn_use_ref}`
                            }
                        },
                    ],
                },
            ]
        },
        {
            key: "2",
            text: "Cubox",
            focus: false,
            name: "Cubox",
            icon: "#icon-pkm-tools-cubox-c",
            tabs: [
                {
                    key: "1",
                    text: "账号配置",
                    focus: true,
                    name: "账号配置",
                    icon: "#iconAccount",
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
                {
                    key: "2",
                    text: "导入配置",
                    focus: true,
                    name: "导入配置",
                    icon: "#iconSettings",
                    items: [
                        {
                            title: '导入位置',
                            text: '选择导入笔记本',
                            input: {
                                type: 'select',
                                settingKey: 'cuboxSaveNotebook',
                                settingValue: CONFIG().setting.cubox.article_box,
                                options: notebooks ? notebooks : [],
                            }
                        },
                        {
                            title: '导入方式',
                            text: '1: 全部导入一个文档;<br>2: 按创建日期拆分;',
                            input: {
                                type: 'select',
                                settingKey: 'cuboxSaveType',
                                settingValue: CONFIG().setting.cubox.article_import_type,
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
                                settingKey: 'cuboxSavePath',
                                settingValue: CONFIG().setting.cubox.article_path,
                            },
                        },
                        {
                            title: '拆分粒度',
                            text: '设置保存的路径',
                            input: {
                                type: 'select',
                                settingKey: 'cuboxSaveDatePath',
                                settingValue: CONFIG().setting.cubox.article_date_path,
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
                    key: "3",
                    text: "模板配置",
                    focus: false,
                    name: "模板配置",
                    icon: "#iconMarkdown",
                    items: [],
                    groups: [
                        {
                            title: "文档模板",
                            isGroup: true,
                            miniItems: [
                                {
                                    title: "点击测试",
                                    input: {
                                        type: "button",
                                        settingKey: "cuboxDocTemplateTest",
                                        settingValue: "点击测试"
                                    },
                                    minWidth: "100%",
                                    marginRight: "0px",
                                    fullWidth: true
                                },
                                {
                                    title: "模板配置",
                                    input: {
                                        type: "textarea",
                                        settingKey: "cuboxDocTemplate",
                                        settingValue: CONFIG().setting.cubox.article_template,
                                        style: "width: 300px; height: 100px",
                                    },
                                    minWidth: "100%",
                                    marginRight: "0px",
                                    fullWidth: true
                                },
                                {
                                    title: "解析内容",
                                    input: {
                                        type: "textarea",
                                        settingKey: "cuboxDocTemplateParsed",
                                        settingValue: "",
                                        style: "width: 300px; height: 100px",
                                        readonly: true,
                                        alterable: false,
                                    },
                                    minWidth: "100%",
                                    marginRight: "0px",
                                    fullWidth: true
                                }
                            ]
                        }
                    ]
                },
            ]
        },
        {
            key: "3",
            text: "Writeathon",
            focus: false,
            name: "Writeathon",
            icon: "#icon-pkm-tools-writeathon-c",
            tabs: [
                {
                    key: "1",
                    text: "账号配置",
                    focus: true,
                    name: "账号配置",
                    icon: "#iconAccount",
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
                                        settingKey: "writeathonUser",
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
                                        settingKey: "writeathonPassword",
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
            ],
        },
    ]
} as ISettingConfig }

export type { ISettingConfig, ISettingItemInfo, ISettingGroupInfo, ISettingHindItem };
export {
    PLUGIN_NAME,
    DEFAULT_CONFIG,
    SETTING_CONFIG,

    updateConfig,
    getNotebookOptions, 
    findObjectByKey,
    updateObjectByKey,
};
