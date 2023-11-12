export interface ITab {
    key: string;        // 页签唯一标识
    text: string;       // 页签标头
    focus: boolean,     // 是否聚焦
    name?: string;      // 页签名称 (data-name)
    icon?: string;      // 页签图标 (svg)
}

export interface IOption {
    key: string,
    text: string,
}

export interface ILimits { 
    min: number,
    max: number,
    step: number
};

/* ------------------------ vue 组件 props 参数 ------------------------ */

export interface IPanelsPropsOption {
    panels: ITab[],             // 面板标签列表
    searchEnable?: boolean,     // 是否启用搜索
    searchPlaceholder?: string, // 搜索提示内容
    searchValue?: string,       // 搜索框内容
}

export interface IPanelPropsOption {
    name: string,               // 面板名称
    top?: boolean,              // 是否移除面板上下边距
    display?: boolean,          // 是否显示面板
}

export interface ITabsPropsOption {
    tabs: ITab[],
}

export interface IItemPropsOption {
    title: string,              // 标题
    text: string,               // 提示文本
    block?: boolean,            // 是否占据整行
}

export interface IGroupPropsOption {
    title: string,              // 标题
}

export interface IMiniItemPropsOption {
    title: string,              // 标题
    icon?: string,              // 图标
    minWidth?: string,          // 最小宽度
    marginRight?: string,       // 右侧外边距
    fullWidth?: boolean,        // 是否取消 (.fn__space)
}

type IInputType = "button" | "checkbox" | "number" | "password" | "select" | "slider" | "text" | "textarea"
export interface IInputPropsOption {
    type: IInputType,               // 类型
    settingKey: string,             // 标识符
    settingValue: string,           // 绑定的值
    style?: string,                 // 绑定样式
    limit?: ILimits,                // 可选范围 ({ min: 0, max: 100, step: 1 }) | slider, number
    options?: IOption[],            // 可选列表 ({ key: string, text: string }[]) | select
    placeholder?: string,           // 占位文本 | text, textarea
    block?: boolean,                // 使用 fn__block (width: 100%;)
    normal?: boolean,               // 使用 fn__size200 (width: 200px)
    readonly?: boolean,             // 只读
    disabled?: boolean,             // 禁用交互
    alterable?: boolean,            // 数据是否可变
}