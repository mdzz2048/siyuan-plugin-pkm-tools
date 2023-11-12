import CryptoJS from "crypto-js"
import { IFlomoResp, ILoginRespData, IMemoLatestInfo, IMemoRespData } from "../types/flomo";

const baseUrl = "https://flomoapp.com/api/v1";

function getSign(str: string): string {
    const salt = "dbbc3dd73364b4084c3a69346e0ce2b2";
    return CryptoJS.MD5(str + salt).toString();
}

function getLatestInfo(memos: IMemoRespData[]): IMemoLatestInfo {
    const latest_memo = memos[memos.length - 1];
    const latest_slug = latest_memo.slug;
    const latest_updated = new Date(latest_memo.updated_at).getTime();
    const latest_info: IMemoLatestInfo = {
        latest_slug: latest_slug, 
        latest_updated: Math.floor(latest_updated / 1000).toString(),
        memos_length: memos.length,
    }
    return latest_info;
}

export async function loginFlomo(email: string, password: string) {
    let url = baseUrl + "/user/login_by_email";
    let timestamp = Math.floor(Date.now() / 1000);
    let hash_str = `api_key=flomo_web&app_version=2.0&email=${email}&password=${password}&timestamp=${timestamp}&webp=1`;
    let sign = getSign(hash_str);
    let body = {
        api_key: "flomo_web",
        app_version: "2.0",
        email: email,
        password: password,
        sign: sign,
        timestamp: timestamp,
        webp: "1"
    }
    let response = await fetch(url, {
        method: "POST", 
        headers: {
            "Content-Type": "aplication/json"
        },
        body: JSON.stringify(body),
    })
    let result: IFlomoResp = await response.json();
    let data: ILoginRespData = result.data;
    let token = result.code === 0 ? data.access_token : null;
    return token;
}

export async function getMemos(token: string, latest_slug = "", latest_updated = "0"): Promise<IMemoRespData[]> {
    let url = new URL(baseUrl + "/memo/updated");
    let timestamp = Math.floor(Date.now() / 1000);
    let hash_str = latest_slug + latest_updated === "0"
        ? `api_key=flomo_web&app_version=2.0&latest_updated_at=0&limit=200&timestamp=${timestamp}&tz=8:0&webp=1`
        : `api_key=flomo_web&app_version=2.0&latest_slug=${latest_slug}&latest_updated_at=${latest_updated}&limit=200&timestamp=${timestamp}&tz=8:0&webp=1`;
    let sign = getSign(hash_str);
    let params = {
        limit: "200", 
        latest_updated_at: latest_updated, 
        latest_slug: latest_slug, 
        tz: "8:0", 
        timestamp: timestamp.toString(), 
        api_key: "flomo_web", 
        app_version: "2.0", 
        webp: "1", 
        sign: sign
    }
    url.search = new URLSearchParams(params).toString();
    let response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
    });
    let result: IFlomoResp = await response.json();
    return result.data as IMemoRespData[];
}

export async function getAllMemos(token: string, removeDeleted = false) {
    let memos = await getMemos(token);
    let latest_slug = getLatestInfo(memos).latest_slug;
    let latest_updated = getLatestInfo(memos).latest_updated;
    let memos_length = getLatestInfo(memos).memos_length;
    while (memos_length >= 200) {
        let new_memos = await getMemos(token, latest_slug, latest_updated);
        latest_slug = getLatestInfo(new_memos).latest_slug;
        latest_updated = getLatestInfo(new_memos).latest_updated;
        memos_length = getLatestInfo(new_memos).memos_length;
        memos.push(...new_memos);
    }
    if (removeDeleted) memos.filter(memo => !memo.deleted_at);
    return memos;
}