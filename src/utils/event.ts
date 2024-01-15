import { IEventBusMap } from "siyuan";

/* ------------------------ 文档打开事件 ------------------------ */

export function onProtyleStaticLoaded(e: CustomEvent) {
    console.log(e);
    const detail: IEventBusMap["loaded-protyle-static"] = e.detail;
    const protyle = detail.protyle;
    console.log(protyle);
    // todo: 判断是否为 Flomo 导入文档。true：检查是否存在新增、更新 Memos，并弹窗提示是否需要导入
}