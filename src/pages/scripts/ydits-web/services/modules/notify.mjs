/*
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the Apache License 2.0.
 *
 */

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

        this.notifyElement = document.getElementById("notify");
        this.eewNotifyElement = document.getElementById("eewNotify");
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
            this.eewNotifyElement.innerHTML = `
                    <h3>${title}</h3>
                    <p>${text}</p>
                    <p style="margin-top: .5rem; font-size: .8rem;">ここをタップして警報画面を表示します。</p>
                `;
            this.eewNotifyElement.style.backgroundColor = color;
            this.eewNotifyElement.classList.add("active");

            clearTimeout(this.lastEewNotifyId);
            this.lastEewNotifyId = setTimeout(() => {
                this.hide(this.eewNotifyElement);
            }, eewHideAfter);
        } else {
            this.notifyElement.innerHTML = `
                    <h3>${title}</h3>
                    <p>${text}</p>
                `;
            this.notifyElement.style.backgroundColor = color;
            this.notifyElement.classList.add("active");

            clearTimeout(this.lastNotifyId);
            this.lastNotifyId = setTimeout(() => {
                this.hide(this.notifyElement);
            }, hideAfter);
        }
    }


    hide() {
        this.notifyElement.classList.remove("active");
    }
}
