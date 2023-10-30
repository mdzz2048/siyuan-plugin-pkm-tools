export interface IFlomoResp {
    code: number, 
    message: string, 
    data: any,
}

export interface IMemoFile {
    id: number,
    creator_id: number,
    type: string,
    name: string,
    path: string,
    size: number,
    url: string,
    thumbnail_url: string | null
}

export interface ILoginRespData {
    id: number,
    name: string,
    email: string,
    wechat_nickname: string,
    language: string,
    email_verified_at: string,
    pro_expired_at: string,
    apple_subscription: string | null,
    apple_mac_subscription: string | null,
    google_play_subscription: string | null,
    api_token: string,
    referer_id: string | null,
    referee_pro_days: number,
    register_via: string,
    created_at: string,
    access_token: string,
    slug: string,
}

export interface IMemoRespData {
    content: string,
    creator_id: number,
    source: string,
    tags: string[],
    pin: number,
    created_at: string,
    updated_at: string,
    deleted_at: string | null,
    slug: string,
    linked_count: number,
    files: IMemoFile[],
}

export interface IMemoLatestInfo {
    latest_slug: string,
    latest_updated: string,
    memos_length: number,
}

export interface IMemoSyncTips {
    updated: IMemoRespData[],
    new: IMemoRespData[],
    doc: IMemoDocInfo,
}

export interface IMemoDocInfo {
    name: string,
    path: string,
    id?: string,
    box?: string,
    insert?: boolean,
}