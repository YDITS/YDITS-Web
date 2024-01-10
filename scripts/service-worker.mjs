/*
 *
 * service-worker.mjs | YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

import { Service } from "./service.mjs";


/**
 * サービスワーカを管理するサービスです。
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

        this.debugLogs = app.services.debugLogs;
        this.register();
    }


    /**
     * サービスワーカを登録します。
     */
    async register() {
        if ("serviceWorker" in navigator) {
            try {
                const registration = await navigator.serviceWorker.register(
                    "./sw.js",
                    { scope: "./", }
                );

                if (registration.installing) {
                    this.debugLogs.add("INFO", `[INFO]`, "Service worker installing.");
                } else if (registration.waiting) {
                    this.debugLogs.add("INFO", `[INFO]`, "Service worker installed.");
                } else if (registration.active) { }
            } catch (error) {
                this.debugLogs.add("ERROR", `[ERROR]`, `Registration failed with ${error}`);
            }
        } else {
            this.debugLogs.add("INFO", `[INFO]`, "Service worker is not supported on this browser.");
        }
    }
}