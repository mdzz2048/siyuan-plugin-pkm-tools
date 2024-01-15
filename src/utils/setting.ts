import { CONFIG } from "./config";

/**
 * 根据配置文件，获取指定时间的，"按日期拆分"保存方式对应的文档 hpath
 * @param date Date 可解析的字符串格式时间
 * @param datePath "按日期拆分"的拆分方式
 * @returns hpath
 */
export function getHpathByDate(date: string, datePath: string): string {
    const time = new Date(Date.parse(date));
    const year = time.getFullYear();
    const month = time.getMonth() < 9 ? `0${time.getMonth() + 1}` : time.getMonth() + 1;
    const day = time.getDate();
    switch (datePath) {
        case "1": 
            return `/${year}`;
        case "2":
            return `/${year}/${year}-${month}`;
        case "3":
            return `/${year}/${year}-${month}/${year}-${month}-${day}`
        default:
            console.error('[ERROR]配置错误 (import.path_data): ', datePath);
    }
}


// todo: 这个还是塞到 /apps/flomo/utils 里面比较好，和插件本体内容无关
type TFlomoSyncType = "singleFileIncrement" | "singleFileAll" | "datePathIncrement" | "datePathAll";
export const flomoSyncType = () => {
    const importType = CONFIG().setting.flomo.memo_import_type;
    const latestSlug = CONFIG().cache.flomo.latest_slug;
    switch (importType) {
        case "1": { // 单文档导入
            const syncType: TFlomoSyncType = latestSlug ? "singleFileIncrement" : "singleFileAll";
            return syncType;
        }
        case "2": { // 按日期拆分
            const syncType: TFlomoSyncType = latestSlug ? "datePathIncrement" : "datePathAll";
            return syncType;
        }
        default:
            console.error('[ERROR]配置错误 (import.type)', importType);
            return
    }
}