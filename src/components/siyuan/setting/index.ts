export type TabKey = string;

export interface ITab {
    key: TabKey;        // 页签唯一标识
    text: string;       // 页签标头
    focus: boolean,     // 是否聚焦
    name?: string;      // 页签名称 (data-name)
    icon?: string;      // 页签图标 (svg)
}