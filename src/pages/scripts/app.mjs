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
 * アプリケーションを作成する
 */
export class App {
    /**
     * @param {{
     *     name: string,
     *     description: string,
     *     version: typeof Version,
     *     author: string,
     *     copyright: string,
     * }} config
     */
    constructor({
        name,
        description,
        version,
        author,
        copyright
    }) {
        this.name = name;
        this.description = description;
        this.version = version;
        this.author = author;
        this.copyright = copyright;
    }


    /**
     * サービスをアプリに登録する
     * 
     * @param {typeof Service} NewService
     * @returns {void}
     */
    register(NewService) {
        const newService = new NewService(this);

        if (!newService.name) {
            throw new Error('`name` is required in the service.');
        }

        this.services[newService.name] = newService;
    }


    /**
     * このアプリのサービス
     * @returns {Object<string, Service>}
     */
    get services() {
        return this.#services;
    }


    /**
     * サービスオブジェクト
     * @type {Object<string, Service>}
     * @private
     */
    #services = {};
}
