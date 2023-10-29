import { client } from "../../api/siyuan";
import { GlobalConfig } from "../../types/config";
import { getPluginConfig, updatePluginConfig, getConfigBlob, PLUGIN_NAME } from "../../utils/config";
import { DEFAULT_CONFIG } from "../../config/default";
import type { IOption } from "../siyuan/input";

async function getNotebookOptions(): Promise<IOption[]> {
    const response = await client.lsNotebooks();
    const notebooks = response.data.notebooks;
    const notebookOptions = notebooks.map(notebook => {
        return  {
            key: notebook.id,
            text: notebook.name,
        } as IOption;
    })
    return notebookOptions;
}

function getConfig(): GlobalConfig {
    const response = getPluginConfig(PLUGIN_NAME);
    const pluginConfig = response ? response : DEFAULT_CONFIG;
    return pluginConfig;
}

function updateConfig(config: GlobalConfig) {
    const configBlob = getConfigBlob(config);
    updatePluginConfig(PLUGIN_NAME, "config.json", configBlob);
}

export {
    PLUGIN_NAME,
    DEFAULT_CONFIG,

    getConfig,
    getConfigBlob,
    updateConfig,
    getNotebookOptions,
}