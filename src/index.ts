import {
    Plugin, 
    Menu,
    Dialog,
    type IMenuItemOption,
} from "siyuan";
import { createApp } from "vue";
import SettingVue from "./components/setting/Setting.vue";
// import { getMemos, login } from "./api/flomo";
// import { importMemos } from "./utils/import";
import { type GlobalConfig } from "./types/config";
import { DEFAULT_CONFIG } from "./config/default";

const STORAGE_NAME = "config.json";

export default class PKMTools extends Plugin {
    public config!: GlobalConfig;

    onload(): void {
        
        this.loadData(STORAGE_NAME)
            .then(config => {
                if (config == "") {
                    this.config = DEFAULT_CONFIG;
                } else {
                    this.config = config;
                }
            })
            .catch(error => console.error('获取配置失败', error))

        const topBarElement = this.addTopBar({
            icon: "iconDownload", 
            title: 'tools', 
            position: 'left', 
            callback: async () => {
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
                this.addMenu(rect);
            }
        })

    }

    private addMenu(rect: DOMRect) {
        const menu = new Menu("pkm-tools", () => {
            console.log('bye pkm-tools');
        })
        const FlomoMenu:IMenuItemOption[] = [
            {
                icon: "iconDownload", 
                label: "导入卡片", 
                click: async () => {
                    console.log('正在导入 Flomo 卡片');
                    // importMemos();
                }
            }, 
            {
                icon: "iconRefresh", 
                label: "清除缓存", 
                click: async () => {
                    console.log('缓存已清空');
                }
            },
            {
                icon: "iconSettings", 
                label: "设置", 
                click: async () => {
                    new Dialog({
                        title: "设置",
                        content: `<div id="PKMToolsSetting" class="fn__flex-column"></div>`,
                        width: "720px",
                        height: "640px",
                    })
                    createApp(SettingVue).mount('#PKMToolsSetting');
                    console.log("在设置哦");
                }
            }
        ]
        menu.addItem({
            icon: "iconFlomo", 
            label: "Flomo",
            type: "submenu" , 
            submenu: FlomoMenu, 
            click: () => {
                console.log('看看行不行')
            }
        })
        menu.open({
            x: rect.right, 
            y: rect.bottom, 
            isLeft: true,
        })
    }
}
