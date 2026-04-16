/**!
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 * Licensed under the Apache License 2.0.
 * 
 * https://github.com/YDITS/YDITS-Web
 *
 */

/**
 * サービスワーカーのバックグラウンドプロセス
 */
class ServiceWorkerBackground {
    constructor() {
        this.#setupEventListeners();
    }


    /**
     * イベントリスナーをセットアップする
     * @returns {void}
     */
    #setupEventListeners() {
        self.addEventListener("install", async (event) => await this.#onInstall(event));
        self.addEventListener('push', async (event) => await this.#onPush(event));
        self.addEventListener('sync', async (event) => await this.#onSync(event));
    }


    /**
     * インストール時の処理
     * @param {Event} event
     * @returns {Promise<void>}
     */
    async #onInstall(event) {
        console.debug(self);
        console.debug(this);
    }


    /**
     * プッシュ通知を取得したときの処理
     * @param {PushEvent} event
     * @returns {Promise<void>}
     */
    async #onPush(event) {
        if (!event.data) {
            return;
        }

        const data = event.data;

        const pushPromise = (async () => {
            /** @type {{title?: string, body?: string}} */
            const parsedData = data.json();

            if (typeof parsedData.title !== "string" || typeof parsedData.body !== "string") {
                console.error("Invalid push data format:", parsedData);
                return;
            };
            
            await this.#showNotification({
                title: parsedData.title,
                message: parsedData.body,
            });
        })();

        event.waitUntil(pushPromise);
    }


    /**
     * 通知を表示する
     * @param {{
     *     title: string,
     *     message: string,
     * }} config
     * @returns {Promise<void>}
     */
    async #showNotification({
        title,
        message,
    }) {
        await self.registration.showNotification(
            title,
            {
                body: message,
            }
        );
    }


    /**
     * バックグラウンド同期を取得したときの処理
     * 
     * @param {SyncEvent} event
     * @returns {Promise<void>}
     */
    async #onSync(event) { }
}


new ServiceWorkerBackground();