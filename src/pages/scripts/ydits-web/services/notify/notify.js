/*!
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
 * ページ内通知を扱う。
 */
export class Notify extends Service {
    /**
     * 通知の種類
     */
    static types = Object.freeze({
        _default: "_default",
        message: "message",
        error: "error",
        eew: "eew",
    });

    /**
     * 通知の種類をカラーに変換するobject
     */
    static typeToColor = Object.freeze({
        _default: "#404040",
        message: "#404040",
        error: "#ff5050",
        eew: "#f04040ff",
    });

    /**
     * 通知の種類をカラーに変換するobject
     */
    static typeToDefaultHideAfterMs = Object.freeze({
        _default: 1000 * 5,
        message: 1000 * 5,
        error: 1000 * 5,
        eew: 1000 * 180,
    });

    /**
     * @param {YditsWeb} app
     */
    constructor(app) {
        super(app, {
            name: "notify",
            description: "ページ内通知のサービス。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone",
        });

        this.app = app;
    }

    /**
     * アプリケーションインスタンス
     * @type {YditsWeb}
     * @override
     */
    app;

    /**
     * 最後の緊急地震速報通知ID
     * @type {number | undefined}
     */
    lastEewNotifyHideTimeoutId;

    /**
     * 最後の通知ID
     * @type {number | undefined}
     */
    lastNotifyHideTimeoutId;

    /**
     * 緊急地震速報(警報)の通知を表示する
     * @param {object} _
     * @param {string} _.title - 通知のタイトル
     * @param {string} _.body - 通知の内容
     * @param {number | undefined} [_.hideAfterMs] - 通知を非表示するまでの時間[ms]
     * @returns {void}
     */
    showEewNotify({
        title,
        body,
        hideAfterMs = Notify.typeToDefaultHideAfterMs.eew,
    }) {
        const $eewNotify = this.app.services.elementsManager.getElementById("eewNotify");
        const $eewNotifyTitle = this.app.services.elementsManager.getElementById("eewNotifyTitle");
        const $eewNotifyBody = this.app.services.elementsManager.getElementById("eewNotifyBody");

        $eewNotifyTitle.textContent = title;
        $eewNotifyBody.innerHTML = `<p>${body}</p>`;
        $eewNotify.style.backgroundColor = Notify.typeToColor.eew;
        $eewNotify.classList.add("active");

        clearTimeout(this.lastEewNotifyHideTimeoutId);

        this.lastEewNotifyHideTimeoutId = setTimeout(
            () => {
                this.hideEewNotify();
            },
            hideAfterMs
        );
    }

    /**
     * 通知を表示する。
     * @param {object} _ - 通知の種類
     * @param {keyof typeof Notify.types} [_.type] - 通知の種類
     * @param {string} _.title - 通知のタイトル
     * @param {string} _.body - 通知の内容
     * @param {number} [_.hideAfterMs] - 通知を非表示するまでの時間[ms]
     * @returns {void}
     */
    showNotify({
        type = Notify.types._default,
        title,
        body,
        hideAfterMs = Notify.typeToDefaultHideAfterMs._default
    }) {
        if (type === "eew") {
            return this.showEewNotify({
                title,
                body,
            });
        }

        const $notify = this.app.services.elementsManager.getElementById("notify");
        const $notifyTitle = this.app.services.elementsManager.getElementById("notifyTitle");
        const $notifyBody = this.app.services.elementsManager.getElementById("notifyBody");

        const color = Notify.typeToColor[type] || Notify.typeToColor._default;
        $notifyTitle.textContent = title;
        $notifyBody.innerHTML = `<p>${body}</p>`;
        $notify.style.backgroundColor = color;
        $notify.classList.add("active");

        clearTimeout(this.lastNotifyHideTimeoutId);

        this.lastNotifyHideTimeoutId = setTimeout(
            () => {
                this.hideNotify();
            },
            hideAfterMs
        );
    }

    /**
     * 緊急地震速報(警報)の通知を非表示にする
     * @returns {void}
     */
    hideEewNotify() {
        this.app.services.elementsManager.getElementById("eewNotify").classList.remove("active");
    }

    /**
     * 通知を非表示にする
     * @returns {void}
     */
    hideNotify() {
        this.app.services.elementsManager.getElementById("notify").classList.remove("active");
    }
}
