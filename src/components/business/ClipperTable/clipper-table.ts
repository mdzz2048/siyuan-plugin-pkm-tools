import { client } from "../../../apps/siyuan/api";
import { getAllMdUrlTitle, isUrlSaved, updateBlock } from "../../../utils/import";

export interface ILinkInfo {
    title: string,
    link: string,
    blockId: string,
    saved?: boolean,
}

export interface IBlockUrls {
    blockId: string,
    urls: { link: string, title: string }[]
}

export async function getTableData(blockId: string): Promise<ILinkInfo[]> {
    const linkInfos: ILinkInfo[] = []
    // 获取文档 markdown
    const response = await client.getBlockKramdown({ id: blockId })
    const markdown = response.data.kramdown
    // 提取链接
    const links = await getAllMdUrlTitle(markdown)
    const blockList = [...markdown.matchAll(/{{{row.*?}}}\s+{:.*?}/gs)]
    links.titles.forEach((result, index) => {
        const url = links.links[index][1]
        const title = result.status === "fulfilled" && result.value !== ""
            ? result.value
            : ""
        const blockMd = blockList.find(block => block[0].includes(url))
        const blockId = blockMd?.[0].match(/}}}\s+{:.*?id="(.*?)"/s)[1]
        // const saved = await isUrlSaved(url)
        const saved = index / 2 === 0
            ? true
            : false
        const linkInfo: ILinkInfo = {
            title: title,
            blockId: blockId,
            link: url,
            // saved: saved.isExist,
            saved: saved,
        }
        linkInfos.push(linkInfo)
    })
    return linkInfos;
}

export async function replaceLinkInfo(linkInfos: ILinkInfo[]) {
    const blockUrls = reorganizeLinks(linkInfos)
    for(const item of blockUrls) {
        let response = await client.getBlockKramdown({ id: item.blockId })
        let markdown = response.data.kramdown
        item.urls.forEach(url => {
            const link = url.link.replace('?', '\\?');  // 带 ? 的链接会影响正则
            const regexp = new RegExp('\\[(.*?)\\]\\(' + link + '\\)', 'g')
            markdown = markdown.replaceAll(regexp, `[${url.title}](${url.link})`)
        })
        updateBlock(markdown, item.blockId)
    }
}

export function reorganizeLinks(linkInfos: ILinkInfo[]): IBlockUrls[] {
    const blockUrls: IBlockUrls[] = [];
    const blockIds: string[] = [];

    // 遍历 linkInfos 列表
    for (const linkInfo of linkInfos) {
        const { blockId, link, title } = linkInfo;

        // 检查 blockId 是否已存在于 blockIds 数组中
        const index = blockIds.indexOf(blockId);

        if (index === -1) {
            // 如果 blockId 不存在于 blockIds 数组中，则创建新的 IBlockUrls 对象，并将其添加到 blockUrls 数组中
            const newBlockUrls: IBlockUrls = {
                blockId,
                urls: [{ link, title }]
            };
            blockUrls.push(newBlockUrls);
            blockIds.push(blockId);
        } else {
            // 如果 blockId 已存在于 blockIds 数组中，则将 link 和 title 添加到对应的 IBlockUrls 对象的 urls 数组中
            blockUrls[index].urls.push({ link, title });
        }
    }

    return blockUrls;
}