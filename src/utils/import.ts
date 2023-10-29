import { showMessage } from "siyuan";
import { getAllMemos, getMemos } from "../api/flomo";
import { getPluginConfig, PLUGIN_NAME } from "./config";

export async function importMemos() {
    const config = getPluginConfig(PLUGIN_NAME);
    if (config === null) {
        showMessage("未检测到配置文件，请先配置插件", 6000, "error");
    }
    const token = config.token.flomo;
    const latest_slug = config.cache.flomo.latest_slug;
    const latest_updated = config.cache.flomo.latest_updated;
    if (latest_slug === "") {
        console.log("get all memos");
        let memos = await getAllMemos(token);
        console.log(memos);
    } else {
        let memos = await getMemos(token, latest_slug, latest_updated);
        console.log(latest_updated);
        console.log(memos);
    }
    console.log(config);
}