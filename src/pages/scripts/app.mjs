/*
 *
 * YDITS for Web
 *
 * Copyright (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

'use strict';

/**
 * アプリケーションを作成します。
 */
export class App {
    services = {};


    constructor(config) {
        this.name = config.name;
        this.description = config.description;
        this.version = config.version;
        this.author = config.author;
        this.copyright = config.copyright;
    }


    /**
     * 新規のサービスを登録します。
     */
    register(Service) {
        const newService = new Service(this);
        this.services[newService.name] = newService;
    }
}
