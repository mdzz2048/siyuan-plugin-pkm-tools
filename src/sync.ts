import { Dialog } from "siyuan";
import { getAllMemos } from "./api/flomo";
import { client } from "./api/siyuan";
import { GlobalConfig } from "./types/config";
import { IMemoRespData, IMemoSyncTips } from "./types/flomo";
import { PLUGIN_NAME, getConfigBlob, updatePluginConfig } from "./utils/config";
import { appendMemo, filterMemosByDate, getBlock, getIdByBoxAndHpath, getMemosUpdated, parseMemo, prependMemo, updateMemo } from "./utils/import";
import { createApp } from "vue";
import TipsVue from "./components/tips/Tips.vue";

export async function flomoSyncHandler(config: GlobalConfig) {
    const token = config.token.flomo;
    const box = config.setting.import.box;
    const path = config.setting.import.path;
    const syncType = config.setting.import.type;
    const pathDate = config.setting.import.path_date;
    const latestSlug = config.cache.flomo.latest_slug;
    const insertBefore = config.setting.import.type_insert;

    
    // 导入 Memos
    const memos = await getAllMemos(token);
    // 导入弹窗提示
    // flomoSyncTips(memos, config);

    switch (syncType) {
        case "1":   // 单文档导入
            const docId = await getIdByBoxAndHpath(box, path);
            if (latestSlug) {
                // 增量导入
                syncIncrementMemos(memos, docId, insertBefore);
            } else {
                // 全量导入
                syncAllMemos(memos, docId, insertBefore);
            }
            break;
        case "2":   // 按日期拆分
            const memosInfo = filterMemosByDate(memos, pathDate);
            console.log(memosInfo);
            console.log(latestSlug);
            if (latestSlug) {
                // 增量导入
                memosInfo.forEach(async memoInfo => {
                    const docId = await getIdByBoxAndHpath(box, memoInfo[1]);
                    syncIncrementMemos(memoInfo[0], docId, insertBefore);
                })
            } else {
                // 全量导入
                for (const memoInfo of memosInfo) {
                    const docId = await getIdByBoxAndHpath(box, memoInfo[1]);
                    syncAllMemos(memoInfo[0], docId, insertBefore);
                    setTimeout(() => {}, 1500);     // 调用过快会生成很奇怪的文档
                }
            }
            break;
        default:
            console.log('[ERROR]配置错误 (import.type)', syncType);
            return
    }

    // 更新缓存
    config.cache.flomo.latest_slug = memos[memos.length - 1].slug;
    config.cache.flomo.latest_updated = memos[memos.length - 1].updated_at;
    updatePluginConfig(PLUGIN_NAME, 'config.json', getConfigBlob(config));
}

async function flomoSyncTips(memos: IMemoRespData[], config: GlobalConfig): Promise<IMemoSyncTips[]> {
    const box = config.setting.import.box;
    const path = config.setting.import.path;
    const syncType = config.setting.import.type;
    const pathDate = config.setting.import.path_date;
    const latestSlug = config.cache.flomo.latest_slug;
    let tips: IMemoSyncTips[] = []

    switch (syncType) {
        case "1":   // 单文档导入
            const paths = path.split('/');
            const tip: IMemoSyncTips = {
                new: [],
                updated: [],
                doc: {
                    box: box,
                    path: path,
                    name: paths[paths.length - 1],
                }
            }
            if (latestSlug) {
                // 增量导入
                const [memosUpdated, memosNew] = await getMemosUpdated(memos);
                tip.new = memosNew;
                tip.updated = memosUpdated.map(memos => memos[0]);
            } else {
                // 全量导入
                tip.new = memos;
            }
            tips.push(tip);
            break;
        case "2":   // 按日期拆分
            const memosInfo = filterMemosByDate(memos, pathDate);
            if (latestSlug) {
                // 增量导入
                memosInfo.forEach(async memoInfo => {
                    const [memosUpdated, memosNew] = await getMemosUpdated(memoInfo[0]);
                    const hpath = memoInfo[1];
                    const hpaths = hpath.split('/');
                    const tip: IMemoSyncTips = {
                        new: memosNew,
                        updated: memosUpdated.map(memos => memos[0]),
                        doc: {
                            box: box,
                            path: hpath,
                            name: hpaths[hpaths.length - 1],
                        }
                    }
                    tips.push(tip);
                })
            } else {
                // 全量导入
                memosInfo.forEach(memoInfo => {
                    const hpath = memoInfo[1];
                    const hpaths = hpath.split('/');
                    const tip: IMemoSyncTips = {
                        new: memoInfo[0],
                        updated: [],
                        doc: {
                            box: box,
                            path: hpath,
                            name: hpaths[hpaths.length - 1],
                        }
                    }
                    tips.push(tip);
                })
            }
            break;
        default:
            console.log('[ERROR]配置错误 (import.type)', syncType);
            return
    }
    new Dialog({
        title: "导入提示",
        content: `<div id="PKMToolsTips" class="fn__flex-column"></div>`,
        width: "30vw",
        height: "70vh",
    })
    const app = createApp(TipsVue);
    app.provide('memosTips', tips);
    app.mount('#PKMToolsTips');
    return tips;
}

/**
 * 以文档为单位更新 Memos
 * @param memos Memos 原始返回数据
 * @param docId 需要更新的文档 ID
 * @param insertBefore 是否将新笔记插入文档开头，即：new -> old
 */
export async function syncAllMemos(memos: IMemoRespData[], docId: string, insertBefore: boolean) {
    const parsedMemos: string[] = [];
    insertBefore && (memos.reverse());  // 原始数据默认按时间逆序排列 (old -> new)
    memos.forEach(memo => {
        if (memo.deleted_at) return     // 删除的 Memo 不同步
        const parsedMemo = parseMemo(memo);
        parsedMemos.push(parsedMemo);
    })
    client.updateBlock({
        id: docId,
        data: parsedMemos.join("\n\n"),
        dataType: "markdown",
    })
}

/**
 * 以块为单位更新增量 Memos
 * @param memos Memos 原始返回数据
 * @param docId 需要更新的文档 ID
 * @param insertBefore 是否将新笔记插入文档开头，即：new -> old
 */
export async function syncIncrementMemos(memos: IMemoRespData[], docId: string, insertBefore: boolean) {
    insertBefore && (memos.reverse());  // 原始数据默认按时间逆序排列 (old -> new)
    const [memosUpdated, memosNew] = await getMemosUpdated(memos);
    const parsedMemos: string[] = [];
    // 增量更新以块级单位更新
    memosUpdated.forEach(memo => {
        const parsedMemo = parseMemo(memo[0]);
        updateMemo(parsedMemo, memo[1]);
    })
    // 增量添加汇总后插入一次
    memosNew.forEach(memo => {
        if (memo.deleted_at) return     // 删除的 Memo 不同步
        const parsedMemo = parseMemo(memo);
        parsedMemos.push(parsedMemo);
    })
    const insertMemo = insertBefore ? prependMemo : appendMemo;
    insertMemo(parsedMemos.join("\n\n"), docId);
}
