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
 * 地震情報を扱うサービスです。
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
     * 初期化を行います。
     */
    initialize() {
        this.settings = this.app.services.settings;
        this.p2pquake = this.app.services.api.p2pquake;

        switch (this.settings.connect.eqinfo) {
            case "p2pquake":
                break;
        }
    }


    /**
     * 地震情報に関連するすべての通信を再接続します。
     */
    reconnect() {
        this.app.services.api.p2pquake.startSocket();
    }


    /**
     * 地震情報に関連するすべての接続を切断します。
     */
    disconnect() {
        this.app.services.api.p2pquake.socket.close();
    }


    /**
     * 地震履歴に地震情報を追加します。
     */
    addToList(isFirst, num) {
        let html = `
            <li class="list list-${num}">
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
            $('#eqHistoryField').append(html);
        } else {
            $('#eqHistoryField').prepend(html);
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

        $(`#eqHistoryField>.list-${num}>.maxScale`).css({
            'background-color': bgcolor,
            'color': color
        });
    }


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