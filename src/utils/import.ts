import { client } from "../apps/siyuan/api";
import { Attribute, Block } from "../apps/siyuan/siyuan";

// todo: 这些该塞到 /apps/siyuan 里的就塞进去，不适合的重新整理一下
// 之后还要适配更多的应用，不能放的乱七八糟

/* ------------------------ SiYuan API ------------------------ */

export async function isPathExist(box: string, hpath: string): Promise<boolean> {
    const response = await client.sql({
        stmt: `SELECT * FROM blocks WHERE hpath='${hpath}' AND box='${box}' AND type='d'`
    })
    return response.data.length > 0 ? true : false; 
}

export async function isBoxEqual(blockId: string, box: string): Promise<boolean> {
    const block = await getBlock(blockId);
    return block.box === box;
}

export async function getBlock(blockId: string) {
    const response = await client.sql({
        stmt: `SELECT * FROM blocks WHERE id="${blockId}"`
    })
    return response.data[0] as Block;
}

export async function createDoc(
    notebook: string, markdown: string, path: string, attrs?: { [key: string]: string }
): Promise<string> {
    const blockId = await client.createDocWithMd({notebook: notebook, markdown: markdown, path: path });
    if (attrs) await client.setBlockAttrs({ id: blockId.data, attrs: attrs});
    return blockId.data;
}

export async function updateBlock(markdown: string, blockId: string) {
    const attrs = await client.getBlockAttrs({ id: blockId });
    await client.updateBlock({ id: blockId, data: markdown, dataType: "markdown" });
    await client.setBlockAttrs({ id: blockId, attrs: attrs.data });
}

type insertType = "insert" | "append" | "prepend"
export async function insertBlock(
    markdown: string, parentId: string, type: insertType, previousId?: string, nextId?: string
) {
    switch (type) {
        case "append": {
            const response = await client.appendBlock({
                data: markdown,
                dataType: "markdown",
                parentID: parentId,
            })
            return response;
        }
        case "prepend": {
            const response = await client.prependBlock({
                data: markdown,
                dataType: "markdown",
                parentID: parentId,
            })
            return response;
        }
        case "insert": {
            const response = await client.insertBlock({
                data: markdown,
                dataType: "markdown",
                parentID: parentId,
                nextID: nextId,
                previousID: previousId,
            })
            return response;
        }
    }
}

export async function getBlockIdByHpath(box: string, hpath: string): Promise<string> {
    const response = await client.getIDsByHPath({
        notebook: box,
        path: hpath
    })
    if (response.data.length === 1) {
        return response.data[0];
    } else if (response.data.length > 0) {
        console.log("[INFO]获取导入文档 (import.path): ", response.data);
        return response.data[0];
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

/* ------------------------ URL ------------------------ */

export async function getUrlTitle(url: string): Promise<string> {
    // todo: 微信的文章 title 标签是空的，标题在 <meta> 里 
    // <meta property="og:title" content="xxx"/>
    const response = await fetch(url);
    if (!response.ok) return;
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.querySelector('title')?.textContent;
}

export async function getAllMdUrlTitle(markdown: string) {
    const regex = /(?<!\!)\[.*?\]\((http.*?)\)/g;
    const promises: Promise<string>[] = [];
    // 提取链接
    const links = [...markdown.matchAll(regex)];
    links.forEach(link => promises.push(getUrlTitle(link[1])));
    // 获取链接标题
    const titles = await Promise.allSettled(promises);
    return { links: links, titles: titles };
}

export async function replaceAllMdUrlTitle(markdown: string): Promise<string> {
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

export async function isUrlSaved(url: string) {
    const response = await client.sql({
        stmt: `SELECT * FROM blocks WHERE ial LIKE '%custom-pkm-web-url=${url}%'`
    })
    if (response.data.length > 0) {
        // todo: 这里的判断不够健壮
        const block = response.data[0] as Block
        return {
            isExist: true,
            blockId: block.id
        }
    } else {
        return {
            isExist: false,
            blockId: undefined
        }
    }
}

/* ------------------------ Cache ------------------------ */

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