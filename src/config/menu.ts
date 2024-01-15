// todo: 重新整理一下 menu 相关的所有内容，全部放到这个文件里。不要到处拉屎……

import { createApp } from "vue";
import { IMenuItemOption, IEventBusMap, Dialog } from "siyuan";
import { client } from "../apps/siyuan/api";
import { loginFlomo } from "../apps/flomo/api";
import { replaceAllMdUrlTitle, getUrlTitle } from "../utils/import";
import { CONFIG, PLUGIN_NAME, STORAGE_NAME, getConfigBlob, updatePluginConfig } from "../utils/config";
import { createClipperDoc, saveToCubox } from "../apps/cubox/utils";
import { flomoSyncHandler } from "../apps/flomo/utils";
import ShowTipsVue from "../components/custom/ShowTips.vue";
import { clickCuboxMenuDocManage, clickDocMenuLinkTitle, clickDocMenuRefMemos, clickHomePageMenu } from "../utils/menu";

/* ------------------------ 顶栏 icon 菜单 ------------------------ */

export const TopBarMenu: IMenuItemOption[] = [
    {
        icon: "icon-pkm-tools-flomo-c", 
        label: "Flomo",
        type: "submenu", 
        submenu: [
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
        ],
    },
    {
        icon: "icon-pkm-tools-cubox-c",
        label: "Cubox",
        type: "submenu",
        submenu: [
            {
                icon: "#iconAccount",
                label: "API 测试",
                click: clickCuboxMenuImoprt
            },
            {
                icon: "",
                label: "文章管理",
                click: clickCuboxMenuDocManage
            }
        ],
    },
    {
        icon: "",
        label: "首页",
        click: clickHomePageMenu
    }
]

async function clickFlomoMenuImport() {
    console.log('正在导入 Flomo 卡片');
    if (!CONFIG().token.flomo) {
        const user = CONFIG().account.flomo.email;
        const password = CONFIG().account.flomo.password;
        const token = await loginFlomo(user, password);
        CONFIG().token.flomo = token;
        updatePluginConfig(PLUGIN_NAME, STORAGE_NAME, getConfigBlob(CONFIG()));
    }
    flomoSyncHandler();
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
    const app = createApp(ShowTipsVue, { 
        tips: "hello world <strong>blod</strong>",
        cancel: () => {
            dialog.destroy();
        }, 
        confirm: () => {
            dialog.destroy();
        } });
    app.mount("#PKMTips");
}

async function clickCuboxMenuImoprt() {
    console.log("正在登录 Cubox");
    // const email = CONFIG().account.cubox.email;
    // const password = CONFIG().account.cubox.password;
    // loginCubox(email, password);
    // cuboxSyncHandler(CONFIG());
}

/* ------------------------ 文档 icon 点击事件 ------------------------ */

export function onEditorTitleClicked(e: CustomEvent) {
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
                    clickDocMenuLinkTitle(detail.data.id);
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

async function clickDocMenuTest(docId: string) {
    // 获取文档 markdown
    const response = await client.getBlockKramdown({ id: docId });
    const markdown = response.data.kramdown;
    replaceAllMdUrlTitle(markdown);
}

/* ------------------------ 链接菜单打开事件 ------------------------ */

export function onMenuLinkOpened(e: CustomEvent) {
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
    const link = element.dataset["href"];
    const bookmark = await saveToCubox(link);
    await createClipperDoc(bookmark);
    console.log(bookmark);
}