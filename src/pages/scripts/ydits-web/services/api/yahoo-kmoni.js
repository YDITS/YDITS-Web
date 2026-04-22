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
import { DebugLogs } from "../debug-logs/debug-logs.js";
import { Notify } from "../notify/notify.js";
import { Settings } from "../settings/settings.js";
import { ElementsManager } from "../elements/elements.js";
import { Datetime } from "../datetime/datetime.js";
import { Eew } from "../eew/eew.js";

/**
 * Yahoo! 強震モニタを扱う
 */
export class YahooKmoni extends Service {
    /**
     * @param {YditsWeb} app
     */
    constructor(app) {
        super(app, {
            name: "yahooKmoni",
            description: "Yahoo! 強震モニタを扱うサービス。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

        /**
         * @type {{
         *     debugLogs: DebugLogs,
         *     notify: Notify,
         *     settings: Settings,
         *     elementsManager: ElementsManager,
         *     datetime: Datetime,
         *     eew: Eew,
         * }}
         */
        this.services = {
            get debugLogs() { return app.services.debugLogs; },
            get notify() { return app.services.notify; },
            get settings() { return app.services.settings; },
            get elementsManager() { return app.services.elementsManager; },
            get datetime() { return app.services.datetime; },
            get eew() { return app.services.eew; },
        }
    }

    /**
     * 緊急地震速報が発表されているかどうか
     * @type {boolean?}
     */
    isEew = null;

    /**
     * 最後のfetchの状態
     * @type {boolean?}
     */
    #fetchLastStatus = null;

    get fetchLastStatus() {
        return this.#fetchLastStatus;
    }

    set fetchLastStatus(value) {
        this.#fetchLastStatus = value;
        this.app.renderStatusLamp();
    }

    /**
     * URLを生成する
     * @returns {URL?}
     */
    #generateUrl() {
        const KMONI_DATETIME = this.makeKmoniDatetime();
        if (!KMONI_DATETIME) {
            return null;
        }

        return new URL(`https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/${KMONI_DATETIME}.json`);

        // --- debug
        // return new URL(`https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/20210213/20210213230859.json`);  //2021-2-13-23:08 Fukushima
        // return new URL("https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/20220529/20220529155631.json");  //2022-5-29-15:55 Ibaraki
        // return new URL(`https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/19700101/19700101000000.json`);  //1970-1-1-00:00 HTTP 403
        // return new URL(`https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/20200212/202002121937${this.#zeroPadding(this.services.datetime.seconds)}.json`);  //2020-2-12-19:36 double eew
        // return new URL(`https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/20240101/202401011610${this.#zeroPadding(this.services.datetime.seconds)}.json`);  //2024-1-1-16:10 Ishikawa
        // return new URL("https://www.lmoni.bosai.go.jp/monitor/webservice/hypo/eew/20220330001911.json");                 //2022-3-30-00:19 kmoni
        // ---
    }

    /**
     * フェッチする
     * @returns {Promise<null>}
     */
    async get() {
        if (this.services.settings.connect.eew !== 'yahoo-kmoni' || !navigator.onLine) {
            return null;
        }

        const URL = this.#generateUrl();

        if (!URL) {
            return null;
        }

        try {
            const response = await fetch(URL);

            if (!response.ok) {
                this.#onFetchError(new Error(`Failed to fetch: status code: HTTP ${response.status}`));
                return null;
            }

            const data = await response.json();

            if (!data) {
                return null;
            }

            this.fetchLastStatus = true;

            const HYPOCENTER = data.hypoInfo;

            if (HYPOCENTER === null) {
                this.services.eew.isEew = false;
                this.isEew = false;
                // this.services.eew.updateField();
                return null;
            }

            try {
                this.services.eew.isEew = true;
                this.isEew = true;

                const DATA = HYPOCENTER.items[0];

                if (this.services.eew.reports[DATA.reportId] === undefined) {
                    this.services.eew.reports[DATA.reportId] = new this.services.eew.Report();
                }

                this.services.eew.currentIdLast = this.services.eew.currentId;
                this.services.eew.currentId = DATA.reportId;

                this.services.eew.reports[DATA.reportId].reportNumLast = this.services.eew.reports[DATA.reportId].reportNum;
                this.services.eew.reports[DATA.reportId].reportNum = DATA.reportNum;
                if (
                    DATA.reportId === this.services.eew.reports[DATA.reportId].currentId &&
                    this.services.eew.reports[DATA.reportId].currentId !== null &&
                    this.services.eew.reports[DATA.reportId].reportNum !== this.services.eew.reports[DATA.reportId].reportNumLast
                ) {
                    return null;
                }

                this.services.eew.reports[DATA.reportId].originTime = new Date(DATA.originTime);

                if (!this.services.eew.reports[DATA.reportId].originTime) {
                    this.services.eew.reports[DATA.reportId].originTimeText = "----/--/-- --:--:--";
                } else {
                    this.services.eew.reports[DATA.reportId].originTimeText =
                        `${this.services.eew.reports[DATA.reportId].originTime.getFullYear()}/` +
                        `${this.#zeroPadding(this.services.eew.reports[DATA.reportId].originTime.getMonth() + 1)}/` +
                        `${this.#zeroPadding(this.services.eew.reports[DATA.reportId].originTime.getDate())} ` +
                        `${this.#zeroPadding(this.services.eew.reports[DATA.reportId].originTime.getHours())}:` +
                        `${this.#zeroPadding(this.services.eew.reports[DATA.reportId].originTime.getMinutes())}:` +
                        `${this.#zeroPadding(this.services.eew.reports[DATA.reportId].originTime.getSeconds())}`;
                }

                this.services.eew.reports[DATA.reportId].maxScaleLast = this.services.eew.reports[DATA.reportId].maxScale;

                switch (DATA.calcintensity) {
                    case "00":
                        this.services.eew.reports[DATA.reportId].maxScale = 0;
                        this.services.eew.reports[DATA.reportId].maxScaleText = "0";
                        break;

                    case "01":
                        this.services.eew.reports[DATA.reportId].maxScale = 10;
                        this.services.eew.reports[DATA.reportId].maxScaleText = "1";
                        break;

                    case "02":
                        this.services.eew.reports[DATA.reportId].maxScale = 20;
                        this.services.eew.reports[DATA.reportId].maxScaleText = "2";
                        break;

                    case "03":
                        this.services.eew.reports[DATA.reportId].maxScale = 30;
                        this.services.eew.reports[DATA.reportId].maxScaleText = "3";
                        break;

                    case "04":
                        this.services.eew.reports[DATA.reportId].maxScale = 40;
                        this.services.eew.reports[DATA.reportId].maxScaleText = "4";
                        break;

                    case "5-":
                        this.services.eew.reports[DATA.reportId].maxScale = 45;
                        this.services.eew.reports[DATA.reportId].maxScaleText = "5弱";
                        break;

                    case "5+":
                        this.services.eew.reports[DATA.reportId].maxScale = 50;
                        this.services.eew.reports[DATA.reportId].maxScaleText = "5強";
                        break;

                    case "6-":
                        this.services.eew.reports[DATA.reportId].maxScale = 55;
                        this.services.eew.reports[DATA.reportId].maxScaleText = "6弱";
                        break;

                    case "6+":
                        this.services.eew.reports[DATA.reportId].maxScale = 60;
                        this.services.eew.reports[DATA.reportId].maxScaleText = "6強";
                        break;

                    case "07":
                        this.services.eew.reports[DATA.reportId].maxScale = 70;
                        this.services.eew.reports[DATA.reportId].maxScaleText = "7";
                        break;

                    default:
                        this.services.eew.reports[DATA.reportId].maxScale = -1;
                        break;
                }

                if (DATA.regionName) {
                    this.services.eew.reports[DATA.reportId].regionName = DATA.regionName;
                } else {
                    this.services.eew.reports[DATA.reportId].regionName = "震源 不明";
                }

                if (DATA.isFinal == 'true') {
                    this.services.eew.reports[DATA.reportId].isFinal = true;
                    this.services.eew.reports[DATA.reportId].reportNumText = '最終報';
                } else {
                    this.services.eew.reports[DATA.reportId].reportNumText = `第${this.services.eew.reports[DATA.reportId].reportNum}報`;
                }

                if (DATA.magnitude) {
                    this.services.eew.reports[DATA.reportId].magnitude = Number(DATA.magnitude);
                    this.services.eew.reports[DATA.reportId].magnitudeText = `M${DATA.magnitude}`;
                } else {
                    this.services.eew.reports[DATA.reportId].magnitude = -1;
                    this.services.eew.reports[DATA.reportId].magnitudeText = 'M不明';
                }

                if (DATA.depth) {
                    this.services.eew.reports[DATA.reportId].depth = Number(DATA.depth.replace("km", ""));
                    this.services.eew.reports[DATA.reportId].depthText = `約${DATA.depth}`;
                } else {
                    this.services.eew.reports[DATA.reportId].depth = -1;
                    this.services.eew.reports[DATA.reportId].depthText = '不明';
                }

                if (DATA.isCancel == 'true') {
                    this.services.eew.reports[DATA.reportId].isCancel = true;
                    this.services.eew.reports[DATA.reportId].reportNumText = '取消報';
                } else {
                    this.services.eew.reports[DATA.reportId].isCancel = false;
                }

                this.services.eew.reports[DATA.reportId].latitude = data.psWave.items[0].latitude;
                this.services.eew.reports[DATA.reportId].longitude = data.psWave.items[0].longitude;
                this.services.eew.reports[DATA.reportId].psWave.pRadius = data.psWave.items[0].pRadius;
                this.services.eew.reports[DATA.reportId].psWave.sRadius = data.psWave.items[0].sRadius;

                // this.services.eew.updateField();
                // this.services.eew.sound();
                // this.services.eew.push();
            } catch (error) {
                console.error(error);
            }
        } catch (error) {
            this.#onFetchError(error);
        }

        return null;
    }

    /**
     * フェッチエラー時の処理
     * @param {*} error
     * @returns {void}
     */
    #onFetchError(error) {
        if (
            this.services.settings.connect.eew !== 'yahoo-kmoni' ||
            !navigator.onLine ||
            !this.fetchLastStatus
        ) {
            return;
        }

        this.services.debugLogs.add(
            "error",
            `[${this.name}]`,
            `Failed to fetch from yahooKmoni: ${error?.stack ?? error}`
        );

        this.services.notify.show(
            "error",
            "エラー",
            `
                Yahoo! 強震モニタ 接続エラー<br>
                強震モニタが一時的に利用できないか、ネットワークが低速な可能性があります。<br>
                <code>${error}</code>
            `
        );

        this.fetchLastStatus = false;
    }

    /**
     * Yahoo! 強震モニタの日時を生成する
     * @returns {string?}
     */
    makeKmoniDatetime() {
        let kmoniDatetime = new Date(this.services.datetime.gmt);

        if (!(kmoniDatetime instanceof Date)) return null;

        kmoniDatetime.setSeconds(kmoniDatetime.getSeconds() - 2);
        kmoniDatetime =
            `${kmoniDatetime.getFullYear()}` +
            `${this.#zeroPadding(kmoniDatetime.getMonth() + 1)}` +
            `${this.#zeroPadding(kmoniDatetime.getDate())}` +
            `/` +
            `${kmoniDatetime.getFullYear()}` +
            `${this.#zeroPadding(kmoniDatetime.getMonth() + 1)}` +
            `${this.#zeroPadding(kmoniDatetime.getDate())}` +
            `${this.#zeroPadding(kmoniDatetime.getHours())}` +
            `${this.#zeroPadding(kmoniDatetime.getMinutes())}` +
            `${this.#zeroPadding(kmoniDatetime.getSeconds())}`;

        return kmoniDatetime;
    }

    /**
     * 数値を二桁揃えする
     * @param {number} value
     * @returns {string}
     */
    #zeroPadding(value) {
        return String(value).padStart(2, "0");
    }
}
