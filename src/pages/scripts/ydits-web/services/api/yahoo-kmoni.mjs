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
 * Yahoo! 強震モニタを扱う。
 */
export class YahooKmoni extends Service {
    isEew = null;
    fetchLastStatus = null;


    constructor(app) {
        super(app, {
            name: "yahooKmoni",
            description: "Yahoo! 強震モニタを扱うサービスです。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });
    }


    get() {
        if (!navigator.onLine) { return }

        const KMONI_DATETIME = this.makeKmoniDatetime();
        if (KMONI_DATETIME === null) { return }

        const URL = `https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/${KMONI_DATETIME}.json`;

        // --- debug
        // const URL = `https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/20210213/20210213230859.json`;  //2021-2-13-23:08 Fukushima
        // const URL = "https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/20220529/20220529155631.json";  //2022-5-29-15:55 Ibaraki
        // const URL = `https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/19700101/19700101000000.json`;  //1970-1-1-00:00 HTTP 403
        // const URL = `https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/20200212/202002121937${this.zeroPadding(this.app.services.datetime.seconds)}.json`;  //2020-2-12-19:36 double eew
        // const URL = `https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/20240101/202401011610${this.zeroPadding(this.app.services.datetime.seconds)}.json`;  //2024-1-1-16:10 Ishikawa
        // const URL = "https://www.lmoni.bosai.go.jp/monitor/webservice/hypo/eew/20220330001911.json";                 //2022-3-30-00:19 kmoni
        // ---

        fetch(URL)
            .then((response) => {
                if (!response.ok) {
                    this.fetchError(`Status Code: HTTP ${response.status}`);
                    return null
                }

                return response.json()
            })
            .then(data => {
                if (data === null) { return }

                if (this.app.services.settings.connect.eew === 'yahoo-kmoni') {
                    const HYPOCENTER = data.hypoInfo;

                    if (HYPOCENTER !== null) {
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
                                    `${this.zeroPadding(this.app.services.eew.reports[DATA.reportId].originTime.getMonth() + 1)}/` +
                                    `${this.zeroPadding(this.app.services.eew.reports[DATA.reportId].originTime.getDate())} ` +
                                    `${this.zeroPadding(this.app.services.eew.reports[DATA.reportId].originTime.getHours())}:` +
                                    `${this.zeroPadding(this.app.services.eew.reports[DATA.reportId].originTime.getMinutes())}:` +
                                    `${this.zeroPadding(this.app.services.eew.reports[DATA.reportId].originTime.getSeconds())}`;
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

                            this.app.services.eew.updateField();
                            this.app.services.eew.sound();
                            this.app.services.eew.push();
                        } catch (error) {
                            console.error(error);
                        }
                    } else {
                        this.app.services.eew.isEew = false;
                        this.isEew = false;
                        this.app.services.eew.updateField();
                    }

                    $('#statusLamp').css({ 'background-color': '#40ff40' });

                    if (!this.fetchLastStatus) {
                        this.fetchLastStatus = true;
                    }
                }
            })
            .catch(error => {
                this.fetchError(error);
            });
    }


    fetchError(error) {
        if (
            (this.app.services.settings.connect.eew === 'yahoo-kmoni') ||
            (this.app.services.api.dmdata.accessToken === null)
        ) {
            $('#statusLamp').css({ 'background-color': '#ff4040' });

            if (this.fetchLastStatus) {
                this.app.services.debugLogs.add(
                    "error",
                    "[NETWORK]",
                    `Failed to connect to weather-kyoshin.east.edge.storage-yahoo.jp.<br>${error}`
                );

                this.app.services.notify.show(
                    "error",
                    "エラー",
                    `
                        Yahoo! 強震モニタ (storage-yahoo.jp) に接続できません。<br>
                        強震モニタが一時的に利用できないか、ネットワークが低速な可能性があります。<br>
                        <code>${error}</code>
                    `
                );
            }

            this.fetchLastStatus = false;
        }
    }


    makeKmoniDatetime() {
        let kmoniDatetime = this.app.services.datetime.gmt;

        if (!(kmoniDatetime instanceof Date)) { return null }

        kmoniDatetime.setSeconds(this.app.services.datetime.seconds - 2);
        kmoniDatetime =
            `${kmoniDatetime.getFullYear()}` +
            `${this.zeroPadding(kmoniDatetime.getMonth() + 1)}` +
            `${this.zeroPadding(kmoniDatetime.getDate())}` +
            `/` +
            `${kmoniDatetime.getFullYear()}` +
            `${this.zeroPadding(kmoniDatetime.getMonth() + 1)}` +
            `${this.zeroPadding(kmoniDatetime.getDate())}` +
            `${this.zeroPadding(kmoniDatetime.getHours())}` +
            `${this.zeroPadding(kmoniDatetime.getMinutes())}` +
            `${this.zeroPadding(kmoniDatetime.getSeconds())}`;

        return kmoniDatetime;
    }


    zeroPadding(value) {
        value = "0" + value;
        value = value.slice(-2);
        return value;
    }
}