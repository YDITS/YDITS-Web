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

export class ServiceManager {
    /**
     * @param {{
     *     app: App,
     * }}
     */
    constructor({ app }) {
        if (!(app instanceof App)) {
            throw new TypeError("The `app` parameter must be an instance of App.");
        }
        this.#app = app;
    }


    /**
     * サービスオブジェクト
     * @returns {Object<string, Service>}
     */
    get services() {
        return this.#services;
    }


    /**
     * サービスを登録する
     * @param {class<Service>} NewService
     * @returns {void}
     */
    register(NewService) {
        const newService = new NewService(this.#app);

        if (!newService.name) {
            throw new Error('`name` is required in the service.');
        }

        this.services[newService.name] = newService;
    }


    /**
     * アプリケーションインスタンス
     * @type {App | null}
     */
    #app = null;


    /**
     * サービスオブジェクト
     * @type {Object<string, Service>}
     */
    #services = {};
}