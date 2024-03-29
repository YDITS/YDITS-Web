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

import { Service } from "../../../service.mjs";

/**
 * ページ内通知を扱う。
 */
export class Notify extends Service {
    lastNotifyId = null;
    lastEewNotifyId = null;


    constructor(app) {
        super(app, {
            name: "notify",
            description: "ページ内通知のサービスです。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        })

        this.$notify = $("#notify");
        this.$eewNotify = $("#eewNotify");
    }


    show(type, title, text) {
        let color = null;
        let hideAfter = null;
        let eewHideAfter = null;

        switch (type) {
            case "message":
                color = "#404040ff";
                hideAfter = 5000;
                break;

            case "error":
                color = "#ff5050ff";
                hideAfter = 5000;
                break;

            case "eew":
                color = "#f04040ff";
                eewHideAfter = 180 * 1000;
                break;

            default:
                color = "#404040ff";
                hideAfter = 5000;
                break;
        }

        if (type === "eew") {
            this.$eewNotify
                .html(`
                    <h3>${title}</h3>
                    <p>${text}</p>
                `)
                .css({
                    "background-color": color
                })
                .addClass("active");
            clearTimeout(this.lastEewNotifyId);
            this.lastEewNotifyId = setTimeout(() => {
                this.hide(this.$eewNotify);
            }, eewHideAfter);
        } else {
            this.$notify
                .html(`
                    <h3>${title}</h3>
                    <p>${text}</p>
                `)
                .css({
                    "background-color": color
                })
                .addClass("active");
            clearTimeout(this.lastNotifyId);
            this.lastNotifyId = setTimeout(() => {
                this.hide(this.$notify);
            }, hideAfter);
        }
    }


    hide(element) {
        element.removeClass("active");
    }
}
