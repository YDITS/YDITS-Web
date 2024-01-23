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
 * アプリケーションで稼働するサービスを作成します。
 */
export class Service {
    constructor(app, config) {
        this.app = app;
        this.name = config.name;
        this.description = config.description;
        this.version = config.version;
        this.author = config.author;
        this.copyright = config.copyright;
    }


    get config() {
        return {
            app: this.app,
            name: this.name,
            description: this.description,
            version: this.version,
            author: this.author,
            copyright: this.copyright
        }
    }
}
