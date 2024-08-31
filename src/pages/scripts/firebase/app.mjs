/*
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the Apache License 2.0.
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