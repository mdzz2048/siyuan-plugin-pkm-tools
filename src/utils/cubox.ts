import { addArticle, getWebInfo, isExistArticle, searchArticle } from "../api/cubox";
import { client } from "../api/siyuan";
import { GlobalConfig } from "../types/config";
import { IBookmark } from "../types/cubox";
import { cacheAttrInfo, getHpathByDate } from "./import";
import { parseTemplate } from "./template";

// todo: 根据配置清理 Cubox 收集箱
export async function clearCubox(config: GlobalConfig) {
    // 根据日期清理：清理 x 天、x 周、x 月的收藏

    // 根据数量清理：清理大于 x 的收藏

}

// todo: 保存网页到 Cubox
export async function saveToCubox(url: string, config: GlobalConfig): Promise<IBookmark> {
    const token = config.token.cubox;
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

// todo: 根据 bookmark 生成思源网页文档
export async function createClipperDoc(bookmark: IBookmark, config: GlobalConfig): Promise<string> {
    // 检查文档是否存在，存在则不重复生成
    const cacheAttr = await cacheAttrInfo("custom-pkm-web-url");
    const attr = cacheAttr.find(attr => attr.value === bookmark.targetURL);
    if (attr) return attr.block_id
    // 根据配置生成文档路径
    const title = bookmark.title;
    const box = config.setting.import.box;
    const created = parseTime(bookmark.createTime);
    const hpath = getHpathByDate(created, config.setting.import.path_date ?? "年/年-月");
    // 根据模板生成文档内容
    const template = config.setting.cubox.doc_template;
    const markdown = parseTemplate(template, bookmark);
    console.log(`[INFO]parsed template for[${bookmark.title}](${bookmark.targetURL})\n`, markdown);
    // 创建文档
    const response = await client.createDocWithMd({
        notebook: box,
        path: `${hpath}/${title}`,
        markdown: markdown,
    });
    const blockId = response.data;
    client.setBlockAttrs({
        id: blockId,
        attrs: {
            "custom-pkm-web-url": bookmark.targetURL,
        }
    })
    return blockId;
}

// 把 cubox 的时间转换成 Date 可解析的字符串形式
function parseTime(dateTime: string): string {
    const dateTimeParts = dateTime.split('T');
    const datePart = dateTimeParts[0];
    const timePart = dateTimeParts[1].split(':')[0] + ':' + dateTimeParts[1].split(':')[1] + ':' + dateTimeParts[1].split(':')[2].split('.')[0];
    return datePart + 'T' + timePart + 'Z';
}