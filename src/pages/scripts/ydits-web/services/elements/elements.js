/*
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the Apache License 2.0.
 *
 */

import { Service } from "../../../packages/app-creater/service.js";


/**
 * 要素を管理する
 */
export class ElementsManager extends Service {
    constructor(app) {
        super(app, {
            name: "elementsManager",
            description: "要素を管理するサービス。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone",
        });
    }

    #elements = {};

    /**
     * 要素を追加する
     * @param {string} id 
     */
    addElementById(id) {
        if (this.#elements[id]) {
            return;
        }

        this.#elements[id] = document.getElementById(id);
    }

    /**
     * 複数の要素を追加する
     * @param {string[]} ids 
     */
    addElementsById(ids) {
        for (const id of ids) {
            this.addElementById(id);
        }
    }

    /**
     * 要素を取得する
     * @param {string} id 
     * @returns {Element}
     */
    getElementById(id) {
        return this.#elements[id];
    }
}
