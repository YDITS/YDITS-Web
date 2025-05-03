/**!
 *
 * App Creater
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the MIT License.
 *
 */

import { App } from "./app.js";

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
        this.#app = app;
        this.#name = name;
        this.#description = description;
        this.#version = version;
        this.#author = author;
        this.#copyright = copyright;
    }


    /**
     * アプリケーションインスタンス
     * @returns {App | null}
     */
    get app() {
        return this.#app;
    }

    /**
     * サービスの名前
     * @returns {string}
     */
    get name() {
        return this.#name;
    }


    /**
     * サービスの説明
     * @returns {string}
     */
    get description() {
        return this.#description;
    }


    /**
     * サービスのバージョン
     * @returns {Version | null}
     */
    get version() {
        return this.#version;
    }


    /**
     * サービスの作者
     * @returns {string}
     */
    get author() {
        return this.#author;
    }


    /**
     * サービスの著作権
     * @returns {string}
     */
    get copyright() {
        return this.#copyright;
    }


    /**
     * アプリケーションインスタンス
     * @type {App | null}
     */
    #app = null;


    /**
     * サービスの名前
     * @type {string}
     */
    #name = "";


    /**
     * サービスの説明
     * @type {string}
     */
    #description = "";


    /**
     * サービスのバージョン
     * @type {Version | null}
     */
    #version = null;


    /**
     * サービスの作者
     * @type {string}
     */
    #author = "";


    /**
     * サービスの著作権
     * @type {string}
     */
    #copyright = "";
}