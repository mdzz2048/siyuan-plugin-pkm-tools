import {
    Plugin, 
    Menu,
    Dialog,
    type IMenuItemOption,
} from "siyuan";
import { createApp } from "vue";
import SettingVue from "./components/setting/Setting.vue";
import { flomoSyncHandler } from "./sync";
import { type GlobalConfig } from "./types/config";
import { DEFAULT_CONFIG } from "./config/default";
import { login } from "./api/flomo";

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

        // todo: 文档右键菜单 (获取网页链接的标题)

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
                    if (!this.config.token.flomo) {
                        const user = this.config.account.flomo.email;
                        const password = this.config.account.flomo.password;
                        const token = await login(user, password);
                        this.config.token.flomo = token;
                        this.saveData(STORAGE_NAME, this.config);
                    }
                    flomoSyncHandler(this.config);
                }
            }, 
            {
                icon: "iconRefresh", 
                label: "清除缓存", 
                click: async () => {
                    this.config.cache.flomo.latest_slug = "";
                    this.config.cache.flomo.latest_updated = "";
                    this.saveData(STORAGE_NAME, this.config);
                    console.log('缓存已清空');
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
