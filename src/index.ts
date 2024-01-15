import {
    Plugin, 
    Menu,
    Dialog,
    type IMenuItemOption,
} from "siyuan";
import { createApp } from "vue";
import { icon } from "./assets/symbols";
import { onProtyleStaticLoaded } from "./utils/event";
import { TopBarMenu, onEditorTitleClicked, onMenuLinkOpened } from "./config/menu";
import SettingVue from "./components/custom/Setting.vue";
import { clickHomePageMenu } from "./utils/menu";

let openMenuLinkListener: EventListener;
let clickEditorTitleListener: EventListener;
let loadedProtyleStaticListener: EventListener;

const TAB_TYPE = "custom_tab";

export default class PKMTools extends Plugin {

    onload() {
        const topBarElement = this.addTopBar({
            icon: "iconDownload", 
            title: 'tools', 
            position: 'left', 
            callback: () => {
                const rect = this.getTopBarRect(topBarElement);
                this.addMenu(rect, TopBarMenu);
            }
        })

        clickEditorTitleListener = (e: CustomEvent) => onEditorTitleClicked(e);
        openMenuLinkListener = (e: CustomEvent) => onMenuLinkOpened(e);
        loadedProtyleStaticListener = (e: CustomEvent) => onProtyleStaticLoaded(e);
        this.eventBus.on("open-menu-link", openMenuLinkListener);
        this.eventBus.on("click-editortitleicon", clickEditorTitleListener);
        this.eventBus.on("loaded-protyle-static", loadedProtyleStaticListener);
        
        this.loadData("config.json");
        this.addIcons(icon);
        this.addCommand({
            langKey: "updateMemos",
            langText: "更新 memos",
            hotkey: "",
            callback: () => {console.log('hello world!')},
        });
        this.addCommand({
            langKey: "openMemosDoc",
            langText: "打开本月的 memos 文档",
            hotkey: "",
            callback: () => {console.log('hello world!')},
        });
        this.addTab({
            type: TAB_TYPE,
            init() {
                this.element.innerHTML = `<div class="pkm-tools__custom-tab"></div>`;
            },
            beforeDestroy() {
                console.log("before destroy tab:", TAB_TYPE);
            },
            destroy() {
                console.log("destroy tab:", TAB_TYPE);
            }
        });
    }

    async onLayoutReady() {
        // test
        await clickHomePageMenu();
    }

    onunload(): void {
        this.eventBus.off("open-menu-link", openMenuLinkListener);
        this.eventBus.off("click-blockicon", clickEditorTitleListener);
        this.eventBus.off("loaded-protyle-static", loadedProtyleStaticListener)
    }

    openSetting() {
        new Dialog({
            title: "设置",
            content: `<div id="PKMToolsSetting" class="fn__flex-column"></div>`,
            width: "720px",
            height: "640px",
        })
        createApp(SettingVue).mount('#PKMToolsSetting');
        console.log("在设置哦");
    }

    private addMenu(rect: DOMRect, menusOption: IMenuItemOption[]) {
        const menu = new Menu("pkm-tools")
        menusOption.forEach(menuOption => {
            menu.addItem(menuOption);
        })
        menu.open({
            x: rect.right, 
            y: rect.bottom, 
            isLeft: true,
        })
    }

    private getTopBarRect(topBarElement: HTMLElement): DOMRect {
        let rect = topBarElement.getBoundingClientRect();
        // 如果被隐藏，则使用更多按钮
        if (rect.width === 0) {
            const newRect = document.querySelector("#barMore")?.getBoundingClientRect();
            rect = newRect ? newRect : rect;
        }
        if (rect.width === 0) {
            const newRect = document.querySelector("#barPlugins")?.getBoundingClientRect();
            rect = newRect ? newRect : rect;
        }
        return rect;
    }
}