/*
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the Apache License 2.0.
 *
 */

import { Service } from "../../service.mjs";

/**
 * サービスワーカーを管理する
 */
export class ServiceWorker extends Service {
    constructor(app) {
        super(app, {
            name: "serviceWorker",
            description: "サービスワーカを管理するサービス。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

        (async () => {
            await this.#register();
        })();
    }


    /**
     * @type {ServiceWorkerRegistration | null}
     */
    registration = null;


    /**
     * サービスワーカーがサポートされているかどうか
     * @type {boolean}
     */
    get isSupported() {
        if (this.#isSupported === null) {
            this.#isSupported = "serviceWorker" in navigator;
        }

        return this.#isSupported;
    }


    /**
     * Cache: サービスワーカーがサポートされているかどうか  
     * サポートされている場合は true とする。
     * @type {boolean | null}
     */
    #isSupported = null;


    /**
     * サービスワーカを登録する
     * @returns {Promise<void>}
     */
    async #register() {
        if (!this.isSupported) {
            this.app.services.add("info", `[${this.name}]`, "Service worker is not supported on this browser.");
            return;
        }

        try {
            this.registration = await navigator.serviceWorker.register(
                "/scripts/sw.mjs",
                { scope: "/scripts/", }
            );
        } catch (error) {
            await this.#onFailedToRegister(error);
        }

        if (!(this.registration instanceof ServiceWorkerRegistration)) return;

        if (this.registration.installing) {
            await this.#onServiceWorkerInstalling();
        } else if (this.registration.waiting) {
            await this.#onServiceWorkerInstalled();
        } else if (this.registration.active) {
            await this.#onServiceWorkerActive();
        }
    }


    /**
     * サービスワーカーがインストール中のときの処理
     * @returns {Promise<void>}
     */
    async #onServiceWorkerInstalling() {
        this.app.services.debugLogs.add("info", `[${this.name}]`, "Service Worker is being installed.");
    }


    /**
     * サービスワーカーがインストールされたときの処理
     * @returns {Promise<void>}
     */
    async #onServiceWorkerInstalled() {
        this.app.services.debugLogs.add("info", `[${this.name}]`, "Service worker has been installed.");
    }


    /**
     * サービスワーカーがアクティブなときの処理
     * @returns {Promise<void>}
     */
    async #onServiceWorkerActive() {
        this.app.services.debugLogs.add("info", `[${this.name}]`, "Service Worker has been activated.");
    }


    /**
     * サービスワーカーの登録に失敗したときの処理
     * @param {Error} error
     * @returns {Promise<void>}
     */
    async #onFailedToRegister(error) {
        this.app.services.debugLogs.add("error", `[${this.name}]`, `Failed to register Service Worker : ${error.stack}`);
    }
}
