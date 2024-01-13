/*
 *
 * YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

'use strict';

import { Service } from "../../service.mjs";

/**
 * サービスワーカーを管理するサービスです。
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
     * サービスワーカを登録します。
     */
    async register() {
        if ("serviceWorker" in navigator) {
            try {
                const registration = await navigator.serviceWorker.register(
                    "./scripts/sw.mjs",
                    { scope: "./scripts/", }
                );

                if (registration.installing) {
                    this.app.services.debugLogs.add("info", `[INFO]`, "Service worker installing.");
                } else if (registration.waiting) {
                    this.app.services.debugLogs.add("info", `[INFO]`, "Service worker installed.");
                } else if (registration.active) { }
            } catch (error) {
                this.app.services.debugLogs.add("error", `[ERROR]`, `Registration failed with ${error}`);
            }
        } else {
            this.app.services.debugLogs.add("info", `[info]`, "Service worker is not supported on this browser.");
        }
    }
}