/*!
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 * Licensed under the Apache License 2.0.
 *
 * https://github.com/YDITS/YDITS-Web
 *
 */

import { Service } from "../../../packages/app-creator/src/service.js";
import { YditsWeb } from "../../ydits-web.js";

/**
 * 要素を管理する
 */
export class ElementsManager extends Service {
    /**
     * @param {YditsWeb} app
     */
    constructor(app) {
        super(app, {
            name: "elementsManager",
            description: "要素を管理するサービス。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone",
        });

        this.app = app;
    }

    /**
     * アプリケーションインスタンス
     * @type {YditsWeb}
     * @override
     */
    app;

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
