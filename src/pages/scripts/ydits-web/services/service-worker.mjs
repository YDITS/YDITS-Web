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

import { Service } from "../../service.mjs";
import { PushNotify } from "./modules/push-notify.mjs";

/**
 * サービスワーカーを管理する。
 */
export class ServiceWorker extends Service {
    constructor(app) {
        super(app, {
            name: "serviceWorker",
            description: "サービスワーカを管理するサービスです。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

        this.register();
    }


    /**
     * サービスワーカを登録する。
     */
    async register() {
        if ("serviceWorker" in navigator) {
            try {
                this.registration = await navigator.serviceWorker.register(
                    "./scripts/sw.mjs",
                    { scope: "./scripts/", }
                );

                if (this.registration.installing) {
                    this.app.services.debugLogs.add("info", `[${this.name}]`, "Service worker installing.");
                } else if (this.registration.waiting) {
                    this.app.services.debugLogs.add("info", `[${this.name}]`, "Service worker installed.");
                } else if (this.registration.active) { }

                this.initializePushNotify();
            } catch (error) {
                this.app.services.debugLogs.add("error", `[${this.name}]`, `Registration failed with ${error}`);
            }
        } else {
            this.app.services.debugLogs.add("info", `[${this.name}]`, "Service worker is not supported on this browser.");
        }
    }


    /**
     * プッシュ通知をイニシャライズする。
     */
    initializePushNotify() {
        this.pushNotify = new PushNotify
    }
}