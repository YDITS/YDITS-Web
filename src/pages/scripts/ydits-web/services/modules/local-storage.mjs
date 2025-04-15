/*
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the Apache License 2.0.
 *
 */

import { Service } from "../../../service.mjs";

export class LocalStorage extends Service {
    constructor(app) {
        super(app, {
            name: "localStorage",
            description: "ローカルストレージを扱うサービス。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

        this._cacheLocationArea = this._localStorageGetItem(LocalStorage.cacheLocationAreaKey);
    }


    static cacheLocationAreaKey = "cacheLocationArea";


    get cacheLocationArea() {
        return this._cacheLocationArea;
    }


    set cacheLocationArea(value) {
        this._cacheLocationArea = value;
        this._localStorageSetItem(LocalStorage.cacheLocationAreaKey, value);
    }


    _localStorageGetItem(key) {
        try {
            return window.localStorage.getItem(key);
        } catch (error) {
            throw new Error(`Could not get localStorage item as ${key}: ${error.stack}`);
        }
    }


    _localStorageSetItem(key, value) {
        try {
            return window.localStorage.setItem(key, value);
        } catch (error) {
            throw new Error(`Could not set localStorage item as ${key}: ${error.stack}`);
        }
    }
}
