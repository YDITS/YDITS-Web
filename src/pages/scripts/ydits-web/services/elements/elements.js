/**!
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 * Licensed under the Apache License 2.0.
 * 
 * https://github.com/YDITS/YDITS-Web
 *
 */

import { App } from "../../../packages/app-creator/src/app.js";
import { Service } from "../../../packages/app-creator/src/service.js";

/**
 * 要素を管理する
 */
export class ElementsManager extends Service {
    /**
     * @param {App} app
     */
    constructor(app) {
        super(app, {
            name: "elementsManager",
            description: "要素を管理するサービス。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone",
        });
    }

    /**
     * @type {Object<string, HTMLElement>}
     */
    #elements = {};

    /**
     * 要素を追加する
     * @param {string} id
     * @returns {void}
     */
    addElementById(id) {
        if (this.#elements[id]) {
            return;
        }

        const element = document.getElementById(id);

        if (!element) {
            return;
        }

        this.#elements[id] = element;
    }

    /**
     * 複数の要素を追加する
     * @param {string[]} ids
     * @returns {void}
     */
    addElementsById(ids) {
        for (const id of ids) {
            this.addElementById(id);
        }
    }

    /**
     * 要素を取得する
     * @param {string} id 
     * @returns {HTMLElement}
     */
    getElementById(id) {
        if (!this.#elements[id]) {
            this.addElementById(id);
        }

        return this.#elements[id];
    }
}
