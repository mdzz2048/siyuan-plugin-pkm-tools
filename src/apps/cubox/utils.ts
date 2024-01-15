import { addArticle, getArticleContent, getWebInfo, isExistArticle, searchArticle } from "./api";
import { IBookmark, IMark } from "./cubox";
import { CONFIG } from "../../utils/config";
import { cacheAttrInfo, cacheBlockInfo, createDoc } from "../../utils/import";
import { getHpathByDate } from "../../utils/setting";
import { parseTemplate } from "../../utils/template";


/* ------------------------ Cubox 导入流程 ------------------------ */

export async function cuboxSyncHandler() {
    const config = CONFIG();
    console.log(config);
}

// todo: 根据配置清理 Cubox 收集箱
export async function clearCubox() {
    const config = CONFIG();
    console.log(config);
    // 根据日期清理：清理 x 天、x 周、x 月的收藏

    // 根据数量清理：清理大于 x 的收藏

}

/**
 * 保存网页到 Cubox
 * @param url 网页链接
 * @returns 网页信息
 */
export async function saveToCubox(url: string): Promise<IBookmark> {
    const token = CONFIG().token.cubox;
    const isExist = await isExistArticle(token, url);
    if (isExist.exist) {
        // 如果已经保存过了不重复保存
        const bookmark = await searchArticle(token, isExist.bookmarkId);
        return bookmark;
    }
    const webInfo = await getWebInfo(token, url);
    const bookmark = await addArticle(token, webInfo);
    return bookmark;
}

/**
 * 根据网页信息生成思源收藏文档
 * @param bookmark 网页信息
 * @param config 
 * @returns 文档 ID
 */
// todo: 支持生成文档的时候就获取全文
export async function createClipperDoc(bookmark: IBookmark): Promise<string> {
    const config = CONFIG();
    // 检查文档是否存在，存在则不重复生成
    const cacheAttr = await cacheAttrInfo("custom-pkm-web-url");
    const attr = cacheAttr.find(attr => attr.value === bookmark.targetURL);
    if (attr) return attr.block_id
    // 根据配置生成文档路径
    const title = bookmark.title;
    const created = parseCuboxTime(bookmark.createTime);
    const notebook = config.setting.cubox.article_box;
    const hpath = config.setting.cubox.article_import_type === "1" 
        ? config.setting.cubox.article_path
        : getHpathByDate(created, config.setting.cubox.article_date_path ?? "年/年-月");
    // 根据模板生成文档内容
    const template = config.setting.cubox.article_template;
    const markdown = parseTemplate(template, { bookmark: bookmark });
    console.log(`[INFO]parsed template for[${bookmark.title}](${bookmark.targetURL})\n`, markdown);
    // 创建文档
    const blockId = await createDoc(notebook, markdown, `${hpath}/${title}`, {
        "custom-pkm-web-url": bookmark.targetURL,
    });
    return blockId;
}

// todo: 导出文档
export async function addMarkWithBlock() {
    
}

// todo: 获取、更新标注内容
export async function getUpdatedAndNewMarks(marks: IMark[]) {
    const cachMarksID = await cacheAttrInfo("custom-cubox-mark-id");
    const cachMarksUpdated = await cacheAttrInfo("custom-updated-time");
    const marksNew: IMark[] = [];
    const marksUpdated: [IMark, string][] = [];
    marks.forEach(mark => {
        const markID = cachMarksID.find(attr => attr.value === mark.markID);
        // 思源没有缓存，需要插入
        if (!markID) { marksNew.push(mark); return }
        // 思源缓存时间和 Flomo 更新时间一致，无需更新
        const updated = cachMarksUpdated.find(attr => attr.block_id === markID.block_id);
        if (updated && updated.value === getReadableTime(mark.updateTime)) return
        marksUpdated.push([mark, markID.block_id]);
    })
    return [marksUpdated, marksNew];
}

/* ------------------------ Tools ------------------------ */

/**
 * 把 cubox 的时间转换成 Date 可解析的字符串形式
 * @param dateTime cubox API 返回值里的时间信息
 * @returns 时间字符串
 */
function parseCuboxTime(dateTime: string): string {
    const dateTimeParts = dateTime.split('T');
    const datePart = dateTimeParts[0];
    const timePart = dateTimeParts[1].split(':')[0] + ':' + dateTimeParts[1].split(':')[1] + ':' + dateTimeParts[1].split(':')[2].split('.')[0];
    return datePart + 'T' + timePart + 'Z';
}

function getReadableTime(dataTime: string): string {
    
    return "";
}