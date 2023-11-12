export interface GlobalConfig {
    account: {
        flomo: {
            email: string, 
            password: string
        }, 
        cubox: {
            email: string, 
            password: string
        }, 
        writeathon: {
            email: string, 
            password: string
        }, 
    }, 
    setting: {
        flomo: {
            dn_box: string,
            dn_use_ref: boolean,
            dn_insert_before: boolean,
            dn_link_doc?: string,
            memo_box: string,
            memo_path: string,
            memo_date_path: string,
            memo_import_type: string,
            memo_insert_before: boolean,
            get_link_title: boolean,
        },
        cubox: {
            article_box: string,
            article_path: string,
            article_date_path: string,
            article_import_type: string,
            article_template: string,
            bookmark_template: string,
        },
        writeathon: {
            note_template: string,
        },
        hypothesis: {
            doc_template: string,
            bookmark_template: string,
        }
    },
    cache?: {
        flomo: {
            latest_slug: string, 
            latest_updated: string, 
        }
    },
    token?: {
        flomo: string, 
        cubox: string, 
        writeathon: string, 
    },
}