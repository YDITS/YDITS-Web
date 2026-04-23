/**!
 *
 * App Creater
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the MIT License.
 *
 */

import { Version } from "https://cdn.yoneyo.com/scripts/version@1.1.0/version.js";

/**
 * アプリケーションを作成する
 */
export class App {
    /**
     * @param {{
     *     name: string,
     *     description: string,
     *     version: Version,
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
        this.services = {};
        this.#name = name;
        this.#description = description;
        this.#version = version;
        this.#author = author;
        this.#copyright = copyright;
    }


    /**
     * このアプリのサービス
     * @returns {Object<string, Service>}
     */
    services;


    /**
     * アプリの名前
     * @returns {string}
     */
    get name() {
        return this.#name;
    }


    /**
     * アプリの説明
     * @returns {string}
     */
    get description() {
        return this.#description;
    }


    /**
     * アプリのバージョン
     * @returns {Version | null}
     */
    get version() {
        return this.#version;
    }


    /**
     * アプリの作者
     * @returns {string}
     */
    get author() {
        return this.#author;
    }


    /**
     * アプリの著作権
     * @returns {string}
     */
    get copyright() {
        return this.#copyright;
    }


    /**
     * アプリの名前
     * @type {string}
     */
    #name = "";


    /**
     * アプリの説明
     * @type {string}
     */
    #description = "";


    /**
     * アプリのバージョン
     * @type {Version | null}
     */
    #version = null;


    /**
     * アプリの作者
     * @type {string}
     */
    #author = "";


    /**
     * アプリの著作権
     * @type {string}
     */
    #copyright = "";
}
