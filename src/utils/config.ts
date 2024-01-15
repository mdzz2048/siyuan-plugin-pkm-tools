import { Plugin } from "siyuan";
import { client } from "../apps/siyuan/api";
import { GlobalConfig } from "../types/config";
import { showMessage } from "siyuan";
import { DEFAULT_CONFIG } from "../config/default";

// todo: 这里可以在 index 那里 export 一个 plugin 对象，不用这么麻烦

export const PLUGIN_NAME = "siyuan-plugin-pkm-tools";
export const STORAGE_NAME = "config.json";
export const CONFIG = () => {
    return getPluginConfig() as GlobalConfig;
};

export function getPlugin(pluginName = PLUGIN_NAME) {
    const plugins: Plugin[] = window["siyuan"]["ws"]["app"]["plugins"];
    return plugins.find(plugin => plugin.name === pluginName);
}

export function getPluginConfig(pluginName = PLUGIN_NAME, storageName = STORAGE_NAME) {
    const plugins: Plugin[] = window["siyuan"]["ws"]["app"]["plugins"];
    for(let index = 0; index < plugins.length; index++) {
        const plugin = plugins[index];
        if (plugin.name === pluginName) {
            let config = plugin.data[storageName];  // 需要插件使用 loadData 这里才会有数据
            if (storageName === STORAGE_NAME && !config) { config = DEFAULT_CONFIG }    // 提供默认配置
            return config;
        }
    }
}

export function updatePluginConfig(pluginName = PLUGIN_NAME, storageName = STORAGE_NAME, file: File | BlobPart) {
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