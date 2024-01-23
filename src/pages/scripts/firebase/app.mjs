/*
 *
 * YDITS for Web
 *
 * Copyright (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

'use strict';

import { App } from "../app.mjs";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js";

/**
 * Firebaseアプリケーションを作成します。
 */
export class FirebaseApp extends App {
    constructor(config) {
        super(config);
        this.firebase = initializeApp(config.firebase);
        this.analytics = getAnalytics(this.firebase);
    }
}