import { GlobalConfig } from "../types/config"

export const DEFAULT_CONFIG: GlobalConfig = {
    account: {
        flomo: {
            email: "", 
            password: "",
        }, 
        cubox: {
            email: "",
            password: "",
        }, 
        writeathon: {
            email: "",
            password: "",
        }, 
    }, 
    setting: {
        flomo: {
            dn_box: "",
            dn_use_ref: true,
            dn_insert_before: true,
            dn_link_doc: "",
            memo_box: "",
            memo_path: "",
            memo_date_path: "",
            memo_import_type: "1",
            memo_insert_before: true,
            get_link_title: false,
        },
        cubox: {
            article_box: "",
            article_path: "",
            article_date_path: "",
            article_import_type: "1",
            article_template: "- 标题: [{{bookmark.title}}]({{{bookmark.targetURL}}})\n- 简介：{{bookmark.description}}\n{{#if bookmark.tags}}\n- 标签: {{#each bookmark.tags}}#{{this}}#, {{/each}}\n{{/if}}\n- 收集时间：{{bookmark.createTime}}\n---",
            bookmark_template: "",
            clean_type: "1",
            clean_rules_date: "1",
            clean_rules_count: 180,
        },
        writeathon: {
            note_template: "",
        },
        hypothesis: {
            doc_template: "",
            bookmark_template: "",
        }
    },
    cache: {
        flomo: {
            latest_slug: "",
            latest_updated: "",
        }
    },
    token: {
        flomo: "",
        cubox: "",
        writeathon: "",
    },
}