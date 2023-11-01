import CryptoJS from "crypto-js";
import { IBookmark, IBookmarkContent, IBookmarkExist, IResponse, IUserRespData, IWebInfo } from "../types/cubox";

const baseUrl = "https://cubox.pro";
const urlPath = {
	urlLogin                  : "/c/api/login",
	urlUserInfo               : "/c/api/userInfo",
	urlSearchEngineExport     : "/c/api/search_engines/export/text",
	urlSearchEngineInbox      : "/c/api/v2/search_engine/inbox",
	urlSearchEngineToday      : "/c/api/search_engines/today",
	urlSearchEngineMy         : "/c/api/v2/search_engine/my",
	urlSearchEngineNew        : "/c/api/v2/search_engine/new",
	urlSearchEngineDelete	  : "/c/api/search_engine/delete",
	urlSearchEngineUpdate     : "/c/api/v3/search_engine/update",
	urlSearchEngineUpdateTags : "/c/api/v2/search_engines/updateTagsForName",
	urlSearchEngineWebInfo    : "/c/api/v2/search_engine/webInfo",
	urlBookmarkContent        : "/c/api/bookmark/content",
	urlBookmarkDetail         : "/c/api/v2/bookmark/detail",
	urlBookmarkExist          : "/c/api/bookmark/exist",
	urlTagList                : "/c/api/v2/tag/list",
	urlTagRecent              : "/c/api/tag/use/recent",
	urlTagNew                 : "/c/api/v2/tag/new",
	urlTagsDelete             : "/c/api/tags/delete",
	urlTagUpdate              : "/c/api/tag/update",
	urlTagMerge               : "/c/api/tag/merge",
	urlTagMove                : "/c/api/tag/move",
	urlTagSort                : "/c/api/tag/sort",
	urlMarkLatest             : "/c/api/mark/search_engine/latest",
	urlMarkList               : "/c/api/v2/mark",
}

interface IRequestOption {
	url: string | URL,
	method: "POST" | "GET" | "PUT",
	body?: object,
	token?: string,
	contentType?: "application/x-www-form-urlencoded" | "application/json",
}
async function request(option: IRequestOption): Promise<IResponse> {
	const response = await fetch(option.url, {
		method: option.method,
		headers: {
			"Content-Type": option.contentType ?? "application/json",
			"Authorization": option.token ?? "",
		},
		body: JSON.stringify(option.body),
	})
	const result: IResponse = await response.json();
	result.message && (console.log(result));	// 存在报错，打印返回结果
	return result;
}

function getURLSearchParams(link: string, body: any) {
	const url = new URL(link);
	url.search = new URLSearchParams(body).toString();
	return url;
}

export async function loginCubox(email: string, password: string): Promise<string> {
    const url = new URL(baseUrl + urlPath.urlLogin);
    const hashedPassword = CryptoJS.MD5(password).toString();
    const params = {
        userName: email,
        password: hashedPassword,
        autoLogin: "true",
    }
	url.search = new URLSearchParams(params).toString();

	const requestOption: IRequestOption = {
		url: url,
		method: "POST",
		contentType: "application/x-www-form-urlencoded",
	}
	const result = await request(requestOption);
	const token = result.token;
	return token;
}

export async function getUserInfo(token: string): Promise<IUserRespData> {
	const requestOption: IRequestOption = {
		url: baseUrl + urlPath.urlUserInfo,
		method: "GET",
		token: token,
	}
	const result = await request(requestOption);
	return result.data as IUserRespData;
}

export async function getWebInfo(token: string, link: string): Promise<IWebInfo> {
	const url = getURLSearchParams(baseUrl + urlPath.urlSearchEngineWebInfo, 
		{ url: link })
	const requestOption: IRequestOption = {
		url: url,
		method: "POST",
		token: token,
		contentType: "application/x-www-form-urlencoded",
	}
	const result = await request(requestOption);
	return result.data as IWebInfo;
}

export async function addArticle(token: string, webInfo: IWebInfo): Promise<IBookmark> {
	const url = getURLSearchParams(baseUrl + urlPath.urlSearchEngineNew,
		{
			type: "0",
			title: webInfo.title,
			description: webInfo.description,
			targetURL: webInfo.url,
			archiveName: "",
			archiveImgs: [],
			webContent: "",
		});
	const requestOption: IRequestOption = {
		url: url,
		method: "POST",
		token: token,
		contentType: "application/x-www-form-urlencoded"
	}
	const result = await request(requestOption);
	return result.data as IBookmark;
}

export async function deleteArticle(token: string, bookmarkId: string): Promise<void> {
	const url = baseUrl + urlPath.urlSearchEngineDelete + `/${bookmarkId}`;
	const requestOption: IRequestOption = {
		url: url, 
		method: "POST",
		token: token,
	}
	await request(requestOption);
}

export async function searchArticle(token: string, bookmarkId: string): Promise<IBookmark> {
	const url = getURLSearchParams(baseUrl + urlPath.urlBookmarkDetail,
		{ bookmarkId: bookmarkId });
	const requestOption: IRequestOption = {
		url: url,
		method: "GET",
		token: token,
	}
	const result = await request(requestOption);
	return result.data as IBookmark;
}

export async function getArticleContent(token: string, bookmarkId: string): Promise<IBookmarkContent> {
	const url = getURLSearchParams(baseUrl + urlPath.urlBookmarkContent,
		{ bookmarkId: bookmarkId });
	const requestOption: IRequestOption = {
		url: url,
		method: "GET",
		token: token,
	}
	const result = await request(requestOption);
	return result.data as IBookmarkContent;
}

export async function isExistArticle(token: string, link: string): Promise<IBookmarkExist> {
	const url = getURLSearchParams(baseUrl + urlPath.urlBookmarkExist,
		{ targetURL: link });
	const requestOption: IRequestOption = {
		url: url,
		method: "GET",
		token: token,
	}
	const result = await request(requestOption);
	return result.data as IBookmarkExist;
}

type exportType = "md" | "html" | "text";
export async function exportArticle(token: string, bookmarkId: string, type: exportType): Promise<string> {
	const url = getURLSearchParams(baseUrl + urlPath.urlSearchEngineExport, 
		{
			engineIds: bookmarkId,
			type: type,
			snap: false,
		});
	const requestOption: IRequestOption = {
		url: url,
		method: "POST",
		token: token,
	}
	const result = await request(requestOption);
	return result.data;
}