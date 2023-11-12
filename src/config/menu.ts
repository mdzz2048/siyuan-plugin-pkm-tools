import { createApp } from "vue";
import { IMenuItemOption, IEventBusMap, Dialog, Plugin, showMessage } from "siyuan";
import { client } from "../api/siyuan";
import { loginFlomo } from "../api/flomo";
import { cuboxSyncHandler, flomoSyncHandler } from "../sync";
import { getAllMdUrlTitle, getBlock, getMemosRefByDate, getUrlTitle, inDailyNoteBox } from "../utils/import";
import { CONFIG, PLUGIN_NAME, STORAGE_NAME, getConfigBlob, updatePluginConfig } from "../utils/config";
import { ILinkInfo } from "../components/custom/table";
import { createClipperDoc, saveToCubox } from "../utils/cubox";
import ShowTips from "../components/custom/ShowTips.vue";
import LinkTitleVue from "../components/custom/LinkTitle.vue";

const FlomoMenu: IMenuItemOption[] = [
    {
        icon: "iconDownload", 
        label: "导入卡片", 
        click: clickFlomoMenuImport
    }, 
    {
        icon: "iconTrashcan", 
        label: "清除缓存", 
        click: clickFlomoMenuRefresh
    },
    {
        icon: "iconRefresh",
        label: "更新缓存",
        click: clickFlomoMenuUpdateCache,
    }
]

const CuboxMemu: IMenuItemOption[] = [
    {
        icon: "#iconAccount",
        label: "API 测试",
        click: clickCuboxMenuImoprt
    }
]

const TopBarMenu: IMenuItemOption[] = [
    {
        icon: "icon-pkm-tools-flomo-c", 
        label: "Flomo",
        type: "submenu", 
        submenu: FlomoMenu,
    },
    {
        icon: "icon-pkm-tools-cubox-c",
        label: "Cubox",
        type: "submenu",
        submenu: CuboxMemu,
    }
]

async function clickFlomoMenuImport() {
    console.log('正在导入 Flomo 卡片');
    if (!CONFIG().token.flomo) {
        const user = CONFIG().account.flomo.email;
        const password = CONFIG().account.flomo.password;
        const token = await loginFlomo(user, password);
        CONFIG().token.flomo = token;
        this.saveData(STORAGE_NAME, CONFIG());
    }
    flomoSyncHandler(CONFIG());
}

function clickFlomoMenuRefresh() {
    const config = CONFIG();
    config.cache.flomo.latest_slug = "";
    config.cache.flomo.latest_updated = "";
    updatePluginConfig(PLUGIN_NAME, STORAGE_NAME, getConfigBlob(CONFIG()));
    console.log('缓存已清空');
}

function clickFlomoMenuUpdateCache() {
    // todo: 手动设置最后更新的位置
    const dialog = new Dialog({
        title: "链接转换",
        content: `<div id="PKMTips" class="fn__flex-column"></div>`,
        width: "750px",
        height: "550px",
    })
    const app = createApp(ShowTips, { dialog: dialog });
    app.mount('#PKMTips');
}

async function clickCuboxMenuImoprt() {
    console.log("正在登录 Cubox");
    // const email = CONFIG().account.cubox.email;
    // const password = CONFIG().account.cubox.password;
    // loginCubox(email, password);
    cuboxSyncHandler(CONFIG());
}

// 文档 Icon 点击事件

function onEditorTitleClicked(e: CustomEvent, plugin: Plugin) {
    console.log(e);
    const detail: IEventBusMap["click-editortitleicon"] = e.detail;
    const menu = detail.menu;

    menu.addItem({
        icon: "iconSettings",
        label: "PKM 工具",
        submenu: [
            {
                icon: "iconList",
                label: "引用 Flomo",
                click: () => {
                    clickDocMenuRefMemos(detail.data.name, detail.data.id);
                }
            },
            {
                icon: "iconScrollHoriz",
                label: "链接转换",
                click: () => {
                    clickDocMenuLinkTitle(detail.data.id, plugin);
                }
            },
            {
                icon: "",
                label: "批量替换测试",
                click: () => {
                    clickDocMenuTest(detail.data.id);
                }
            }
        ]
    });
}

async function clickDocMenuRefMemos(docName: string, docId: string) {
    const inbox = await inDailyNoteBox(docId, CONFIG().setting.flomo.dn_box);
    if (!inbox) {
        showMessage('当前文档非 Daily Note 文档');
        return;
    }

    const [newMemos, memosLink, memosRef] = await getMemosRefByDate(docName);
    if (newMemos.length > 0) {
        showMessage('存在未导入 Memos');
    }
    
    if (memosLink.length > 0) {
        let markdown = "";
        const data = CONFIG().setting.flomo.dn_use_ref ? memosRef : memosLink;
        const linkDoc = CONFIG().setting.flomo.dn_link_doc;

        if (linkDoc) {
            const block = await getBlock(linkDoc);
            const docLink = `((${linkDoc} "${block.content}"))`;
            markdown = '- ' + docLink + '\n    - ' + data.join('\n    - ');
        } else {
            markdown = '- ' + data.join('\n- ');
        }

        if (CONFIG().setting.flomo.dn_insert_before) {
            await client.prependBlock({
                parentID: docId,
                dataType: 'markdown',
                data: markdown,
            })
        } else {
            await client.appendBlock({
                parentID: docId,
                dataType: 'markdown',
                data: markdown,
            })
        }
    } else {
        showMessage(`${docName} 没有创建 Memos`);
    }
    console.log(newMemos, memosLink, memosRef);
}

async function clickDocMenuLinkTitle(docId: string, plugin: Plugin) {
    // 获取文档 markdown
    const response = await client.getBlockKramdown({ id: docId });
    const markdown = response.data.kramdown;
    // 提取链接
    const linkInfos: ILinkInfo[] = [];
    const blockList = [...markdown.matchAll(/{{{row.*?}}}\s+{:.*?}/gs)];
    blockList.forEach(block => {
        // 正则提取超级块 ID
        const id = block[0].match(/}}}\s+{:.*?id="(.*?)"/s)[1];
        // 正则提取非图片链接
        const links = [...block[0].matchAll(/(?<!\!)\[.*?\]\((http.*?)\)/g)];
        links.forEach(link => {
            linkInfos.push({ blockId: id, link: link[1] } as ILinkInfo);
        })
    })
    // 弹窗选择替换
    new Dialog({
        title: "链接转换",
        content: `<div id="PKMLinkTitle" class="fn__flex-column"></div>`,
        width: "750px",
        height: "550px",
    })
    const app = createApp(LinkTitleVue, { linkInfos: linkInfos, plugin: plugin });
    app.mount('#PKMLinkTitle');
    console.log("在设置哦");
}

async function clickDocMenuTest(docId: string) {
    // 获取文档 markdown
    const response = await client.getBlockKramdown({ id: docId });
    const markdown = response.data.kramdown;
    getAllMdUrlTitle(markdown);
}

// 链接菜单打开事件

function onMenuLinkOpened(e: CustomEvent) {
    console.log(e);
    const detail: IEventBusMap["open-menu-link"] = e.detail;
    const menu = detail.menu;
    
    menu.addItem({
        icon: "iconSettings",
        label: "PKM 工具",
        submenu: [
            {
                icon: "iconScrollHoriz",
                label: "链接转换",
                click: async () => {
                    await clickLinkMenuLinkTitle(detail.element);
                }
            },
            {
                icon: "icon-pkm-tools-cubox-c",
                label: "获取网页快照",
                click: async () => {
                    await clickLinkMenuSaveByCubox(detail.element);
                }
            }
        ]
    });
}

async function clickLinkMenuLinkTitle(element: HTMLElement) {
    const blockId = element.parentElement.parentElement.dataset["nodeId"];
    const linkTitle = await getUrlTitle(element.dataset["href"]);
    const linkContent = element.innerText;
    const response = await client.getBlockKramdown({ id: blockId });
    const markdown =response.data.kramdown.replaceAll(`[${linkContent}]`, `[${linkTitle}]`);
    client.updateBlock({
        id: blockId,
        data: markdown,
        dataType: "markdown",
    })
}

async function clickLinkMenuSaveByCubox(element: HTMLElement) {
    const config = CONFIG();
    const link = element.dataset["href"];
    const bookmark = await saveToCubox(link, config);
    await createClipperDoc(bookmark, config);
    console.log(bookmark);
}

export {
    TopBarMenu,

    onEditorTitleClicked,
    onMenuLinkOpened,
}