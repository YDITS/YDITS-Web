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
    get services() {
        return this.#services;
    }



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
     * サービスを登録する
     * 
     * @param {class<Service>} NewService
     * @returns {void}
     */
    registerService(NewService) {
        const newService = new NewService(this);

        if (!newService.name) {
            throw new Error('`name` is required in the service.');
        }

        this.services[newService.name] = newService;
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


    /**
     * サービスオブジェクト
     * @type {Object<string, Service>}
     * @private
     */
    #services = {};
}
