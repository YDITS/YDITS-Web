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
import { Intensity } from "../modules/intensity.mjs";
import { Colors } from "../modules/colors.mjs";


/**
 * Wolfx API.
 */
export class Wolfx extends Service {
    constructor(app) {
        super(app, {
            name: "wolfx",
            description: "Wolfx API を扱うサービスです。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone",
        });

        this.initializeElements();

        this.fetch();
        this.connect();

        setInterval(
            (data) => this.update(data),
            1000,
            this.jmaEewData
        )
    }


    lastEventId = -1;
    lastMaxIntensity = "";
    lastSerial = -1;


    /**
     * Elements をイニシャライズする。
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
     * JMA EEW をRESTから取得する。
     */
    async fetch() {
        const rest = new WolfxJmaEewRest();
        this.jmaEewData = await rest.fetch();
        this.update(this.jmaEewData);
    }


    /**
     * JMA EEW Socket に接続する。
     */
    connect() {
        try {
            this.jmaEewSocket = new WolfxJmaEewSocket(
                { autoReconnect: true },
                {
                    onOpened: (isRetried) => this.onJmaEewSocketOpened(isRetried),
                    onClosed: () => this.onJmaEewSocketClosed(),
                    onUpdated: (data) => this.onJmaEewSocketUpdated(data),
                    onError: () => this.onJmaEewSocketError(),
                }
            );
        } catch (error) {
            throw new Error(`Failed to start connection to Wolfx JMA EEW WebSocket: ${error}`);
        }
    }


    /**
     * JMA EEW Socket から切断する。
     */
    disconnect() {
        try {
            this.jmaEewSocket.disconnect();
        } catch (error) {
            throw new Error(`Failed to start connection to Wolfx JMA EEW WebSocket: ${error}`);
        }
    }


    /**
     * JMA EEW Socket オープン時の処理。
     */
    onJmaEewSocketOpened(isRetried) {
        this.app.services.debugLogs.add(
            "network",
            `[${this.name}]`,
            `Connected to Wolfx JMA EEW WebSocket.`
        );

        if (isRetried) {
            this.app.services.notify.show(
                "message",
                "WebSocket再接続",
                "Wolfx JMA EEW に再接続しました。"
            );
        }
    }


    /**
     * JMA EEW Socket クローズ時の処理。
     */
    onJmaEewSocketClosed() {
        this.app.services.debugLogs.add(
            "network",
            `[${this.name}]`,
            `Disconnected from Wolfx JMA EEW WebSocket.`
        );

        if (!navigator.onLine) { return; }

        this.app.services.notify.show(
            "message",
            "WebSocket切断",
            "Wolfx JMA EEW から切断されました。再接続を試行します。"
        );
    }


    /**
    * JMA EEW Socket 情報更新時の処理。
    */
    onJmaEewSocketUpdated(data) {
        if (!(data instanceof WolfxJmaEewData)) return;
        this.jmaEewData = data;
    }


    /**
     * JMA EEW Socket エラー時の処理。
     */
    onJmaEewSocketError() {
        this.app.services.debugLogs.add(
            "error",
            `[${this.name}]`,
            `An error has occurred on Wolfx JMA EEW WebSocket.`
        );
    }


    /**
     * 表示更新。
     */
    update(data) {
        if (!data && !(data instanceof WolfxJmaEewData)) { return; }

        const nowTime = this.app.services.datetime.gmt;
        const isValid = data.isValid(nowTime);

        if (isValid) {
            this.onEew();
        } else {
            this.onNotEew();
        }
    }


    /**
     * EEW発表時。
     */
    onEew() {
        const scale = Intensity.wolfxToYdits[this.jmaEewData.maxIntensity];
        const bgcolorInt = Colors.scaleToColor[scale];
        const fontColorInt = Colors.scaleToFontColor[scale];
        const bgcolor = Colors.parseToCssColor(bgcolorInt);
        const fontColor = Colors.parseToCssColor(fontColorInt);

        this.finalText = this.jmaEewData.isFinal ? "最終" : "";

        this.eewTitleElement.textContent = `緊急地震速報 ${this.jmaEewData.serialText} (${this.finalText})`;
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
     * EEW未発表時。
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
    }


    /**
     * サウンドを再生する。
     */
    sound() {
        if (this.jmaEewData.isCancel) {
            if (this.app.services.settings.sound.eewCancel == true) {
                this.app.services.sounds.eewVoiceCancel.play();
            }
            return;
        }

        // ----- //

        if (!this.app.services.settings.sound.eewAny) { return }

        if (this.jmaEewData.isWarning) {
            this.app.services.sounds.eew.play();
            this.app.services.sounds.eewWarnVoice.play();
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
     * プッシュ通知を送信する。
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


/**
 * Woldfx JMA EEW REST.
 */
export class WolfxJmaEewRest {
    endpoint = new URL("https://api.wolfx.jp/jma_eew.json");


    /**
     * エンドポイントから情報を取得する。
     * @returns {WolfxJmaEewData} - 取得した Wolfx JMA EEW のデータクラス。
     */
    async fetch() {
        const response = await fetch(this.endpoint);

        if (!response.ok) {
            throw new Error(`Failed to fetch data from Wolfx JMA EEW REST API:\nresponse.status: ${response.status} ${response.statusText}`);
        }

        return new WolfxJmaEewData(await response.json());
    }
}


/**
 * Woldfx JMA EEW WebSocket.
 */
export class WolfxJmaEewSocket {
    /**
     * @param {Object} options
     * @param {Object} callbacks - 各コールバック関数のオブジェクト。
     */
    constructor(options, callbacks) {
        if (!callbacks.onOpened) {
            throw new Error("Required argument 'callbacks.onOpened' is not specified.");
        }

        if (!callbacks.onClosed) {
            throw new Error("Required argument 'callbacks.onClosed' is not specified.");
        }

        if (!callbacks.onUpdated) {
            throw new Error("Required argument 'callbacks.onUpdated' is not specified.");
        }

        if (!callbacks.onError) {
            throw new Error("Required argument 'callbacks.onUpdated' is not specified.");
        }

        this.callbacks = callbacks;

        /**
         * WebSocketクローズ時に再接続するかどうか。
         * @type {bool}
         */
        this.autoReconnect = options.autoReconnect || true;

        try {
            this.connect(this.endpoint);
        } catch (error) {
            throw new Error(`Failed to connect to Wolfx JMA EEW WebSocket: ${error}`);
        }
    }


    /**
     * エンドポイント。
     * @type {URL}
     */
    endpoint = new URL("wss://ws-api.wolfx.jp/jma_eew");


    /**
     * 接続中に取得したデータリスト。
     * @type {List}
     */
    data = [];


    /**
     * エンドポイントへWebSocket接続を開始する。
     */
    async connect(endpoint) {
        try {
            this.socket = new WebSocket(endpoint);
        } catch (error) {
            throw new Error(`Failed to connect to Wolfx JMA EEW WebSocket: ${error}`);
        }

        this.socket.addEventListener(
            "open",
            (event) => this.onOpened(
                event,
                (isRetried) => this.callbacks.onOpened(isRetried)
            )
        );

        this.socket.addEventListener(
            "close",
            (event) => this.onClosed(
                event,
                () => this.callbacks.onClosed()
            )
        );

        this.socket.addEventListener(
            "message",
            (event) => this.onMessage(
                event,
                (data) => this.callbacks.onUpdated(data)
            )
        );

        this.socket.addEventListener(
            "error",
            (event) => this.socketError(
                event,
                () => this.callbacks.onError()
            )
        );
    }


    /**
     * WebSocket接続を切断する。
     */
    disconnect() {
        this.socket.close();
    }


    /**
     * WebSocket接続がオープンした時の処理。
     * @param {Event} event
     * @param {Function} callback - コールバック関数。
     */
    onOpened(event, callback) {
        let isRetried = false;

        if (this.socketRetryCount > 0) isRetried = true;

        callback(isRetried);

        this.socketRetryCount = 0;
    }


    /**
     * WebSocket接続がクローズした時の処理。
     * @param {Event} event
     * @param {Function} callback - コールバック関数。
     */
    onClosed(event, callback) {
        this.socket = null;

        clearTimeout(this.retryTimeout);

        if (this.autoReconnect) {
            this.retryTimeout = setTimeout(
                (callback) => {
                    callback();
                    this.socketRetryCount++;
                },
                10 * 1000,
                () => this.connect(this.endpoint)
            );
        }

        callback();
    }


    /**
     * WebSocket接続でメッセージを受け取った時の処理。
     * @param {Event} event
     * @param {Function} callback - コールバック関数。
     */
    onMessage(event, callback) {
        try {
            let data = JSON.parse(event.data);

            if (data.type === "heartbeat") {
                try {
                    data = new WolfxHeartbeatData(data);
                } catch (error) {
                    throw new Error(`Failed to parse data of Wolfx Heartbeat JSON data: ${error}`);
                }
            } else if (data.type === "jma_eew") {
                try {
                    data = new WolfxJmaEewData(data);
                } catch (error) {
                    throw new Error(`Failed to parse data of Wolfx Heartbeat JSON data: ${error}`);
                }
            } else {
                throw new Error(`Unknown data type was response: ${data.type}`);
            }

            callback(data);
        } catch (error) {
            throw new Error(`Unhandled error at onMessage: ${error}`);
        }
    }


    /**
     * WebSocket接続でエラーが発生した時の処理。
     * @param {Event} event
     * @param {Function} callback - コールバック関数。
     */
    onError(event, callback) {
        callback();
    }
}


/**
 * Wolfx ハートビートパケット のデータクラス。
 * @param {JSON} jsonData - Wolfx ハートビートパケット のJSONデータクラス。
 */
export class WolfxHeartbeatData {
    constructor(data) {
        this.type = "heartbeat";
        this.ver = data["ver"] || null;
        this.id = data["id"] || null;
        this.timestamp = data["timestamp"] || null;
        this.message = data["message"] || null;
    }
}


/**
 * Wolfx JMA EEW のデータクラス。
 * @param {JSON} jsonData - Wolfx JMA EEW のJSONデータクラス。
 */
export class WolfxJmaEewData {
    constructor(data) {
        this.type = "jma_eew";
        this.title = data["Title"] || null;
        this.codeType = data["CodeType"] || null;
        this.issueSource = data["Issue"]["Source"] || null;
        this.issueStatus = data["Issue"]["Status"] || null;
        this.eventId = data["EventID"] || null;
        this.serial = data["Serial"] || null;
        this.announcedTime = data["AnnouncedTime"] && !isNaN(Date.parse(data["AnnouncedTime"])) ? new Date(data["AnnouncedTime"]) : null;
        this.originTime = data["OriginTime"] || null;
        this.hypocenter = data["Hypocenter"] || null;
        this.latitude = data["Latitude"] || null;
        this.longitude = data["Longitude"] || null;
        this.magnitude = data["Magunitude"] || null;
        this.depth = data["Depth"] || null;
        this.maxIntensity = data["MaxIntensity"] || null;
        this.accuracyEpicenter = data["Accuracy"]["Epicenter"] || null;
        this.accuracyDepth = data["Accuracy"]["Depth"] || null;
        this.accuracyMagnitude = data["Accuracy"]["Magunitude"] || null;
        this.maxIntChangeString = data["MaxIntChange"]["String"] || null;
        this.maxIntChangeReason = data["MaxIntChange"]["Reason"] || null;
        this.warnAreas = new WolfxJmaEewWarnAreas(data["WarnArea"]);
        this.isSea = data["isSea"];
        this.isTraining = data["isTraining"];
        this.isWarning = data["isWarn"];
        this.isFinal = data["isFinal"];
        this.isCancel = data["isCancel"];
        this.originalText = data["OriginalText"];
    }

    VALID_EEW_DURATION_SECONDS = 180;


    /**
     * 渡された日時において、緊急地震速報が有効かどうかを検証し、結果を返す。
     * 発表から3分以上経過している場合は無効とする。
     * @param {Datetime} nowTime - 検証対象の Datetime クラス。
     * @return {bool} - 緊急地震速報が有効かどうか。
     */
    isValid(nowTime) {
        const _nowTime = nowTime.getTime();
        const announcedTime = this.announcedTime.getTime();
        return this.VALID_EEW_DURATION_SECONDS >= ((_nowTime - announcedTime) / 1000)
    }


    get warnText() {
        return this.isWarning ? "警報" : "予報";
    }


    get serialText() {
        return `第${this.serial}報`;
    }


    get magnitudeText() {
        return `M ${this.magnitude}`;
    }


    get depthText() {
        if (typeof this.depth === "number") {
            return `約${this.depth}km`;
        } else {
            return "ごく浅い";
        }
    }
}


class WolfxJmaEewWarnAreas {
    constructor(areas = []) {
        areas.forEach(area => {
            this.areas.push(
                new WolfxJmaEewWarnArea(area)
            );
        });
    }
}


class WolfxJmaEewWarnArea {
    constructor(area = {}) {
        this.name = typeof area["Chiiki"] === "string" ? area["Chiiki"] : "";
        this.intUpper = Number.isInteger(area["Shindo1"]) ? area["Shindo1"] : null;
        this.intLower = Number.isInteger(area["Shindo2"]) ? area["Shindo2"] : null;
        this.time = area["Time"] && !isNaN(Date.parse(area["Time"])) ? new Date(area["Time"]) : null;
        this.type = typeof area["Type"] === "string" ? area["Type"] : "";
        this.arrive = area["Arrive"] || null;
    }


    get isWarn() {
        if (this.type === "警報") return true;
        if (this.type === "予報") return false;
        return null;
    }
}
