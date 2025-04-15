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
import { DebugLogs } from "./modules/debug-logs.mjs";
import { PushNotify } from "./modules/push-notify.mjs";

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

        this.#appServices = app.services;
        this.#debugLogsService = this.#appServices.debugLogs;

        this.#register();
    }


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
     * アプリケーションサービス
     * @type {Service | null}
     */
    #appServices = null;


    /**
     * デバッグログサービス
     * @type {DebugLogs | null}
     */
    #debugLogsService = null;


    /**
     * Cache: サービスワーカーがサポートされているかどうか
     * @type {boolean | null}
     */
    #isSupported = null;


    /**
     * サービスワーカを登録する
     * @returns {Promise<void>}
     */
    async #register() {
        if (!this.isSupported) {
            this.#debugLogsService.add("info", `[${this.name}]`, "Service worker is not supported on this browser.");
            return;
        }

        try {
            this.registration = await navigator.serviceWorker.register(
                "./scripts/sw.mjs",
                { scope: "./scripts/", }
            );

            if (this.registration.installing) {
                await this.#onServiceWorkerInstalling();
            } else if (this.registration.waiting) {
                await this.#onServiceWorkerInstalled();
            } else if (this.registration.active) {
                await this.#onServiceWorkerActive();
            }

            await this.#initializePushNotify();
        } catch (error) {
            await this.#onFailedToRegister(error);
        }
    }


    /**
     * サービスワーカーがインストール中のときの処理
     * @returns {Promise<void>}
     */
    async #onServiceWorkerInstalling() {
        this.#debugLogsService.add("info", `[${this.name}]`, "Service worker installing.");
    }


    /**
     * サービスワーカーがインストールされたときの処理
     * @returns {Promise<void>}
     */
    async #onServiceWorkerInstalled() {
        this.#debugLogsService.add("info", `[${this.name}]`, "Service worker installed.");
    }


    /**
     * サービスワーカーがアクティブなときの処理
     * @returns {Promise<void>}
     */
    async #onServiceWorkerActive() { }


    /**
     * サービスワーカーの登録に失敗したときの処理
     * @param {Error} error
     * @returns {Promise<void>}
     */
    async #onFailedToRegister(error) {
        this.#debugLogsService.add("error", `[${this.name}]`, `Service worker registration failed: ${error.stack}`);
    }


    /**
     * プッシュ通知をイニシャライズする
     * @returns {Promise<void>}
     */
    async #initializePushNotify() {
        this.pushNotify = new PushNotify(this.app);
    }
}
