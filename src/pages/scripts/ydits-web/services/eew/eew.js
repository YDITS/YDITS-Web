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

/**
 * 緊急地震速報を扱う。
 */
export class Eew extends Service {
    /**
     * @param {YditsWeb} app
     */
    constructor(app) {
        super(app, {
            name: "eew",
            description: "緊急地震速報を扱う。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

        this.app = app;

        this.datetime = app.services.datetime;
        this.geolocation = app.services.geoLocation;

        this.#initializeElements();
        this.#setupEventListeners();
    }

    /**
     * アプリケーションインスタンス
     * @type {YditsWeb}
     * @override
     */
    app;

    /**
     * 要素を初期化する。
     *
     * @returns {void}
     */
    #initializeElements() {
        this.eewNotifyElement = document.getElementById("eewNotify");
        this.warnElement = document.getElementById("eewWarn");
        this.scaleElement = document.getElementById("eewScale");
        this.scaleAboutElement = document.getElementById("eewScaleAbout");
        this.arrivalTimeElement = document.getElementById("eewArrivalTime");
        this.arrivalTimeAboudElement = document.getElementById("eewArrivalTimeAbout");
        this.locateElement = document.getElementById("eewLocate");
        this.errorElement = document.getElementById("eewError");
    }

    /**
     * イベントリスナーを設定する。
     *
     * @returns {void}
     */
    #setupEventListeners() {
        this.eewNotifyElement.addEventListener("click", () => this.displayWarn());
        this.warnElement.querySelector(".closeBtn").addEventListener("click", () => this.hideWarn());
    }

    /**
     * 緊急地震速報が発表されているかどうか
     * @type {boolean}
     */
    isEew = false;

    /**
     * 現在の緊急地震速報のID
     * @type {string | null}
     */
    currentId = null;

    /**
     * 前回の緊急地震速報のID
     * @type {string | null}
     */
    currentIdLast = null;

    /**
     * 緊急地震速報のレポート
     * @type {Object<string, Report>}
     */
    reports = {};

    /**
     * 警報地域のテキスト
     * @type {string}
     */
    warnAreasText = "";

    /**
     * 警報地域のリスト
     * @type {Eew.WarnArea[]}
     */
    warnAreas = [];

    /**
     * ユーザーの地域が警報対象かどうか
     * @type {boolean}
     */
    isUserAreaWarn = false;

    /**
     * 震度のテキスト
     * @type {Object<string, string>}
     */
    maxScaleText = {
        "-1": "?",
        "0": "0",
        "1": "1",
        "2": "2",
        "3": "3",
        "4": "4",
        "5-": "5弱",
        "5+": "5強",
        "6-": "6弱",
        "6+": "6強",
        "7": "7"
    }

    /**
     * 緊急地震速報のレポート
     */
    Report = class {
        isWarning = false;
        type = null;
        isCanceled = false;
        reportNum = null;
        reportNumLast = null;
        isFinal = false;
        reportNumText = null;
        originTime = null;
        originTimeText = null;
        maxScale = null;
        maxScaleLast = null;
        regionName = null;
        magnitude = null;
        magnitudeText = null;
        depth = null;
        depthText = null;
        warnAreas = [];
        latitude = null;
        longitude = null;
        psWave = {
            sRadius: null,
            pRadius: null
        }
        sWave = null;
        pWave = null;
        lastSWave = null;
        lastPWave = null;
    }

    /**
     * 緊急地震速報の警報地域
     */
    WarnArea = class {
        name = null;
        pref = null;
        arrivalTime = null;
        scaleFrom = null
        scaleTo = null;

        constructor(eew, data) {
            this.name = data.name;
            this.pref = data.pref;
            this.arrivalTime = data.arrivalTime;
            this.scaleFrom = data.scaleFrom;
            this.scaleTo = data.scaleTo;
            eew.warnAreasText += `${data.pref}　`;
        }
    }

    /**
     * 初期化する
     *
     * @returns {void}
    */
    initialize() {
        this.app.services.notify.show("message", "", `${this.name}をイニシャライズしています…`);

        switch (this.app.services.settings) {
            case "yahoo-kmoni":
                break;
        }
    }

    /**
     * 緊急地震速報（警報）発表時の処理
     *
     * @param {Object} data
     * @returns {void}
     */
    warning(data) {
        let areas = [];

        this.warnAreas.forEach(area => {
            areas.push(area.name);
        });

        this.displayWarn();

        this.updateWarn(data);
    }

    /**
     * フィールドの表示を更新する
     *
     * @returns {void}
     */
    // updateField() {
    //     if (this.isEew) {
    //         const REPORT = this.reports[this.currentId];
    //         let bgcolor = null;
    //         let fontColor = null;

    //         switch (REPORT.maxScale) {
    //             case 10:
    //                 bgcolor = "#808080";
    //                 fontColor = "#ffffff";
    //                 break;
    //             case 20:
    //                 bgcolor = "#4040c0";
    //                 fontColor = "#ffffff";
    //                 break;
    //             case 30:
    //                 bgcolor = "#40c040";
    //                 fontColor = "#ffffff";
    //                 break;
    //             case 40:
    //                 bgcolor = "#c0c040";
    //                 fontColor = "#ffffff";
    //                 break;
    //             case 45:
    //                 bgcolor = "#c0a040";
    //                 fontColor = "#ffffff";
    //                 break;
    //             case 50:
    //                 bgcolor = "#c08040";
    //                 fontColor = "#ffffff";
    //                 break;
    //             case 55:
    //                 bgcolor = "#c04040";
    //                 fontColor = "#ffffff";
    //                 break;
    //             case 60:
    //                 bgcolor = "#a04040";
    //                 fontColor = "#ffffff";
    //                 break;
    //             case 70:
    //                 bgcolor = "#804080";
    //                 fontColor = "#ffffff";
    //                 break;

    //             default:
    //                 bgcolor = "#8080c0";
    //                 fontColor = "#ffffff";
    //                 break;
    //         }

    //         if (REPORT.isCancel) {
    //             bgcolor = "#7f7fc0";
    //             fontColor = "#010101";
    //         }

    //         if (REPORT.isWarning) {
    //             REPORT.type = "警報";
    //         } else {
    //             REPORT.type = "";
    //         }

    //         $('#eewTitle').text(`緊急地震速報 ${REPORT.type}(${REPORT.reportNumText})`);
    //         $('#eewCalc').text(REPORT.maxScaleText);
    //         $('#eewRegion').text(REPORT.regionName);
    //         $('#eewOrigin_time').text(`発生日時: ${REPORT.originTimeText}`);
    //         $('#eewMagnitude').text(`規模 ${REPORT.magnitudeText}`);
    //         $('#eewDepth').text(`深さ ${REPORT.depthText}`);

    //         $('#eewField').css({
    //             'background-color': bgcolor,
    //             'color': fontColor
    //         })

    //         this.app.services.map.layerControl.startEew();
    //     } else {
    //         $('#eewTitle').text(`緊急地震速報は発表されていません`);
    //         $('#eewCalc').text("");
    //         $('#eewRegion').text("");
    //         $('#eewOrigin_time').text("");
    //         $('#eewMagnitude').text("");
    //         $('#eewDepth').text("");

    //         $('#eewField').css({
    //             'background-color': "#404040ff",
    //             'color': "#ffffffff"
    //         });

    //         this.app.services.map.layerControl.stopEew();
    //     }
    // }

    /**
     * 情報に応じてサウンドを再生する。
     */
    // sound() {
    //     if (this.reports[this.currentId].isCancel == true) {
    //         if (this.app.services.settings.sound.eewCancel == true) {
    //             this.app.services.sounds.eewVoiceCancel.play();
    //         }
    //     } else {
    //         if (!(this.app.services.settings.sound.eewAny)) { return }

    //         if (this.reports[this.currentId].isWarning) {
    //             this.app.services.sounds.eew.play();
    //             this.app.services.sounds.eewWarnVoice.play();
    //         }

    //         if (
    //             (this.reports[this.currentId].maxScale !== this.reports[this.currentId].maxScaleLast) ||
    //             (this.currentId !== this.currentIdLast)
    //         ) {

    //             switch (this.reports[this.currentId].maxScale) {
    //                 case 10:
    //                     this.app.services.sounds.eewVoice1.play();
    //                     break;

    //                 case 20:
    //                     this.app.services.sounds.eewVoice2.play();
    //                     break;

    //                 case 30:
    //                     this.app.services.sounds.eewVoice3.play();
    //                     break;

    //                 case 40:
    //                     this.app.services.sounds.eewVoice4.play();
    //                     break;

    //                 case 45:
    //                     this.app.services.sounds.eewVoice5.play();
    //                     break;

    //                 case 50:
    //                     this.app.services.sounds.eewVoice6.play();
    //                     break;

    //                 case 55:
    //                     this.app.services.sounds.eewVoice7.play();
    //                     break;

    //                 case 60:
    //                     this.app.services.sounds.eewVoice8.play();
    //                     break;

    //                 case 70:
    //                     this.app.services.sounds.eewVoice9.play();
    //                     break;

    //                 default:
    //                     break;
    //             }
    //         }
    //     }
    // }

    /**
     * 警報画面の表示を更新する
     *
     * @returns {void}
     */
    updateWarn() {
        this.warnAreas.forEach(area => {
            if (area.name === this.app.services.geoLocation.area) {
                this.isUserAreaWarn = true;
                this.errorElement.hide();

                if (area.scaleTo === 99) {
                    this.scale = this.parseScale(area.scaleFrom);
                    this.scaleAboutElement.text("程度以上");
                } else {
                    this.scale = this.parseScale(area.scaleTo);
                    this.scaleAboutElement.text("程度");
                }

                if (area.arrivalTime === null) {
                    this.arrivalTime = "到達と推測";
                    this.arrivalTimeAboudElement.text("");
                } else {
                    let dateNow = this.app.services.datetime.gmt.getTime();
                    let arrivalTime = new Date(area.arrivalTime).getTime();

                    this.arrivalTime = (arrivalTime - dateNow) / 1000;

                    if (this.arrivalTime <= 0) {
                        this.arrivalTime = "到達と推測";
                        this.arrivalTimeAboudElement.text("");
                    } else {
                        this.arrivalTime = `${this.arrivalTime}秒`;
                        this.arrivalTimeAboudElement.text("およそ");
                    }
                }

                this.scaleElement.text(this.scale);
                this.arrivalTimeElement.text(this.arrivalTime);
                this.locateElement.text(this.app.services.geoLocation.area);
            }
        });

        if (!this.isUserAreaWarn) {
            this.errorElement.style.display = "block";
        }
    }

    /**
     * 警報画面を表示する
     *
     * @returns {void}
     */
    displayWarn() {
        if (!this.app.services.settings.display.showWarn) { return; }
        if (!this.app.services.geoLocation.isSupported) { return; }
        this.warnElement.classList.add("active");
    }

    /**
     * 警報画面を非表示する
     *
     * @returns {void}
     */
    hideWarn() {
        this.warnElement.classList.remove("active");
    }

    /**
     * すべての緊急地震速報イベントを終了する
     *
     * @returns {void}
     */
    end() {
        this.isEew = false;
        this.reports = {};
        this.endWarn();
    }

    /**
     * 緊急地震速報（警報）イベントを終了する
     *
     * @returns {void}
    */
    endWarn() {
        this.hideWarn();
        this.warnAreas = [];
        this.updateWarn();
    }

    /**
     * 文字列の末尾に都府県を付与する
     *
     * @param {string} string
     * @returns {string}
     */
    addPref(string) {
        switch (string) {
            case "東京":
                return "東京都";

            case "北海道":
                return string;

            case "大阪":
                return "大阪府";

            case "京都":
                return "京都府";

            default:
                return `${string}県`;
        }
    }

    /**
     * 文字列の末尾から都府県を削除する
     *
     * @param {string} string
     * @returns {string}
     */
    removePref(string) {
        switch (string) {
            case "東京都":
                return "東京";

            case "北海道":
                return string;

            case "大阪府":
                return "大阪";

            case "京都府":
                return "京都";

            default:
                return string.replace("県", "");
        }
    }

    /**
     * 文字列の末尾から市区町村を削除する
     *
     * @param {string} string
     * @returns {string}
     */
    removeCity(string) {
        string = string.replace("市", "");
        string = string.replace("区", "");
        string = string.replace("町", "");
        string = string.replace("村", "");
        return string;
    }

    /**
     * P2P地震情報の震度値を文字列に変換する
     *
     * @param {number} value
     * @returns {string}
     */
    parseScale(value) {
        switch (value) {
            case -1: return "不明";
            case 0: return "0"
            case 10: return "1";
            case 20: return "2";
            case 30: return "3";
            case 40: return "4";
            case 45: return "5弱";
            case 50: return "5強";
            case 55: return "6弱";
            case 60: return "6強";
            case 70: return "7";
            case 99: return;
            default: return "e";
        }
    }

    /**
     * プッシュ通知を送信する
     *
     * @returns {void}
     */
    // push() {
    //     if (this.reports[this.currentId].reportNum === this.reports[this.currentId].reportNumLast || this.reports[this.currentId].isWarning) { return }

    //     try {
    //         if (this.reports[this.currentId].isCancel) {
    //             this.app.services.pushNotify.notify(
    //                 `緊急地震速報 ${this.reports[this.currentId].type}(${this.reports[this.currentId].reportNumText})`,
    //                 {
    //                     body: "先程の緊急地震速報は取り消されました。"
    //                 }
    //             );
    //         } else {
    //             this.app.services.pushNotify.notify(
    //                 `緊急地震速報 ${this.reports[this.currentId].type}(${this.reports[this.currentId].reportNumText})`,
    //                 {
    //                     body: `${this.reports[this.currentId].regionName}で地震発生。予想最大震度は${this.reports[this.currentId].maxScaleText}です。`
    //                 }
    //             )
    //         }
    //     } catch (error) {
    //         console.error(error);
    //     }
    // }
}
