import {
    Plugin, 
    Menu,
    Dialog,
    type IMenuItemOption,
} from "siyuan";
import { createApp } from "vue";
import SettingVue from "./components/custom/Setting.vue";
import { TopBarMenu, onEditorTitleClicked, onMenuLinkOpened } from "./config/menu";
import { icon } from "./assets/symbols";

let clickEditorTitleListener: EventListener;
let openMenuLinkListener: EventListener;

export default class PKMTools extends Plugin {

    onload(): void {
        const topBarElement = this.addTopBar({
            icon: "iconDownload", 
            title: 'tools', 
            position: 'left', 
            callback: async () => {
                const rect = this.getTopBarRect(topBarElement);
                this.addMenu(rect, TopBarMenu);
            }
        })

        clickEditorTitleListener = (e: CustomEvent) => onEditorTitleClicked(e, this);
        openMenuLinkListener = (e: CustomEvent) => onMenuLinkOpened(e);
        this.eventBus.on("click-editortitleicon", clickEditorTitleListener);
        this.eventBus.on("open-menu-link", openMenuLinkListener);
        this.loadData("config.json");
        this.addIcons(icon);
    }

    onunload(): void {
        this.eventBus.off("click-blockicon", clickEditorTitleListener);
        this.eventBus.off("open-menu-link", openMenuLinkListener);
    }

    async openSetting() {
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