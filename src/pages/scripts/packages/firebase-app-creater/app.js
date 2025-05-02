/*
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the Apache License 2.0.
 *
 */

import { App } from "../app-creater/app.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js";

/**
 * Firebaseアプリケーションを作成する
 */
export class FirebaseApp extends App {
    /**
     * @param {{
     *     name: string,
     *     description: string,
     *     version: typeof Version,
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
        this.firebase = initializeApp(config.firebase);
        this.analytics = getAnalytics(this.firebase);
    }
}
