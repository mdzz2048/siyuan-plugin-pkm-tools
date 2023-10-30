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
        import: {
            box: string ,
            path: string, 
            block_id: string, 
            type: string,
            path_date: string,
            type_insert: boolean,
        },
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