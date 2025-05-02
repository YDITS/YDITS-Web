/*
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the Apache License 2.0.
 *
 */

/**
 * アプリケーションで稼働するサービスを作成する
 */
export class Service {
    /**
     * @param {App} app 
     * @param {{
     *     name: string,
     *     description: string,
     *     version: typeof Version,
     *     author: string,
     *     copyright: string
     * }} config 
     */
    constructor(
        app,
        {
            name,
            description,
            version,
            author,
            copyright
        }
    ) {
        this.app = app;
        this.name = name;
        this.description = description;
        this.version = version;
        this.author = author;
        this.copyright = copyright;
    }
}
