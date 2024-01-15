import regexp from "../../utils/regexp";
import TurndownService from "turndown";
import { showMessage } from "siyuan";
import { getAllMemos } from "./api";
import { IMemoRespData } from "./flomo";
import { flomoSyncType, getHpathByDate } from "../../utils/setting";
import { CONFIG, PLUGIN_NAME, getConfigBlob, updatePluginConfig } from "../../utils/config";
import { 
    cacheAttrInfo, cacheBlockInfo, replaceAllMdUrlTitle, getBlock, getBlockIdByHpath, insertBlock, updateBlock 
} from "../../utils/import";


/* ------------------------ Flomo 导入流程 ------------------------ */

export async function flomoSyncHandler() {
    const config = CONFIG();
    const box = config.setting.flomo.memo_box;
    const path = config.setting.flomo.memo_path;
    const pathDate = config.setting.flomo.memo_date_path;
    const insertBefore = config.setting.flomo.memo_insert_before;
    
    // 导入 Memos
    const memos = await getAllMemos(config.token.flomo);
    // 导入弹窗提示
    const [newMemos, updatedMemos] = await getUpdatedAndNewMemos(memos);
    showMessage(`更新笔记: ${newMemos.length} 条，新笔记: ${updatedMemos.length} 条`);      // 先用弹消息过度一下

    switch (flomoSyncType()) {
        case "singleFileAll": {
            // 单文档全量导入
            const docId = await getBlockIdByHpath(box, path);
            addMemosWithDoc(memos, docId, insertBefore);
            break;
        }
        case "singleFileIncrement": {
            // 单文档增量导入
            const docId = await getBlockIdByHpath(box, path);
            addMemosWithBlock(memos, docId, insertBefore);
            break;
        }
        case "datePathAll": {
            // 按日期拆分路径的全量导入
            const memosInfo = filterMemosWithPath(memos, pathDate);
            for (const memoInfo of memosInfo) {
                const docId = await getBlockIdByHpath(box, memoInfo[1]);
                addMemosWithDoc(memoInfo[0], docId, insertBefore);
                setTimeout(() => {}, 3000);     // 调用过快会生成很奇怪的文档
            }
            break;
        }
        case "datePathIncrement": {
            // 按日期拆分路径的增量导入
            const memosInfo = filterMemosWithPath(memos, pathDate);
            for (const memoInfo of memosInfo) {
                const docId = await getBlockIdByHpath(box, memoInfo[1]);
                addMemosWithBlock(memoInfo[0], docId, insertBefore);
                setTimeout(() => {}, 3000);     // 调用过快会生成很奇怪的文档
            }
            break;
        }
    }

    // 更新缓存
    config.cache.flomo.latest_slug = memos[memos.length - 1].slug;
    config.cache.flomo.latest_updated = memos[memos.length - 1].updated_at;
    updatePluginConfig(PLUGIN_NAME, 'config.json', getConfigBlob(config));
}

/**
 * 以文档为单位更新 Memos
 * @param memos Memos 原始返回数据
 * @param docId 需要更新的文档 ID
 * @param insertBefore 是否将新笔记插入文档开头，即：new -> old
 */
export async function addMemosWithDoc(memos: IMemoRespData[], docId: string, insertBefore: boolean) {
    const parsedMemos: string[] = [];
    const memosBlockCach = await cacheBlockInfo("custom-flomo-slug");
    insertBefore && (memos.reverse());  // 原始数据默认按时间逆序排列 (old -> new)
    // 文档更新汇总后更新一次
    memos.forEach(memo => {
        const block = memosBlockCach.find(item => item?.ial.includes(memo.slug));
        const parsedMemo = getMemoMarkdown(memo, block?.id);
        parsedMemos.push(parsedMemo);
    })
    const markdown = CONFIG().setting.flomo.get_link_title 
        ? await replaceAllMdUrlTitle(parsedMemos.join("\n\n"))  // 配置了在导入时获取链接标题
        : parsedMemos.join("\n\n")
    updateBlock(markdown, docId);
}

/**
 * 以块为单位更新增量 Memos
 * @param memos Memos 原始返回数据
 * @param docId 需要更新的文档 ID
 * @param insertBefore 是否将新笔记插入文档开头，即：new -> old
 */
export async function addMemosWithBlock(memos: IMemoRespData[], docId: string, insertBefore: boolean) {
    insertBefore && (memos.reverse());  // 原始数据默认按时间逆序排列 (old -> new)
    const [memosUpdated, memosNew] = await getUpdatedAndNewMemos(memos);
    const parsedMemos: string[] = [];
    // 增量更新以块级单位更新
    memosUpdated.forEach(memo => {
        const blockId = memo[1];
        const markdown = getMemoMarkdown(memo[0]);
        updateBlock(markdown, blockId);
    })
    // 增量添加汇总后插入一次
    memosNew.forEach(memo => {
        const parsedMemo = getMemoMarkdown(memo);
        parsedMemos.push(parsedMemo);
    })
    const markdown = CONFIG().setting.flomo.get_link_title 
        ? await replaceAllMdUrlTitle(parsedMemos.join("\n\n"))  // 配置了在导入时获取链接标题
        : parsedMemos.join("\n\n")
    insertBlock(markdown, docId, insertBefore ? "prepend" : "append")
}

/**
 * 根据模板解析 Memo 返回数据
 * @param memo Memo 原始返回数据
 * @returns 适配思源的格式
 */
export function getMemoMarkdown(memo: IMemoRespData, id?: string): string {
    const slug = memo.slug;
    const created = memo.created_at;
    const updated = memo.updated_at;

    let markdown = convertHtmlToMarkdown(memo.content);
    const files = memo.files.map(file => {
        if (file.type === "audio") {
            return `<audio controls="controls" src="${file.url}" data-src=""></audio>`
        } else if(file.type === "image") {
            return `![](${file.url})`
        }
    });
    memo.tags.map(tag => {
        markdown = markdown.replace(`#${tag}`, `#${tag}#`)
    });
    markdown = markdown.replaceAll('\\_', '_');    // turndown 转换过于激进，_ 会被转成 \_
    markdown = markdown.replaceAll(regexp.weburl, '[$&]($&)');

    // todo: [Templates | Nunjucks中文文档 | Nunjucks中文网](https://www.nunjucks.cn/templating)
    const ial = id 
        ? `{: custom-created-time="${created}" custom-updated-time="${updated}" custom-flomo-slug="${slug}" id="${id}"}`
        : `{: custom-created-time="${created}" custom-updated-time="${updated}" custom-flomo-slug="${slug}"}`
    const card = `{{{row\n\n${markdown}\n\n${files.join('\n')}\n}}}\n` + ial;
    return card
}

interface IBlockLinkInfo {
    id: string,
    fcontent: string,
}
/**
 * 根据日期获取 Memos 的链接信息
 * @param memos flomo 原始返回值
 * @param date 指定的日期，Date 可解析的字符串
 * @returns memosLink: Memos 的链接信息
 */
export async function getMemosRefByDate(memos: IMemoRespData[], date: string): Promise<IBlockLinkInfo[]> {
    const dateMemos = memos.filter(memo => isTimeInDate(memo.created_at, date));
    // 获取思源的 Memos 数据缓存
    const cacheBlock = await cacheBlockInfo("custom-flomo-slug");
    const blockLinks: IBlockLinkInfo[] = [];
    dateMemos.forEach(memo => {
        const block = cacheBlock.find(block => block.ial.includes(memo.slug));
        // 跳过思源没有缓存的（新增的）
        if (!block) return;
        blockLinks.push({ id: block.id, fcontent: block.fcontent } as IBlockLinkInfo);
    })
    return blockLinks;
}

/**
 * 在指定文档插入当天的 Memos 引用
 * @param memos flomo 原始返回值
 * @param date 指定日期，Date 可解析字符串
 * @param docId 需要插入的文档
 * @returns 当天是否存在 Memos
 */
export async function insertMemosRef(memos: IMemoRespData[], date: string, docId: string): Promise<boolean> {
    let markdown = "";
    const blockLinks = await getMemosRefByDate(memos, date);
    if (blockLinks.length === 0) {
        return false;
    }
    const data = blockLinks.map(block => {
        const useRef = CONFIG().setting.flomo.dn_use_ref;
        return useRef ? `((${block.id} "${block.fcontent}"))` : `[${block.fcontent}](siyuan://blocks/${block.id})`
    })
    const linkDoc = CONFIG().setting.flomo.dn_link_doc;
    if (linkDoc) {
        const block = await getBlock(linkDoc);
        const docLink = `((${linkDoc} "${block.content}"))`;
        markdown = '- ' + docLink + '\n    - ' + data.join('\n    - ');
    } else {
        markdown = '- ' + data.join('\n- ');
    }
    const insertBefore = CONFIG().setting.flomo.dn_insert_before;
    insertBlock(markdown, docId, insertBefore ? "prepend" : "append");
}

/**
 * 区分新创建的 Memos 和 更新的 Memos
 * @param memos 获取更新过的 Memos
 * @returns [更新的 Memos, 新的 Memos]
 */
export async function getUpdatedAndNewMemos(memos: IMemoRespData[]): Promise<[[IMemoRespData, string][], IMemoRespData[]]> {
    const cachMemosId = await cacheAttrInfo("custom-flomo-slug");
    const cachMemosUpdated = await cacheAttrInfo("custom-updated-time");
    const memosNew: IMemoRespData[] = [];
    const memosUpdated: [IMemoRespData, string][] = [];
    memos.forEach(memo => {
        const attrSlug = cachMemosId.find(attr => attr.value === memo.slug);
        // 思源没有缓存，需要插入
        if (!attrSlug) { memosNew.push(memo); return }
        // 思源缓存时间和 Flomo 更新时间一致，无需更新
        const attrUpdated = cachMemosUpdated.find(attr => attr.block_id === attrSlug.block_id);
        if (attrUpdated && memo.updated_at === attrUpdated.value) return
        memosUpdated.push([memo, attrSlug.id]);
    })
    return [memosUpdated, memosNew];
}

/**
 * 获取 "按日期拆分" 保存方式对应的文档路径，以及对应时间内创建的 Memos
 * @param memos flomo 原始返回数据
 * @param datePath 设置中的拆分粒度
 * @returns [指定粒度的时间内创建的 Memos, 指定粒度的路径]
 */
export function filterMemosWithPath(memos: IMemoRespData[], datePath: string): [IMemoRespData[], string][] {
    const memosGroups: [IMemoRespData[], string][] = [];
    memos.forEach(memo => {
        const hpath = getHpathByDate(memo.created_at, datePath);
        const existGroup = memosGroups.find((group) => hpath === group[1]);
        if (existGroup) {
            existGroup[0].push(memo);
        } else {
            const newGroup: [IMemoRespData[], string] = [[memo], hpath];
            memosGroups.push(newGroup);
        }
    })
    return memosGroups;
}

/* ------------------------ Tools ------------------------ */

export function isTimeInDate(time: string, date: string) {
    const todayDate = new Date(Date.parse(date));
    const timestamp = new Date(Date.parse(time)).getTime();
    const today = todayDate.getTime();
    const tomorrow = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() + 1).getTime() - 1;
    return today < timestamp && timestamp < tomorrow;
}

export function convertHtmlToMarkdown(html: string) {
    const turndownService = new TurndownService();
    const markdown = turndownService.turndown(html);
    return markdown;
}
