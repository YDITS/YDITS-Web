/*
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the Apache License 2.0.
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
