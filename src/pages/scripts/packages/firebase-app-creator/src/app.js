/*!
 *
 * Firebase App Creater
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the MIT License.
 *
 */

import { Version } from "https://cdn.yoneyo.com/scripts/version@1.1.0/version.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js";
import { App } from "../../app-creator/src/app.js";

/**
 * Firebaseアプリケーションを作成する
 */
export class FirebaseApp extends App {
    /**
     * @param {{
     *     name: string,
     *     description: string,
     *     version: Version,
     *     author: string,
     *     copyright: string,
     *     firebase: {
     *         apiKey: string,
     *         authDomain: string,
     *         projectId: string,
     *         storageBucket: string,
     *         messagingSenderId: string,
     *         appId: string,
     *         measurementId: string,
     *     },
     * }} config
     */
    constructor(config) {
        super(config);
        this.#firebase = initializeApp(config.firebase);
        this.#firebaseAnalytics = getAnalytics(this.#firebase);
    }


    /**
     * Firebaseアプリケーションインスタンス
     * @type {any}
     */
    #firebase = null;


    /**
     * Firebaseアナリティクスインスタンス
     * @type {any}
     */
    #firebaseAnalytics = null;
}
