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
    warnAreasText = null;
    warnAreas = [];

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
            pRadius: null,
            sRadius: null
        }
    }

    WarnArea = class {
        name = null;
        pref = null;
        arrivalTime = null;
        scaleFrom = null
        scaleTo = null;

        constructor(
            name,
            pref,
            arrivalTime,
            scaleFrom,
            scaleTo
        ) {
            this.name = name;
            this.pref = pref;
            this.arrivalTime = arrivalTime;
            this.scaleFrom = scaleFrom;
            this.scaleTo = scaleTo;
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
        this.$locate = $("#eewLocate");

        $(document).on("click", "#eewNotify", () => this.displayWarn());
        $(document).on("click", "#eewWarn .closeBtn", () => this.hideWarn());

        document.addEventListener("build", () => initialize());
    }


    /**
     * 初期化を行います。
     */
    initialize() {
        this.settings = this._app.services.settings;

        switch (this.settings.connect.eew) {
            case "yahoo-kmoni":
                break;
        }
    }


    /**
     * 緊急地震速報（警報）発表時の処理を行います。
     */
    warning(data) {
        this.updateWarn(data);
        this.displayWarn();
    }


    /**
     * フィールドの表示を更新します。
     */
    updateField() {
        console.debug(this.reports);
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
            $(`#eewCalc`).css({
                'background-color': 'initial',
                'color': 'initial'
            });
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
            $(`#eewCalc`).css({
                'background-color': 'initial',
                'color': 'initial'
            });
        }
    }


    /**
     * 情報に応じてサウンドを再生します。
     */
    sound() {
        if (report.isCancel == 'true') {
            if (this.settings.sound.eewCancel == true) {
                this.sounds.eewVoiceCancel.play();
            }
        } else {
            if (this.settings.sound.eewAny == true && this.maxIntLast != maxInt) {
                switch (maxInt) {
                    case '1':
                        this.sounds.eewVoice1.play();
                        break;

                    case '2':
                        this.sounds.eewVoice2.play();
                        break;

                    case '3':
                        this.sounds.eewVoice3.play();
                        break;

                    case '4':
                        this.sounds.eewVoice4.play();
                        break;

                    case '5-':
                        this.sounds.eew.play();
                        this.sounds.eewVoice5.play();
                        break;

                    case '5+':
                        this.sounds.eew.play();
                        this.sounds.eewVoice6.play();
                        break;

                    case '6-':
                        this.sounds.eew.play();
                        this.sounds.eewVoice7.play();
                        break;

                    case '6+':
                        this.sounds.eew.play();
                        this.sounds.eewVoice8.play();
                        break;

                    case '7':
                        this.sounds.eew.play();
                        this.sounds.eewVoice9.play();
                        break;

                    default:
                        this.sounds.eew.play();
                        break;
                }
            }
        }
    }


    /**
     * 警報画面の表示を更新します。
     */
    updateWarn() {
        let areas = [];

        this.warnData["areasList"].forEach(area => {
            areas.push(this.format(area));
        });

        if (!areas.includes(this.geolocation.area)) {
            this.hideWarn();
        }

        this.warnData.areas.forEach(area => {
            if (this.format(area.pref) === this.geolocation.area) {
                if (area.scaleTo === 99) {
                    this.scale = this.parseScale(area.scaleFrom);
                    this.$scaleAbout.text("程度以上");
                } else {
                    this.scale = this.parseScale(area.scaleTo);
                    this.$scaleAbout.text("程度");
                }
                console.debug(this.scale);

                let dateNow = this.datetime.gmt.getTime();
                // let arrivalTime = new Date(area.arrivalTime).getTime();
                let debugDatetime = this.datetime.gmt;
                debugDatetime.setSeconds(this.datetime.second + 12);
                let arrivalTime = debugDatetime.getTime();
                this.arrivalTime = (arrivalTime - dateNow) / 1000;
            }
        });

        this.$scale.text(this.scale);
        this.$arrivalTime.text(`${this.arrivalTime}秒`);
        this.$locate.text(this.geolocation.area);
    }


    /**
     * 警報画面を表示します。
     */
    displayWarn() {
        this.$warn.addClass("active");
    }


    /**
     * 警報画面を非表示します。
     */
    hideWarn() {
        this.$warn.removeClass("active");
    }


    /**
     * 緊急地震速報イベントを終了します。
     */
    end() {
        this.isEew = false;
        this.reports = {};
        this.warnAreas = [];
    }


    /**
     * 文字列の末尾に都道府県を付与します。
     */
    format(string) {
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
            default: return;
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