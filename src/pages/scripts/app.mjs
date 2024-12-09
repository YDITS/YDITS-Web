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
    register(NewService) {
        const newService = new NewService(this);

        if (!newService.name) {
            throw new Error('Serviceにnameプロパティが設定されていません');
        }

        this.services[newService.name] = newService;
    }
}
