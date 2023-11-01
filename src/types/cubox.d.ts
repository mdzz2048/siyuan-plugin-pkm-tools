export interface IResponse {
    message: string,
    code: number,
    data: any,
    token: string,
    userId: string,
}

// path: /c/api/userInfo
export interface IUserRespData {
    id: string,
    userName: string,
    email: string,
    mobile: string,
    password: string,
    nickName: string,
    thirdNickName: string,
    admin: boolean,
    isThirdUser: boolean,
    level: number,
    payTime: string,
    expireTime: string,
    isExpire: boolean,
    receipt: string,
    paymentSource: string,
    region: string,
    thirdAccounts: string,
    expire: boolean,
    thirdUser: boolean,
}

// path: /c/api/v2/search_engine/webInfo
export interface IWebInfo {
    url: string,
    title: string,
    description: string,
    covers: IWebInfoCover[],
    tags: string[]
}

interface IWebInfoCover {
    key: string,
    src: string,
}

// path: /c/api/v2/search_engine/new
export interface IBookmark {
    hasMark: bool,
    inBlackOrWhiteList: bool,
    groupId: string,
    isRead: bool,
    description: string,
    title: string,
    archiving: bool,
    type: number,
    content: string,
    cover: string,
    resourceURL: string,
    articleWordCount: number,
    byline: string,
    userSearchEngineID: string,     // bookmarkId
    articleName: string,
    archiveName: string,
    updateTime: string,
    finished: bool,
    marks: string[],
    tags: string[],
    homeURL: string,
    groupName: string,
    markCount: number,
    createTime: string,
    starTarget: bool,
    targetURL: string,
    status: string,
}

// path: /c/api/bookmark/exist
export interface IBookmarkExist {
    exist: boolean,
    bookmarkId: string,
}

// path: /c/api/bookmark/content
export interface IBookmarkContent {
    content: string,
    marks: IMark[],
}

export interface IMark {
    markID: string,
    startParentTagName: string,
    startTextOffset: number,
    startParentIndex: number,
    endParentTagName: string,
    endTextOffset: number,
    endParentIndex: number,
    index: number,
    text: string,
    engineID: string,
    noteText: string,
    links: string,
    createTime: string,
    updateTime: string,
    type: number,
    colorType: number,
    ratio: number,
    url: string,
    cover: string,
    isPrivate: false,
    status: null,
    searchEngine: null,
    private: false
}

// path: /c/api/group/my/other
export interface IMyOtherInfo {
    allSize: number,
    inboxSize: number,
    todaySize: number,
    starSize: number,
}