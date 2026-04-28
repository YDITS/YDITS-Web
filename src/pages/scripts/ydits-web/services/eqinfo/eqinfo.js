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
import { Notify } from "../notify/notify.js";

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

    /**
     * @param {YditsWeb} app
     */
    constructor(app) {
        super(app, {
            name: "eqinfo",
            description: "地震情報を扱うサービス。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
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
     * 震度をコードに変換するオブジェクト
     *
     * @type {Object<string, Object<string, string>>}
     */
    static scaleToColors = {
        "-1": {
            "bgcolor": "#8080c0",
            "color": "#ffffff"
        },
        "0": {
            "bgcolor": "#8080c0",
            "color": "#ffffff"
        },
        "10": {
            "bgcolor": "#808080",
            "color": "#ffffff"
        },
        "20": {
            "bgcolor": "#4040c0",
            "color": "#ffffff"
        },
        "30": {
            "bgcolor": "#40c040",
            "color": "#ffffff"
        },
        "40": {
            "bgcolor": "#c0c040",
            "color": "#ffffff"
        },
        "45": {
            "bgcolor": "#c0a040",
            "color": "#ffffff"
        },
        "50": {
            "bgcolor": "#c08040",
            "color": "#ffffff"
        },
        "55": {
            "bgcolor": "#c04040",
            "color": "#ffffff"
        },
        "60": {
            "bgcolor": "#a04040",
            "color": "#ffffff"
        },
        "70": {
            "bgcolor": "#804080",
            "color": "#ffffff"
        }
    }

    /**
     * 初期化する。
     */
    initialize() {
        this.app.services.notify.showNotify({
            type: Notify.types.message,
            title: "",
            body: `${this.name}をイニシャライズしています…`,
        });

        this.eqHistoryFieldElement = document.getElementById("eqHistoryField");

        switch (this.app.services.settings.connect.eqinfo) {
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
        this.app.services.api.p2pquake.socket?.close();
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

        if (this.maxScale in Eqinfo.scaleToColors) {
            bgcolor = Eqinfo.scaleToColors[this.maxScale]["bgcolor"];
            color = Eqinfo.scaleToColors[this.maxScale]["color"];
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
