/*
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the Apache License 2.0.
 *
 */

'use strict';

import { Service } from "../../../service.mjs";

/**
 * 地震情報を扱う。
 */
export class Eqinfo extends Service {
    eqinfoNum = 0;
    type = null;
    originTime = null;
    originTimeText = null;
    regionName = null;
    maxScale = null;
    maxScaleText = null;
    magnitude = null;
    magnitudeText = null;
    depth = null;
    depthText = null;
    tsunami = null;
    tsunamiText = null;


    constructor(app) {
        super(app, {
            name: "eqinfo",
            description: "地震情報を扱うサービスです。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });
    }


    /**
     * 初期化する。
     */
    initialize() {
        this.app.services.notify.show("message", "", `${this.name}をイニシャライズしています…`);

        this.eqHistoryFieldElement = document.getElementById("eqHistoryField");

        this.settings = this.app.services.settings;
        this.p2pquake = this.app.services.api.p2pquake;

        switch (this.settings.connect.eqinfo) {
            case "p2pquake":
                break;
        }
    }


    /**
     * 地震情報に関連するすべての通信を再接続する。
     */
    reconnect() {
        this.app.services.api.p2pquake.startSocket();
    }


    /**
     * 地震情報に関連するすべての接続を切断する。
     */
    disconnect() {
        this.app.services.api.p2pquake.socket.close();
    }


    /**
     * 地震履歴に地震情報を追加する。
     */
    addToList(isFirst, num) {
        let html = `
            <li
                class="list list-${num}"
                tabindex="0"
                role="button"
                aria-disabled="false"
                aria-label="地震情報"
                aria-roledescription="地震履歴の項目${num + 1}。${this.convertDateFormat(this.originTimeText)}頃、${this.regionName}で最大震度${this.maxScaleText}の地震がありました。地震の規模は${this.magnitudeText}、震源の深さは${this.depthText}と推定されます。この地震による${this.tsunamiJp}">
                <div class="maxScale">
                    <p>${this.maxScaleText}</p>
                </div>

                <div class="right">
                    <p class="hypocenter">${this.regionName}</p>
                    <p>${this.originTimeText}</p>
                    <div class="hypoInfo">
                        <p>${this.depthText}</p>
                        <p>${this.magnitudeText}</p>
                    </div>
                    <p>${this.tsunamiJp}</p>
                </div>
            </li>
        `;

        if (isFirst) {
            document.getElementById('eqHistoryField').insertAdjacentHTML("beforeend", html);
        } else {
            document.getElementById('eqHistoryField').insertAdjacentHTML("afterbegin", html);
        }

        let bgcolor;
        let color;

        if (this.maxScale in this.app.services.api.p2pquake.colors) {
            bgcolor = this.app.services.api.p2pquake.colors[this.maxScale]["bgcolor"];
            color = this.app.services.api.p2pquake.colors[this.maxScale]["color"];
        } else {
            bgcolor = "#404040ff";
            color = "#ffffffff";
        }

        document.querySelector(`#eqHistoryField>.list-${num}>.maxScale`).style.backgroundColor = bgcolor;
        document.querySelector(`#eqHistoryField>.list-${num}>.maxScale`).style.color = color;
    }


    convertDateFormat(dateString) {
        const regex = /(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2})/;
        const match = dateString.match(regex);

        if (match) {
            const year = match[1];
            const month = match[2];
            const day = match[3];
            const hour = match[4];
            const minute = match[5];

            return `${year}年${month}月${day}日 ${hour}時${minute}分`;
        } else {
            throw new Error("Invalid date format");
        }
    }


    /**
     * 効果音を再生する。
     * @returns 
     */
    sound() {
        if (!(this.app.services.settings.sound.eqinfo)) { return }

        switch (this.app.services.eqinfo.maxScale) {
            case 10:
                this.app.services.sounds.eqinfo.play();
                this.app.services.sounds.eqinfoVoice1.play();
                break;

            case 20:
                this.app.services.sounds.eqinfo.play();
                this.app.services.sounds.eqinfoVoice2.play();
                break;

            case 30:
                this.app.services.sounds.eqinfo.play();
                this.app.services.sounds.eqinfoVoice3.play();
                break;

            case 40:
                this.app.services.sounds.eqinfo.play();
                this.app.services.sounds.eqinfoVoice4.play();
                break;

            case 45:
                this.app.services.sounds.eqinfo.play();
                this.app.services.sounds.eqinfoVoice5.play();
                break;

            case 50:
                this.app.services.sounds.eqinfo.play();
                this.app.services.sounds.eqinfoVoice6.play();
                break;

            case 55:
                this.app.services.sounds.eqinfo.play();
                this.app.services.sounds.eqinfoVoice7.play();
                break;

            case 60:
                this.app.services.sounds.eqinfo.play();
                this.app.services.sounds.eqinfoVoice8.play();
                break;

            case 70:
                this.app.services.sounds.eqinfo.play();
                this.app.services.sounds.eqinfoVoice9.play();
                break;

            default:
                this.app.services.sounds.eqinfo.play();
                break;
        }
    }
}
