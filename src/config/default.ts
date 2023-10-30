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
        import: {
            box: "",
            path: "",
            block_id: "",
            type: "1",
            path_date: "",
            type_insert: false,
        },
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