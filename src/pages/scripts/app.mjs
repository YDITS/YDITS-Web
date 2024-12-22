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
        this.version = {
            major: config.version.major,
            minor: config.version.minor,
            patch: config.version.patch,
            level: config.version.level,
        }
        this.author = config.author;
        this.copyright = config.copyright;
    }


    get versionString() {
        if (this.version.level === App.versionLevels.beta) {
            return `${this.version.major}.${this.version.minor}.${this.version.patch} (beta)`;
        }

        return `${this.version.major}.${this.version.minor}.${this.version.patch}`;
    }


    static versionLevels = {
        final: "final",
        beta: "beta",
    }


    /**
     * 新規のサービスを登録します。
     */
    register(NewService) {
        const newService = new NewService(this);

        if (!newService.name) {
            throw new Error('`name` is required in the service.');
        }

        this.services[newService.name] = newService;
    }
}
