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

import { Service } from "../../../packages/app-creator/src/service.js";
import { YditsWeb } from "../../ydits-web.js";

/**
 * プッシュ通知を扱う。
 */
export class PushNotify extends Service {
    /**
     * @param {YditsWeb} app
     */
    constructor(app) {
        super(app, {
            name: "pushNotify",
            description: "プッシュ通知を扱うサービス。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

        this.app = app;

        this.initialize();
    }

    /**
     * アプリケーションインスタンス
     * @type {YditsWeb}
     * @override
     */
    app;

    /**
     * 初期化する。
     * @returns {void}
     */
    initialize() {
        if (!this.isSupport) { return }
        if (this.isPremission) { return }

        this.requestPermission();
    }

    /**
     * プッシュ通知の権限を要求する。
     * @returns {void}
     */
    requestPermission() {
        Notification.requestPermission()
            .then((permission) => this.checkRequestPermission(permission));
    }

    /**
     * プッシュ通知の権限要求に許可したか確認する。
     * @param {NotificationPermission} permission
     * @returns {void}
     */
    checkRequestPermission(permission) {
        if (permission === "granted") {
            this.onGrantedPermission();
        }
    }

    /**
     * プッシュ通知の権限要求に許可した時の処理。
     * @returns {void}
     */
    onGrantedPermission() {
        this.notify(
            "YDITS for Web",
            {
                body: "通知はこのように表示されます。"
            }
        );
    }

    /**
     * 通知を送信する。
     * @param {string} title 通知のタイトル
     * @param {NotificationOptions} options 通知のオプション
     * @returns {Notification | void}
     */
    notify(title, options) {
        if (!this.isSupport) {
            throw new Error("Notification permission is not allowed.");
        }

        if (options.icon !== undefined) {
            options.icon = this.notifyIcon;
        }

        if (options.onClick !== undefined) {
            options.onClick = function () {
                window.focus();
                this.close();
            }
        }

        try {
            return this.app.services.serviceWorker.registration.showNotification(
                title,
                options
            );
        } catch (error) {
            const errorMessage = `Could not push notification: ${error.stack}`;

            console.error(errorMessage);

            this.app.services.debugLogs.add(
                "error",
                `[${this.name}]`,
                errorMessage
            );
        }
    }

    /**
     * プッシュ通知に対応しているか。
     * @type {boolean} 対応している時はtrueを返す。
     */
    get isSupport() {
        return ("Notification" in window);
    }

    /**
     * プッシュ通知の権限があるか。
     * @type {boolean} 権限がある時はtrueを返す。
     */
    get isPremission() {
        return (Notification.permission === "granted");
    }

    /**
     * プッシュ通知のアイコン画像のパスを返す。
     * @type {URL} 画像のURL
     */
    get notifyIcon() {
        return new URL("https://cdn.ydits.net/images/ydits_logos/ydits_icon.png");
    }
}
