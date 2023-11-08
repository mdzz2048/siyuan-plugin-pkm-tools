import { client } from "../../api/siyuan";

type ILine = IItem[];
type IHeader = {
    type: "checkbox" | "normal",
    text?: string,
    style?: string,
}
type IItem = {
    type: "checkbox" | "button" | "text" | "link" | "block" | "input",
    text?: string,
    url?: string,
    style?: string,
    disabled?: boolean,
}
type ILinkInfo = { 
    blockId: string,
    link: string,
    title?: string,
}
type IBlockUrls = {
    blockId: string,
    urls: { link: string, title: string }[]
}

function clickButton(event: PointerEvent) {
    console.log(event);
}

function clickCheckbox(event: PointerEvent, tables: []) {
    console.log(event);
    console.log(tables);
}

function clickLink(event: PointerEvent) {
    const target = event.target as HTMLElement;
    const href = target.dataset['href'];
    window.open(href);
}

function clickBlock(event: PointerEvent) {
    console.log(event);
}

function clickInput(event: PointerEvent) {
    console.log(event);
    const target = event.target as HTMLElement;
    const readonly = target.getAttribute('readonly');
    if (readonly === "") {
        target.removeAttribute('readonly');
    } else {
        target.setAttribute('readonly', '');
    }
    console.log(target)
}

function clickText(event: PointerEvent) {
    console.log(event);
}

function changedCheckbox(event: Event, checkedUrls: string[]) {
    console.log(event);
    console.log(checkedUrls);
}

function changedInput(event: Event) {
    console.log(event);
}


function replaceLinkInfo(linkInfos: ILinkInfo[]) {
    const blockUrls = reorganizeLinks(linkInfos);
    blockUrls.forEach(async item => {
        let response = await client.getBlockKramdown({ id: item.blockId });
        let markdown = response.data.kramdown;
        item.urls.forEach(url => {
            const link = url.link.replace('?', '\\?');  // 带 ? 的链接会影响正则
            const regexp = new RegExp('\\[(.*?)\\]\\(' + link + '\\)', 'g');
            markdown = markdown.replaceAll(regexp, `[${url.title}](${url.link})`);
        })
        client.updateBlock({
            id: item.blockId,
            data: markdown,
            dataType: "markdown",
        })
    })
}

function reorganizeLinks(linkInfos: ILinkInfo[]): IBlockUrls[] {
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

export type {
    ILine,
    IItem,
    IHeader,
    ILinkInfo,
}
export {
    clickBlock,
    clickButton,
    clickCheckbox,
    clickLink,
    clickInput,
    clickText,
    changedCheckbox,
    changedInput,
    replaceLinkInfo,
}