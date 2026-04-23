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
import { Intensity } from "../intensity/intensity.js";
import { Colors } from "../colors/colors.js";

import { YditsWeb } from "../../ydits-web.js";
import { WolfxJmaEewData } from "./data/jma-eew.js";
import { WolfxJmaEewRest } from "./jma-eew-rest.js";
import { WolfxJmaEewSocket } from "./jma-eew-websocket.js";
import { WolfxHeartbeatData } from "./data/heart-beat.js";

/**
 * Wolfx API
 */
export class Wolfx extends Service {
    /**
     * @param {YditsWeb} app
     */
    constructor(app) {
        super(app, {
            name: "wolfx",
            description: "Wolfx API を扱うサービス。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone",
        });

        this.app = app;

        this.initializeElements();

        this.fetch();
        this.connect();

        setInterval(
            () => this.update(this.jmaEewData),
            1000
        );
    }

    /**
     * アプリケーションインスタンス
     * @type {YditsWeb}
     * @override
     */
    app;

    /**
     * @type {WolfxJmaEewData?}
     */
    jmaEewData = null;

    /**
     * 最後のイベントID
     * @type {number | null}
     */
    lastEventId = null;

    /**
     * 最後の最大震度
     * @type {string | null}
     */
    lastMaxIntensity = null;

    /**
     * 最後のシリアル
     * @type {number | null}
     */
    lastSerial = null;

    /**
     * キャンセル報を受信した場合に、それを通知したかのフラグ
     * @type {boolean}
     */
    hasCancelNotified = false;

    /**
     * 警報を受信した場合に、それを通知したかのフラグ
     * @type {boolean}
     */
    hasWarningNotified = false;

    /**
     * Elements をイニシャライズする
     * @returns {void}
     */
    initializeElements() {
        this.eewFieldElement = document.getElementById("eewField");
        this.eewTitleElement = document.getElementById("eewTitle");
        this.eewCalcDesElement = document.getElementById("eewCalcDes");
        this.eewCalcElement = document.getElementById("eewCalc");
        this.eewRegionElement = document.getElementById("eewRegion");
        this.eewOriginTimeElement = document.getElementById("eewOrigin_time");
        this.eewMagnitudeElement = document.getElementById("eewMagnitude");
        this.eewDepthElement = document.getElementById("eewDepth");
    }

    /**
     * JMA EEW をRESTから取得する
     * @returns {Promise<void>}
     */
    async fetch() {
        const rest = new WolfxJmaEewRest();
        this.jmaEewData = await rest.fetch();
        this.update(this.jmaEewData);
    }

    /**
     * JMA EEW Socket に接続する
     * @returns {void}
     */
    connect() {
        if (this.jmaEewSocket?.socket?.readyState === WebSocket.OPEN) {
            return;
        }

        try {
            this.jmaEewSocket = new WolfxJmaEewSocket(
                { autoReconnect: true },
                {
                    onOpened: (event, isRetried) => this.onJmaEewSocketOpened(event, isRetried),
                    onClosed: (event) => this.onJmaEewSocketClosed(event),
                    onUpdated: (event, data) => this.onJmaEewSocketUpdated(event, data),
                    onError: (event) => this.onJmaEewSocketError(event),
                }
            );
        } catch (error) {
            throw new Error(`Failed to start connection to Wolfx JMA EEW WebSocket: ${error}`);
        }
    }

    /**
     * JMA EEW Socket から切断する
     * @returns {void}
     */
    disconnect() {
        try {
            if (this.jmaEewSocket?.socket?.readyState === WebSocket.OPEN) {
                this.jmaEewSocket.disconnect();
            }
        } catch (error) {
            throw new Error(`Failed to start connection to Wolfx JMA EEW WebSocket: ${error}`);
        }
    }

    /**
     * JMA EEW Socket オープン時の処理
     * @param {Event} event
     * @param {boolean} isRetried
     * @returns {void}
     */
    onJmaEewSocketOpened(event, isRetried) {
        this.app.services.debugLogs.add(
            "network",
            `[${this.name}]`,
            `Connected to Wolfx JMA EEW WebSocket.`
        );

        if (isRetried) {
            this.app.services.notify.show(
                "message",
                "WebSocket再接続",
                "Wolfx JMA EEW WebSocket に再接続しました。"
            );
        }
    }

    /**
     * JMA EEW Socket クローズ時の処理
     * @param {CloseEvent} event
     * @returns {void}
     */
    onJmaEewSocketClosed(event) {
        this.app.services.debugLogs.add(
            "network",
            `[${this.name}]`,
            `Disconnected from Wolfx JMA EEW WebSocket.`
        );

        if (!navigator.onLine) { return; }

        this.app.services.notify.show(
            "message",
            "WebSocket切断",
            "Wolfx JMA EEW WebSocket から切断しました。再接続試行中..."
        );
    }

    /**
    * JMA EEW Socket 情報更新時の処理
    * @param {MessageEvent<any>} event
    * @param {WolfxJmaEewData | WolfxHeartbeatData} data
    * @returns {void}
    */
    onJmaEewSocketUpdated(event, data) {
        if (!(data instanceof WolfxJmaEewData)) return;
        this.jmaEewData = data;
    }

    /**
     * JMA EEW Socket エラー時の処理
     * @param {Event} event
     * @returns {void}
     */
    onJmaEewSocketError(event) {
        this.app.services.debugLogs.add(
            "error",
            `[${this.name}]`,
            `An error has occurred on Wolfx JMA EEW WebSocket.`
        );
    }

    /**
     * 表示更新
     * @param {WolfxJmaEewData?} data
     * @returns {void}
     */
    update(data) {
        if (!(data instanceof WolfxJmaEewData)) return;

        const nowTime = this.app.services.datetime.gmt;
        const isValid = data.isValid(nowTime);

        if (isValid) {
            this.onEew();
        } else {
            this.onNotEew();
        }
    }

    /**
     * EEW発表時
     * @returns {void}
     */
    onEew() {
        const scale = Intensity.wolfxToYdits[this.jmaEewData?.maxIntensity];
        const bgcolorInt = Colors.scaleToColor[scale];
        const fontColorInt = Colors.scaleToFontColor[scale];
        const bgcolor = Colors.parseToCssColor(bgcolorInt);
        const fontColor = Colors.parseToCssColor(fontColorInt);

        this.finalText = this.jmaEewData.isFinal ? " (最終)" : "";

        this.eewTitleElement.textContent = `緊急地震速報 ${this.jmaEewData.serialText}${this.finalText}`;
        this.eewCalcDesElement.textContent = "最大震度";
        this.eewCalcElement.textContent = this.jmaEewData.maxIntensity;
        this.eewRegionElement.textContent = this.jmaEewData.hypocenter;
        this.eewOriginTimeElement.textContent = `発生日時: ${this.jmaEewData.originTime}`;
        this.eewMagnitudeElement.textContent = `規模 ${this.jmaEewData.magnitudeText}`;
        this.eewDepthElement.textContent = `深さ ${this.jmaEewData.depthText}`;
        this.eewFieldElement.style.backgroundColor = bgcolor;
        this.eewFieldElement.style.color = fontColor;

        this.eewFieldElement.ariaLabel = "緊急地震速報が発表中";
        this.eewFieldElement.ariaRoleDescription = `緊急地震速報が発表されています。${this.jmaEewData.originTime}頃、${this.jmaEewData.hypocenter}を震源とする地震が発生しました。最大震度は ${this.jmaEewData.maxIntensity} と推定されています。`;

        this.sound();
        this.push();

        this.lastEventId = this.jmaEewData.eventId;
        this.lastMaxIntensity = this.jmaEewData.maxIntensity;
    }

    /**
     * EEW未発表時
     * @returns {void}
     */
    onNotEew() {
        this.eewTitleElement.textContent = `緊急地震速報は発表されていません`;
        this.eewCalcDesElement.textContent = "";
        this.eewCalcElement.textContent = "";
        this.eewRegionElement.textContent = "";
        this.eewOriginTimeElement.textContent = "";
        this.eewMagnitudeElement.textContent = "";
        this.eewDepthElement.textContent = "";
        this.eewFieldElement.style.backgroundColor = "#404040ff";
        this.eewFieldElement.style.color = "#ffffffff";

        this.eewFieldElement.ariaLabel = "緊急地震速報は発表されていません";
        this.eewFieldElement.ariaLabel = "";

        this.hasCancelNotified = false;
        this.hasWarningNotified = false;
    }

    /**
     * サウンドを再生する
     * @returns {void}
     */
    sound() {
        if (this.jmaEewData.isCancel && !this.hasCancelNotified) {
            if (this.app.services.settings.sound.eewCancel == true) {
                this.app.services.sounds.eewVoiceCancel.play();
                this.hasCancelNotified = true;
            }
            return;
        }

        if (!this.app.services.settings.sound.eewAny) { return }

        if (this.jmaEewData.isWarning && !this.hasWarningNotified) {
            this.app.services.sounds.eew.play();
            this.app.services.sounds.eewWarnVoice.play();
            this.hasWarningNotified = true;
            return;
        }

        if (
            (this.jmaEewData.maxIntensity !== this.lastMaxIntensity) ||
            (this.jmaEewData.eventId !== this.lastEventId)
        ) {
            switch (this.jmaEewData.maxIntensity) {
                case "1":
                    this.app.services.sounds.eewVoice1.play();
                    break;

                case "2":
                    this.app.services.sounds.eewVoice2.play();
                    break;

                case "3":
                    this.app.services.sounds.eewVoice3.play();
                    break;

                case "4":
                    this.app.services.sounds.eewVoice4.play();
                    break;

                case "5-":
                    this.app.services.sounds.eewVoice5.play();
                    break;

                case "5+":
                    this.app.services.sounds.eewVoice6.play();
                    break;

                case "6-":
                    this.app.services.sounds.eewVoice7.play();
                    break;

                case "6+":
                    this.app.services.sounds.eewVoice8.play();
                    break;

                case "7":
                    this.app.services.sounds.eewVoice9.play();
                    break;

                default:
                    break;
            }
        }
    }


    /**
     * プッシュ通知を送信する
     * @returns {void}
     */
    push() {
        if (this.jmaEewData.serial === this.lastSerial) { return }

        try {
            if (this.jmaEewData.isCancel) {
                this.app.services.pushNotify.notify(
                    `緊急地震速報 (取消)`,
                    {
                        body: "先程の緊急地震速報は取り消されました。"
                    }
                );
            } else {
                if (
                    (this.jmaEewData.maxIntensity !== this.lastMaxIntensity) ||
                    (this.jmaEewData.eventId !== this.lastEventId)
                ) {
                    this.finalText = this.jmaEewData.isFinal ? " (最終)" : "";

                    this.app.services.pushNotify.notify(
                        `緊急地震速報 ${this.jmaEewData.serialText}${this.finalText}`,
                        {
                            body: `${this.jmaEewData.hypocenter}で地震発生。予想最大震度は${this.jmaEewData.maxIntensity}です。`
                        }
                    );
                }
            }
        } catch (error) {
            console.error(error);
        }
    }
}
