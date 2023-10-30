import { Plugin } from "siyuan";
import { client } from "../api/siyuan";
import { GlobalConfig } from "../types/config";
import { showMessage } from "siyuan";

export const PLUGIN_NAME = "siyuan-plugin-pkm-tools";

export function getPluginConfig(pluginName = PLUGIN_NAME, storageName = "config.json") {
    const plugins: Plugin[] = window["siyuan"]["ws"]["app"]["plugins"];
    for(let index = 0; index < plugins.length; index++) {
        const plugin = plugins[index];
        if (plugin.name === pluginName) {
            return plugin.data[storageName];
        }
    }
}

export function updatePluginConfig(pluginName = PLUGIN_NAME, storageName = "config.json", file: File | BlobPart) {
    client.putFile({
        path: `/data/storage/petal/${pluginName}/${storageName}`,
        isDir: false,
        modTime: Date.now(),
        file: file
    });
}

export function getConfigBlob(config: GlobalConfig): Blob {
    const jsonStr = JSON.stringify(config);
    return new Blob([jsonStr], { type: 'application/json' });
}

export function checkConfig(pluginName = PLUGIN_NAME, storageName = "config.json") {
    const plugins: Plugin[] = window["siyuan"]["ws"]["app"]["plugins"];
    for(let index = 0; index < plugins.length; index++) {
        const plugin = plugins[index];
        if (plugin.name === pluginName) {
            return plugin.data[storageName];
        }
    }
    showMessage("未检测到配置文件，请先配置插件", 6000, "error")
}