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

import { Service } from "../../../service.mjs"

/**
 * プッシュ通知を扱うサービス。
 */
export class PushNotify extends Service {
    constructor(app) {
        super(app, {
            name: "pushNotify",
            description: "プッシュ通知を扱うサービスです。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

        this.initialize();
    }


    /**
     * 初期化する。
     */
    initialize() {
        if (!this.isSupport) { return }
        if (this.isPremission) { return }

        this.requestPermission();
    }


    /**
     * プッシュ通知の権限を要求する。
    */
    requestPermission() {
        Notification.requestPermission()
            .then((permission) => this.checkRequestPermission(permission));
    }


    /**
     * プッシュ通知の権限要求に許可したか確認する。
     * @param {NotificationPermission} permission
    */
    checkRequestPermission(permission) {
        if (permission === "granted") {
            this.onGrantedPermission();
        }
    }


    /**
     * プッシュ通知の権限要求に許可した時の処理。
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
     * プッシュ通知を送信する。
     * @returns {Notification}
     */
    notify(title, options) {
        if (!this.isSupport) {
            throw new Error("Notification permission is not arrowed.");
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

        return new Notification(
            title,
            options
        )
    }


    /**
     * プッシュ通知に対応しているか。。
     * @returns {boolean} 対応している時はtrueを返す。
     */
    get isSupport() {
        if ("Notification" in window) {
            return true;
        } else {
            return false;
        }
    }


    /**
     * プッシュ通知の権限があるか。
     * @returns {boolean} 権限がある時はtrueを返す。
     */
    get isPremission() {
        if (Notification.permission === "granted") {
            return true;
        } else {
            return false;
        }
    }


    /**
     * プッシュ通知のアイコン画像のパスを返す。
     * @returns {URL} 画像のURL
     */
    get notifyIcon() {
        return new URL("https://cdn.ydits.net/images/ydits_logos/ydits_icon.png");
    }
}