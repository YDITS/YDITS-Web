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

/**
 * Yahoo! 強震モニタを扱う
 */
export class YahooKmoni extends Service {
    /**
     * @param {App} app 
     */
    constructor(app) {
        super(app, {
            name: "yahooKmoni",
            description: "Yahoo! 強震モニタを扱うサービス。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });
    }


    static #STATUS_LAMP_ELEMENT = document.getElementById("statusLamp");


    static #STATUS_LAMP_COLORS = {
        error: "#ff4040",
        success: "#40ff40"
    };


    /**
     * 緊急地震速報が発表されているかどうか
     * @type {boolean | null}
     */
    isEew = null;


    /**
     * 最後のフェッチの状態
     * @type {boolean | null}
     */
    fetchLastStatus = null;


    #kmoniUrl() {
        const KMONI_DATETIME = this.makeKmoniDatetime();
        if (KMONI_DATETIME === null) return null;

        return new URL(`https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/${KMONI_DATETIME}.json`);

        // --- debug
        // return new URL(`https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/20210213/20210213230859.json`);  //2021-2-13-23:08 Fukushima
        // return new URL("https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/20220529/20220529155631.json");  //2022-5-29-15:55 Ibaraki
        // return new URL(`https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/19700101/19700101000000.json`);  //1970-1-1-00:00 HTTP 403
        // return new URL(`https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/20200212/202002121937${this.#zeroPadding(this.app.services.datetime.seconds)}.json`);  //2020-2-12-19:36 double eew
        // return new URL(`https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/20240101/202401011610${this.#zeroPadding(this.app.services.datetime.seconds)}.json`);  //2024-1-1-16:10 Ishikawa
        // return new URL("https://www.lmoni.bosai.go.jp/monitor/webservice/hypo/eew/20220330001911.json");                 //2022-3-30-00:19 kmoni
        // ---
    }


    /**
     * フェッチする
     * 
     * @returns {Promise<{string: any} | null>}
     */
    async get() {
        if (this.app.services.settings.connect.eew !== 'yahoo-kmoni') return;
        if (!navigator.onLine) return;

        const URL = this.#kmoniUrl();
        if (URL === null) return;

        try {
            const response = await fetch(URL);

            if (!response.ok) {
                this.#onFetchError(new Error(`Failed to fetch: status code: HTTP ${response.status}`));
                return null;
            }

            const data = await response.json();

            if (data === null) return;

            YahooKmoni.#STATUS_LAMP_ELEMENT.style.backgroundColor = YahooKmoni.#STATUS_LAMP_COLORS.success;
            this.fetchLastStatus = true;

            const HYPOCENTER = data.hypoInfo;

            if (HYPOCENTER === null) {
                this.app.services.eew.isEew = false;
                this.isEew = false;
                // this.app.services.eew.updateField();
                return;
            }

            try {
                this.app.services.eew.isEew = true;
                this.isEew = true;

                const DATA = HYPOCENTER.items[0];

                if (this.app.services.eew.reports[DATA.reportId] === undefined) {
                    this.app.services.eew.reports[DATA.reportId] = new this.app.services.eew.Report();
                }

                this.app.services.eew.currentIdLast = this.app.services.eew.currentId;
                this.app.services.eew.currentId = DATA.reportId;

                this.app.services.eew.reports[DATA.reportId].reportNumLast = this.app.services.eew.reports[DATA.reportId].reportNum;
                this.app.services.eew.reports[DATA.reportId].reportNum = DATA.reportNum;
                if (
                    DATA.reportId === this.app.services.eew.reports[DATA.reportId].currentId &&
                    this.app.services.eew.reports[DATA.reportId].currentId !== null &&
                    this.app.services.eew.reports[DATA.reportId].reportNum !== this.app.services.eew.reports[DATA.reportId].reportNumLast
                ) {
                    return
                }

                this.app.services.eew.reports[DATA.reportId].originTime = new Date(DATA.originTime);

                if (!this.app.services.eew.reports[DATA.reportId].originTime) {
                    this.app.services.eew.reports[DATA.reportId].originTimeText = "----/--/-- --:--:--";
                } else {
                    this.app.services.eew.reports[DATA.reportId].originTimeText =
                        `${this.app.services.eew.reports[DATA.reportId].originTime.getFullYear()}/` +
                        `${this.#zeroPadding(this.app.services.eew.reports[DATA.reportId].originTime.getMonth() + 1)}/` +
                        `${this.#zeroPadding(this.app.services.eew.reports[DATA.reportId].originTime.getDate())} ` +
                        `${this.#zeroPadding(this.app.services.eew.reports[DATA.reportId].originTime.getHours())}:` +
                        `${this.#zeroPadding(this.app.services.eew.reports[DATA.reportId].originTime.getMinutes())}:` +
                        `${this.#zeroPadding(this.app.services.eew.reports[DATA.reportId].originTime.getSeconds())}`;
                }

                this.app.services.eew.reports[DATA.reportId].maxScaleLast = this.app.services.eew.reports[DATA.reportId].maxScale;

                switch (DATA.calcintensity) {
                    case "00":
                        this.app.services.eew.reports[DATA.reportId].maxScale = 0;
                        this.app.services.eew.reports[DATA.reportId].maxScaleText = "0";
                        break;

                    case "01":
                        this.app.services.eew.reports[DATA.reportId].maxScale = 10;
                        this.app.services.eew.reports[DATA.reportId].maxScaleText = "1";
                        break;

                    case "02":
                        this.app.services.eew.reports[DATA.reportId].maxScale = 20;
                        this.app.services.eew.reports[DATA.reportId].maxScaleText = "2";
                        break;

                    case "03":
                        this.app.services.eew.reports[DATA.reportId].maxScale = 30;
                        this.app.services.eew.reports[DATA.reportId].maxScaleText = "3";
                        break;

                    case "04":
                        this.app.services.eew.reports[DATA.reportId].maxScale = 40;
                        this.app.services.eew.reports[DATA.reportId].maxScaleText = "4";
                        break;

                    case "5-":
                        this.app.services.eew.reports[DATA.reportId].maxScale = 45;
                        this.app.services.eew.reports[DATA.reportId].maxScaleText = "5弱";
                        break;

                    case "5+":
                        this.app.services.eew.reports[DATA.reportId].maxScale = 50;
                        this.app.services.eew.reports[DATA.reportId].maxScaleText = "5強";
                        break;

                    case "6-":
                        this.app.services.eew.reports[DATA.reportId].maxScale = 55;
                        this.app.services.eew.reports[DATA.reportId].maxScaleText = "6弱";
                        break;

                    case "6+":
                        this.app.services.eew.reports[DATA.reportId].maxScale = 60;
                        this.app.services.eew.reports[DATA.reportId].maxScaleText = "6強";
                        break;

                    case "07":
                        this.app.services.eew.reports[DATA.reportId].maxScale = 70;
                        this.app.services.eew.reports[DATA.reportId].maxScaleText = "7";
                        break;

                    default:
                        this.app.services.eew.reports[DATA.reportId].maxScale = -1;
                        break;
                }

                if (DATA.regionName) {
                    this.app.services.eew.reports[DATA.reportId].regionName = DATA.regionName;
                } else {
                    this.app.services.eew.reports[DATA.reportId].regionName = "震源 不明";
                }

                if (DATA.isFinal == 'true') {
                    this.app.services.eew.reports[DATA.reportId].isFinal = true;
                    this.app.services.eew.reports[DATA.reportId].reportNumText = '最終報';
                } else {
                    this.app.services.eew.reports[DATA.reportId].reportNumText = `第${this.app.services.eew.reports[DATA.reportId].reportNum}報`;
                }

                if (DATA.magnitude) {
                    this.app.services.eew.reports[DATA.reportId].magnitude = Number(DATA.magnitude);
                    this.app.services.eew.reports[DATA.reportId].magnitudeText = `M${DATA.magnitude}`;
                } else {
                    this.app.services.eew.reports[DATA.reportId].magnitude = -1;
                    this.app.services.eew.reports[DATA.reportId].magnitudeText = 'M不明';
                }

                if (DATA.depth) {
                    this.app.services.eew.reports[DATA.reportId].depth = Number(DATA.depth.replace("km", ""));
                    this.app.services.eew.reports[DATA.reportId].depthText = `約${DATA.depth}`;
                } else {
                    this.app.services.eew.reports[DATA.reportId].depth = -1;
                    this.app.services.eew.reports[DATA.reportId].depthText = '不明';
                }

                if (DATA.isCancel == 'true') {
                    this.app.services.eew.reports[DATA.reportId].isCancel = true;
                    this.app.services.eew.reports[DATA.reportId].reportNumText = '取消報';
                } else {
                    this.app.services.eew.reports[DATA.reportId].isCancel = false;
                }

                this.app.services.eew.reports[DATA.reportId].latitude = data.psWave.items[0].latitude;
                this.app.services.eew.reports[DATA.reportId].longitude = data.psWave.items[0].longitude;
                this.app.services.eew.reports[DATA.reportId].psWave.pRadius = data.psWave.items[0].pRadius;
                this.app.services.eew.reports[DATA.reportId].psWave.sRadius = data.psWave.items[0].sRadius;

                // this.app.services.eew.updateField();
                // this.app.services.eew.sound();
                // this.app.services.eew.push();
            } catch (error) {
                console.error(error);
            }
        } catch (error) {
            this.#onFetchError(error);
        }
    }


    /**
     * フェッチエラー時の処理
     * 
     * @param {Error} error
     * @returns {void}
     */
    #onFetchError(error) {
        if (this.app.services.settings.connect.eew !== 'yahoo-kmoni') return;

        YahooKmoni.#STATUS_LAMP_ELEMENT.style.backgroundColor = YahooKmoni.#STATUS_LAMP_COLORS.error;

        if (!navigator.onLine) return;

        if (!this.fetchLastStatus) return;

        this.app.services.debugLogs.add(
            "error",
            `[${this.name}]`,
            `Failed to fetch from yahooKmoni: ${error}`
        );

        this.app.services.notify.show(
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
     * 
     * @returns {string | null}
     */
    makeKmoniDatetime() {
        let kmoniDatetime = new Date(this.app.services.datetime.gmt);

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
     * 
     * @param {number} value
     * @returns {string}
     */
    #zeroPadding(value) {
        return ("0" + value).slice(-2);
    }
}