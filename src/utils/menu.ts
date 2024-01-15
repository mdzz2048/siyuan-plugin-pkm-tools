import { createApp } from "vue";
import { Dialog, openTab, showMessage } from "siyuan";
import { CONFIG, getPlugin } from "./config";
import { isBoxEqual } from "./import";
import { getAllMemos } from "../apps/flomo/api";
import { flomoSyncHandler, getUpdatedAndNewMemos, insertMemosRef } from "../apps/flomo/utils";
import TableVue from "../components/custom/Table.vue";
import ShowTipsVue from "../components/custom/ShowTips.vue";
import HomePageVue from "../components/business/HomePage/HomePage.vue";
import ClipperTableVue from "../components/business/ClipperTable/ClipperTable.vue";


export async function clickCuboxMenuDocManage() {
    const plugin = getPlugin();
    const app = createApp(TableVue)
    // openTab 是异步函数
    // REF: https://github.com/siyuan-note/siyuan/blob/99b3c7e1920a509864647f47704ff43817e1e7df/app/src/plugin/API.ts#L48
    const opened = await openTab({
        app: plugin.app,
        custom: {
            id: plugin.name + "custom_tab",
            icon: "",
            title: "卡片管理",
            data: {},
        },
        position: "right",
        keepCursor: true
    })
    app.mount(opened.panelElement.firstElementChild);
}

export async function clickHomePageMenu() {
    const plugin = getPlugin();
    console.log(plugin);
    const app = createApp(HomePageVue)
    const opened = await openTab({
        app: plugin.app,
        custom: {
            id: plugin.name + "custom_tab",
            icon: "",
            title: "首页",
            data: {},
        },
        position: "right",
        keepCursor: true
    })
    console.log(opened);
    app.mount(opened.panelElement.firstElementChild);
}

/* ------------------------ 文档 icon 点击事件 ------------------------ */

export async function clickDocMenuRefMemos(docName: string, docId: string) {
    const inbox = await isBoxEqual(docId, CONFIG().setting.flomo.dn_box);
    const memos = await getAllMemos(CONFIG().token.flomo);
    if (!inbox) {
        // todo: 这里判断 Daily Note 文档的方式还需要优化
        showMessage('当前文档非 Daily Note 文档');
        return;
    }
    const [, memosNew] = await getUpdatedAndNewMemos(memos);
    if (memosNew.length > 0) {
        // 存在新 memos 弹窗提示
        const dialog = new Dialog({
            title: "链接转换",
            content: `<div id="PKMShowTips" class="fn__flex-column"></div>`,
        })
        const app = createApp(ShowTipsVue, { 
            tips: "存在未导入的 memos，是否需要先导入再生成链接？",
            cancel: async() => {
                const hasMemos = await insertMemosRef(memos, docName, docId);
                if (!hasMemos) showMessage(`${docName} 没有创建 Memos`);
                dialog.destroy();
            }, 
            confirm: async() => {
                flomoSyncHandler();
                showMessage("正在导入，请稍候……");
                // 这里需要等待一下，不然之后 SQL 可能搜不到刚插入的 Memos
                const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
                await delay(3000);
                const hasMemos = await insertMemosRef(memos, docName, docId);
                if (!hasMemos) showMessage(`${docName} 没有创建 Memos`);
                dialog.destroy();
            } });
        app.mount('#PKMShowTips');
    } else {
        // 不存在新 memos，直接插入
        const hasMemos = await insertMemosRef(memos, docName, docId);
        if (!hasMemos) showMessage(`${docName} 没有创建 Memos`);
    }
}

export async function clickDocMenuLinkTitle(docId: string) {
    // 弹窗选择替换
    new Dialog({
        content: `<div id="pkm-tools-clipper-tab" class="fn__flex-column"></div>`,
        width: "950px",
        height: "550px",
    })
    const app = createApp(ClipperTableVue, { blockId: docId })
    app.mount("#pkm-tools-clipper-tab");
    console.log("在设置哦");
}