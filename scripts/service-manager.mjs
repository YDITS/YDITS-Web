/*
 *
 * ydits-web.mjs | YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

import { Service } from "./service.mjs";


/**
 * アプリケーションで稼働しているサービスを管理します。
 */
export class ServiceManager extends Service {
    constructor(app) {
        super(app, {
            name: "serviceManager",
            description: "アプリケーションで稼働しているサービスを管理するサービスです。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });
    }


    get services() {
        return this._app.services;
    }


    /**
     * 新規のサービスを登録します。
     */
    register(service) {
        const newService = new service(this._app, service.config);
        this._app.services[newService.id] = newService;
    }
}
