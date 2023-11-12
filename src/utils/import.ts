import TurndownService from "turndown";
import { client } from "../api/siyuan";
import { IMemoRespData } from "../types/flomo";
import { Attribute, Block } from "../types/siyuan";
import regexp from "./regexp";
import { getAllMemos } from "../api/flomo";
import { CONFIG } from "./config";

/**
 * 根据日期获取 Memos
 * @param date 指定的日期
 * @returns newMemos: 未导入思源的 Memos; memosLink: Memos 的链接; memosRef: Memos 的引用
 */
export async function getMemosRefByDate(date: string): Promise<[IMemoRespData[], string[], string[]]> {
    const token = CONFIG().token.flomo;
    // 获取指定日期的 Memos
    const memos = await getAllMemos(token);
    const dateMemos = memos.filter(memo => timeInDate(memo.created_at, date));
    // 获取思源的 Memos 数据缓存
    const cacheBlock = await cacheBlockInfo("custom-flomo-slug");
    const newMemos: IMemoRespData[] = [], memosLink: string[] = [], memosRef: string[] = [];
    dateMemos.forEach(memo => {
        const block = cacheBlock.find(block => block.ial.includes(memo.slug));
        // 跳过思源没有缓存的
        if (!block) { newMemos.push(memo); return }
        // 根据思源块 ID 拼接反向链接或者链接
        memosRef.push(`((${block.id} "${block.fcontent}"))`);
        memosLink.push(`[${block.fcontent}](${block.id})`)
    })
    return [newMemos, memosLink, memosRef];
}

function timeInDate(time: string, today: string) {
    const date = new Date(Date.parse(today));
    const timestamp = new Date(Date.parse(time)).getTime();
    const todayDate = date.getTime();
    const tomorrow = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getTime() - 1;
    return todayDate < timestamp && timestamp < tomorrow;
}

export async function inDailyNoteBox(blockId: string, box: string): Promise<boolean> {
    const block = await getBlock(blockId);
    return block.box === box;
}

/**
 * 获取 "按日期拆分" 保存方式对应的文档路径，以及对应时间内创建的 Memos
 * @param memos flomo 原始返回数据
 * @param path 设置中的拆分粒度
 * @returns [指定粒度的时间内创建的 Memos, 指定粒度的路径]
 */
export function filterMemosByDate(memos: IMemoRespData[], path: string): [IMemoRespData[], string][] {
    const memosGroups: [IMemoRespData[], string][] = [];
    memos.forEach(memo => {
        const hpath = getHpathByDate(memo.created_at, path);
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

/**
 * 区分新创建的 Memos 和 更新的 Memos
 * @param memos 获取更新过的 Memos
 * @returns [更新的 Memos, 新的 Memos]
 */
export async function getMemosUpdated(memos: IMemoRespData[]): Promise<[[IMemoRespData, string][], IMemoRespData[]]> {
    const memosAttrCach = await cacheAttrInfo("custom-created-time");
    const memosBlockCach = await cacheBlockInfo("custom-flomo-slug");
    const memosNew: IMemoRespData[] = [];
    const memosUpdated: [IMemoRespData, string][] = [];
    memos.forEach(memo => {
        const block = memosBlockCach.find(item => item?.ial.includes(memo.slug));
        // 思源没有缓存，需要插入
        if (!block) { memosNew.push(memo); return }
        // 思源缓存时间和 Flomo 更新时间一致，无需更新
        const attr = memosAttrCach.find(item => item.block_id === block.id);
        if (attr && memo.created_at === attr.value) return
        memosUpdated.push([memo, block.id]);
    })
    return [memosUpdated, memosNew];
}

/**
 * 根据配置文件，获取指定时间的，"按日期拆分"保存方式对应的文档 hpath
 * @param date 字符串格式的时间
 * @param path "按日期拆分"的拆分方式
 * @returns hpath
 */
export function getHpathByDate(date: string, path: string): string {
    let hpath = "";
    const time = new Date(Date.parse(date));
    const year = time.getFullYear();
    const month = time.getMonth() < 9 ? `0${time.getMonth() + 1}` : time.getMonth() + 1;
    const day = time.getDate();
    switch (path) {
        case "1": 
            hpath = `/${year}`;
            break;
        case "2":
            hpath = `/${year}/${year}-${month}`;
            break;
        case "3":
            hpath = `/${year}/${year}-${month}/${year}-${month}-${day}`
            break;
        default:
            console.log('[ERROR]配置错误 (import.path_data): ', path);
    }
    return hpath;
}

/**
 * 根据笔记本 ID 和 Hpath 获取文档 ID
 * @param box 笔记本 ID
 * @param hpath 文档的 Hpath
 * @returns 文档 ID
 */
export async function getIdByBoxAndHpath(box: string, hpath: string): Promise<string> {
    const response = await client.sql({
        stmt: `SELECT * FROM blocks WHERE hpath='${hpath}' AND box='${box}' AND type='d'`,
    })
    if (response.data.length === 1) {
        return (response.data[0] as Block).id;
    } else if (response.data.length > 0) {
        console.log("[INFO]获取导入文档 (import.path): ", response.data);
        return (response.data[0] as Block).id;
    } else {
        const response = await client.createDocWithMd({
            notebook: box,
            path: hpath, 
            markdown: ""
        })
        console.log("[INFO]自动生成路径: ", hpath, response.data);
        return response.data;
    }
}

export async function getBlock(blockId: string) {
    const response = await client.sql({
        stmt: `SELECT * FROM blocks WHERE id="${blockId}"`
    })
    return response.data[0] as Block;
}

/**
 * 把 HTML 格式的 Memo 转成 MarkDown 格式
 * @param html Memo 的 HTML 原文
 * @returns MarkDown 格式的 Memo
 */
function parseHtml2Md(html: string): string {
    const turndownService = new TurndownService();
    const markdown = turndownService.turndown(html);
    return markdown;
}

/**
 * 根据模板解析 Memo 返回数据
 * @param memo Memo 原始返回数据
 * @returns 适配思源的格式
 */
export function parseMemo(memo: IMemoRespData, id?: string): string {
    const slug = memo.slug;
    const created_at = memo.created_at;
    const updated_at = memo.updated_at;

    let markdown = parseHtml2Md(memo.content);
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
        ? `{: custom-created-time="${created_at}" custom-updated-time="${updated_at}" custom-flomo-slug="${slug}" id="${id}"}`
        : `{: custom-created-time="${created_at}" custom-updated-time="${updated_at}" custom-flomo-slug="${slug}"}`
    const card = `{{{row\n\n${markdown}\n\n${files.join('\n')}\n}}}\n` + ial;
    return card
}

/**
 * 缓存思源中存在 Memo 自定义属性的块
 * @returns 存在 Memo 自定义属性的块
 */
export async function cacheBlockInfo(key: string): Promise<Block[]> {
    const response = await client.sql({
        stmt: `SELECT * FROM blocks WHERE ial LIKE '%${key}=%' LIMIT 9999999`
    })
    return response.data as Block[]
}

export async function cacheAttrInfo(key: string): Promise<Attribute[]> {
    const response = await client.sql({
        stmt: `SELECT * FROM attributes WHERE name='${key}' LIMIT 99999999`
    })
    return response.data as Attribute[]
}

/**
 * 获取网页标题
 * @param url 网页 URL
 * @returns URL 对应网页的 title
 */
export async function getUrlTitle(url: string): Promise<string> {
    // todo: 微信的文章 title 标签是空的，标题在 <meta> 里 
    // <meta property="og:title" content="xxx"/>
    const response = await fetch(url);
    if (!response.ok) return;
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.querySelector('title')?.textContent;
}

export async function getAllMdUrlTitle(markdown: string): Promise<string> {
    const regex = /(?<!\!)\[.*?\]\((http.*?)\)/g;
    const promises: Promise<string>[] = [];
    // 提取链接
    const links = [...markdown.matchAll(regex)];
    links.forEach(link => promises.push(getUrlTitle(link[1])));
    // 获取链接标题
    const titles = await Promise.allSettled(promises);
    // 替换链接文本
    titles.forEach((result, index) => {
        const link = links[index][0];
        const url = links[index][1];
        if (result.status === "fulfilled" && result.value !== "") {
            const title = result.value;
            markdown = markdown.replace(link, `[${title}](${url})`);
        }
    })
    return markdown;
}

/**
 * 插入前置 Memo
 * @param memo 笔记文本
 * @param parentId 文档 ID
 * @returns 插入笔记的 ID
 */
export async function appendMemo(memo: string, parentId: string) {
    const response = await client.appendBlock({
        data: memo,
        dataType: "markdown",
        parentID: parentId,
    })
    const block_id = response.data[0].doOperations[0].id;
    return block_id;
}

/**
 * 插入后置 Memo
 * @param memo 笔记文本
 * @param parentId 文档 ID
 * @returns 插入笔记的 ID
 */
export async function prependMemo(memo: string, parentId: string) {
    const response = await client.prependBlock({
        data: memo,
        dataType: "markdown",
        parentID: parentId,
    })
    const block_id = response.data[0].doOperations[0].id;
    return block_id;
}

/**
 * 更新 Memo
 * @param memo 笔记文本
 * @param blockId 笔记 ID
 * @returns 笔记 ID
 */
export async function updateMemo(memo: string, blockId: string) {
    const response = await client.updateBlock({
        data: memo,
        dataType: "markdown",
        id: blockId,
    })
    const block_id = response.data[0].doOperations[0].id;
    return block_id;
}