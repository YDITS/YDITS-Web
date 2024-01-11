/*
 *
 * eew.mjs | YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

import { Service } from "../../service.mjs";

/**
 * 緊急地震速報を扱うサービスです。
 */
export class Eew extends Service {
    isEew = false;
    currentId = null;
    reports = {};
    warnAreasText = "";
    warnAreas = [];

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


    constructor(app) {
        super(app, {
            name: "eew",
            description: "緊急地震速報を扱うサービスです。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

        this.datetime = app.services.datetime;
        this.geolocation = app.services.geoLocation;
        this.$warn = $("#eewWarn");
        this.$scale = $("#eewScale");
        this.$scaleAbout = $("#eewScaleAbout");
        this.$arrivalTime = $("#eewArrivalTime");
        this.$arrivalTimeAboud = $("#eewArrivalTimeAbout");
        this.$locate = $("#eewLocate");

        $(document).on("click", "#eewNotify", () => this.displayWarn());
        $(document).on("click", "#eewWarn .closeBtn", () => this.hideWarn());
    }


    /**
     * 初期化を行います。
    */
    initialize() {
        switch (this._app.services.settings) {
            case "yahoo-kmoni":
                break;
        }
    }


    /**
     * 緊急地震速報（警報）発表時の処理を行います。
     */
    warning(data) {
        let areas = [];

        this.warnAreas.forEach(area => {
            areas.push(this.addPref(area.pref));
        });

        if (areas.includes(this._app.services.geoLocation.area)) {
            this.displayWarn();
        }

        this.updateWarn(data);
    }


    /**
     * フィールドの表示を更新します。
     */
    updateField() {
        if (this.isEew) {
            const REPORT = this.reports[this.currentId];
            let bgcolor = null;
            let fontColor = null;

            switch (REPORT.maxScale) {
                case 10:
                    bgcolor = "#808080";
                    fontColor = "#ffffff";
                    break;
                case 20:
                    bgcolor = "#4040c0";
                    fontColor = "#ffffff";
                    break;
                case 30:
                    bgcolor = "#40c040";
                    fontColor = "#ffffff";
                    break;
                case 40:
                    bgcolor = "#c0c040";
                    fontColor = "#ffffff";
                    break;
                case 45:
                    bgcolor = "#c0a040";
                    fontColor = "#ffffff";
                    break;
                case 50:
                    bgcolor = "#c08040";
                    fontColor = "#ffffff";
                    break;
                case 55:
                    bgcolor = "#c04040";
                    fontColor = "#ffffff";
                    break;
                case 60:
                    bgcolor = "#a04040";
                    fontColor = "#ffffff";
                    break;
                case 70:
                    bgcolor = "#804080";
                    fontColor = "#ffffff";
                    break;

                default:
                    bgcolor = "#8080c0";
                    fontColor = "#ffffff";
                    break;
            }

            if (REPORT.isCancel) {
                bgcolor = "#7f7fc0";
                fontColor = "#010101";
            }

            if (REPORT.isWarning) {
                REPORT.type = "警報";
            } else {
                REPORT.type = "";
            }

            $('#eewTitle').text(`緊急地震速報 ${REPORT.type}(${REPORT.reportNumText})`);
            $('#eewCalc').text(REPORT.maxScaleText);
            $('#eewRegion').text(REPORT.regionName);
            $('#eewOrigin_time').text(`発生日時: ${REPORT.originTimeText}`);
            $('#eewMagnitude').text(`規模 ${REPORT.magnitudeText}`);
            $('#eewDepth').text(`深さ ${REPORT.depthText}`);

            $('#eewField').css({
                'background-color': bgcolor,
                'color': fontColor
            })
        } else {
            $('#eewTitle').text(`緊急地震速報は発表されていません`);
            $('#eewCalc').text("");
            $('#eewRegion').text("");
            $('#eewOrigin_time').text("");
            $('#eewMagnitude').text("");
            $('#eewDepth').text("");

            $('#eewField').css({
                'background-color': "#404040ff",
                'color': "#ffffffff"
            });
        }
    }


    /**
     * 情報に応じてサウンドを再生します。
     */
    sound() {
        if (this.reports[this.currentId].isCancel == true) {
            if (this._app.services.settings.sound.eewCancel == true) {
                this._app.services.sounds.eewVoiceCancel.play();
            }
        } else {
            if (!(this._app.services.settings.sound.eewAny)) { return }

            if (this.reports[this.currentId].isWarning) {
                this._app.services.sounds.eew.play();
            }

            switch (this.reports[this.currentId].maxScale) {
                case '1':
                    this._app.services.sounds.eewVoice1.play();
                    break;

                case '2':
                    this._app.services.sounds.eewVoice2.play();
                    break;

                case '3':
                    this._app.services.sounds.eewVoice3.play();
                    break;

                case '4':
                    this._app.services.sounds.eewVoice4.play();
                    break;

                case '5-':
                    this._app.services.sounds.eewVoice5.play();
                    break;

                case '5+':
                    this._app.services.sounds.eewVoice6.play();
                    break;

                case '6-':
                    this._app.services.sounds.eewVoice7.play();
                    break;

                case '6+':
                    this._app.services.sounds.eewVoice8.play();
                    break;

                case '7':
                    this._app.services.sounds.eewVoice9.play();
                    break;

                default:
                    break;
            }
        }
    }


    /**
     * 警報画面の表示を更新します。
     */
    updateWarn() {
        // this.warnAreas.forEach(area => {
        this.warnAreas.reverse().forEach(area => {
            if (this.addPref(area.pref) === this._app.services.geoLocation.area) {
                if (area.scaleTo === 99) {
                    this.scale = this.parseScale(area.scaleFrom);
                    this.$scaleAbout.text("程度以上");
                } else {
                    this.scale = this.parseScale(area.scaleTo);
                    this.$scaleAbout.text("程度");
                }

                // let dateNow = this._app.services.datetime.gmt.getTime();
                let arrivalTime = new Date(area.arrivalTime).getTime();

                // DEBUG
                let debugDatetime = new Date(area.arrivalTime);
                debugDatetime.setSeconds(debugDatetime.getSeconds() + 12);
                let dateNow = debugDatetime.getTime();
                this.arrivalTime = (arrivalTime - dateNow) / 1000;

                if (this.arrivalTime < 0) {
                    this.arrivalTime = "到達と推測";
                    this.$arrivalTimeAboud.text("");
                } else {
                    this.arrivalTime = `${this.arrivalTime}秒`;
                    this.$arrivalTimeAboud.text("およそ");
                }

                this.$scale.text(this.scale);
                this.$arrivalTime.text(this.arrivalTime);
                this.$locate.text(this._app.services.geoLocation.area);
            }
        });
    }


    /**
     * 警報画面を表示します。
     */
    displayWarn() {
        if (!this._app.services.geoLocation.isSupport) { return }
        this.$warn.addClass("active");
    }


    /**
     * 警報画面を非表示します。
     */
    hideWarn() {
        this.$warn.removeClass("active");
    }


    /**
     * すべての緊急地震速報イベントを終了します。
     */
    end() {
        this.isEew = false;
        this.reports = {};
        this.endWarn();
    }

    /**
     * 緊急地震速報（警報）イベントを終了します。
    */
    endWarn() {
        this.hideWarn();
        this.warnAreas = [];
        this.updateWarn();
    }


    /**
     * 文字列の末尾に都府県を付与します。
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
     * 文字列の末尾から都府県を削除します。
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
     * P2P地震情報の震度値を文字列に変換します。
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
     * プッシュ通知を送信します。
     */
    push(data) {
        try {
            if (data.isCancel) {
                Push.create(
                    `緊急地震速報 ${data.type}(${data.reportNum})`,
                    {
                        body: `先程の緊急地震速報は取り消されました。\nページ表示するにはここを選択してください。`,
                        onClick: function () {
                            window.focus();
                            this.close();
                        }
                    }
                );

                this.notify.show(
                    "message",
                    `緊急地震速報 ${data.type}(${data.reportNum})`,
                    `先程の緊急地震速報は取り消されました。`
                );
            } else {
                Push.create(
                    `緊急地震速報 ${data.type}(${data.reportNum})`,
                    {
                        body: `${data.regionName}で地震発生。予想最大震度は${data.maxInt}です。\nページ表示するにはここを選択してください。`,
                        onClick: function () {
                            window.focus();
                            this.close();
                        }
                    }
                );
            }
        } catch (error) {
            console.error(error);
        }
    }
}