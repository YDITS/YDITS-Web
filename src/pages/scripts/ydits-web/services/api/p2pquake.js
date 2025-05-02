/**!
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the Apache License 2.0.
 *
 */

import { Service } from "../../../packages/app-creater/service.js";

/**
 * P2P地震情報 APIを扱う。
 */
export class P2pquake extends Service {
    /**
     * @param {App} app 
     */
    constructor(app) {
        super(app, {
            name: "p2pquake",
            description: "P2P地震情報 APIを扱うサービス。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

        this.startSocket();
    }


    /**
     * 保持している地震情報の数
     * @type {number}
     */
    eqinfoNum = 0;


    /**
     * 地震情報のID
     * @type {Object<string, string>}
     */
    id = {
        id: null,
        lastId: null,
        eventId: null,
        lastEvengId: null,
        serial: null,
        lastSerial: null,
    }


    /**
     * WebSocket インスタンス
     * 
     * @type {WebSocket | null}
     */
    socket = null;


    /**
     * WebSocket の再接続試行回数
     * 
     * @type {number}
     */
    socketRetryCount = 0;


    /**
     * エラーが発生しているかどうか
     * 
     * @type {boolean}
     */
    isError = false;


    /**
     * キープアライブの間隔
     * 
     * @type {number}
     */
    static KEEP_ALIVE_INTERVAL = 20 * 1000;


    /**
     * 緊急地震速報のURL
     * 
     * @type {URL}
     */
    static urlRestEew = new URL("https://api.p2pquake.net/v2/history?codes=556&limit=1");

    // DEBUG
    // static urlRestEew = new URL("https://api.p2pquake.net/v2/history?codes=556&limit=1&offset=16");


    /**
     * 地震情報のURL
     * 
     * @type {URL}
     */
    static urlRestEqinfo = new URL("https://api.p2pquake.net/v2/history?codes=551&limit=100");

    // DEBUG
    // static urlRestEqinfo = new URL("https://api.p2pquake.net/v2/history?codes=551&limit=100&offset=16");

    /**
     * WebSocketのURL
     *
     * @type {URL}
     */
    static urlSocket = new URL("wss://api.p2pquake.net/v2/ws");

    // DEBUG
    // static urlSocket = new URL("wss://api-realtime-sandbox.p2pquake.net/v2/ws");


    /**
     * 最大震度をテキストに変換するオブジェクト
     * 
     * @type {Object<string, string>}
     */
    static maxScaleToText = {
        "-1": "?",
        "0": "0",
        "10": "1",
        "20": "2",
        "30": "3",
        "40": "4",
        "45": "5弱",
        "50": "5強",
        "55": "6弱",
        "60": "6強",
        "70": "7"
    }


    /**
     * 地震情報の種類を日本語に変換するオブジェクト
     * 
     * @type {Object<string, string>}
     */
    static typeToJp = {
        "ScalePrompt": "震度速報",
        "Destination": "震源情報",
        "ScaleAndDestination": "震源・震度情報",
        "DetailScale": "各地の震度情報",
        "Foreign": "遠地地震情報",
        "Other": "地震情報"
    }


    /**
     * 津波情報をテキストに変換するオブジェクト
     * 
     * @type {Object<string, string>}
     */
    static tsunamiLevels = {
        'None': '津波の心配なし',
        'Unknown': '津波の影響は不明',
        'Checking': '津波の影響を現在調査中',
        'NonEffective': '若干の海面変動が予想されるが、被害の心配はなし',
        'Watch': '津波注意報が発表',
        'Warning': '津波警報等（大津波警報・津波警報あるいは津波注意報）が発表'
    };


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
     * 地震情報のリストを管理するクラス
     */
    List = class {
        /**
         * 地震情報のID
         * 
         * @type {string | null}
         */
        id = null;

        /**
         * 地震情報の種類
         * 
         * @type {string | null}
         */
        type = null;
    }


    /**
     * 数値を2桁にパディングする
     * 
     * @param {number} value 
     * @returns {string}
     */
    #zeroPadding(value) {
        return String(value).padStart(2, '0');
    }


    /**
     * 地震情報をプッシュする
     * 
     * @param {number} code 
     * @returns {void}
     */
    push(code) {
        try {
            switch (code) {
                // eqinfo
                case 551:
                    switch (this.app.services.eqinfo.type) {
                        case "DetailScale":
                            this.app.services.pushNotify.notify(
                                this.app.services.eqinfo.typeJp,
                                {
                                    body: `${this.app.services.eqinfo.regionName}を震源とする、最大震度${this.app.services.eqinfo.maxScaleText}の地震がありました。\n規模は${this.app.services.eqinfo.magnitudeText}、深さは${this.app.services.eqinfo.depthText}と推定されます。\n${this.app.services.eqinfo.tsunamiJp}`
                                }
                            );

                            this.app.services.notify.show(
                                "message",
                                this.app.services.eqinfo.typeJp,
                                `
                                    ${this.app.services.eqinfo.regionName}を震源とする、最大震度${this.app.services.eqinfo.maxScaleText}の地震がありました。<br>
                                    規模は${this.app.services.eqinfo.magnitudeText}、深さは${this.app.services.eqinfo.depthText}と推定されます。<br>
                                    ${this.app.services.eqinfo.tsunamiJp}
                                `
                            );
                            break;

                        case "ScalePrompt":
                            this.app.services.pushNotify.notify(
                                this.app.services.eqinfo.typeJp,
                                {
                                    body: `最大震度${this.app.services.eqinfo.maxScaleText}の地震がありました。\n${this.app.services.eqinfo.tsunamiJp}`
                                }
                            );

                            this.app.services.notify.show(
                                "message",
                                this.app.services.eqinfo.typeJp,
                                `
                                    最大震度${this.app.services.eqinfo.maxScaleText}の地震がありました。<br>
                                    ${this.app.services.eqinfo.tsunamiJp}
                                `
                            );
                            break;

                        default:
                            return;
                    }
                    break;

                // EEW
                case 556:
                    if (this.app.services.eew.reports[this.app.services.eew.currentId].isCancel) {
                        this.app.services.pushNotify.notify(
                            "緊急地震速報 (取消)",
                            {
                                body: "先程の緊急地震速報は取り消されました。"
                            }
                        );

                        this.app.services.notify.show(
                            "eew",
                            "緊急地震速報 (取消)",
                            "先程の緊急地震速報は取り消されました。"
                        );
                    } else {
                        this.app.services.pushNotify.notify(
                            "緊急地震速報 (警報)",
                            {
                                body: `《次の地域では強い揺れに備えてください》\n${this.app.services.eew.warnAreasText}`
                            }
                        );

                        this.app.services.notify.show(
                            "eew",
                            `緊急地震速報 (警報)`,
                            `
                                《次の地域では強い揺れに備えてください》<br>
                                ${this.app.services.eew.warnAreasText}
                            `
                        );
                    }
                    break;

                default:
                    return;
            }
        } catch (error) {
            console.error(error);
        }
    }


    /**
     * 初期化する
     * 
     * @returns {void}
     */
    initialize() {
        this.app.services.notify.show("message", "", `${this.name}をイニシャライズしています…`);

        if (!this.app.isEqhistoryMode) {
            fetch(P2pquake.urlRestEew)
                .then((response) => response.json())
                .then((data) => {
                    try {
                        const DATA = data[0];

                        if (this.app.services.eew.reports[DATA.id] === undefined) {
                            this.app.services.eew.reports[DATA.id] = new this.app.services.eew.Report();
                        }

                        this.app.services.eew.currentIdLast = this.app.services.eew.currentId;
                        this.app.services.eew.currentId = DATA.id;

                        const NOW_TIME = this.app.services.datetime.gmt.getTime();
                        const ISSUE_TIME = new Date(DATA.issue.time).getTime();

                        // EEW発表から3分以下の場合は警報処理をする
                        if (((NOW_TIME - ISSUE_TIME) / 1000) >= 180) {
                            delete this.app.services.eew.reports[DATA.id];
                            return;
                        }

                        this.app.services.eew.reports[DATA.id].isWarning = true;
                        this.app.services.eew.isEew = true;

                        this.app.services.eew.reports[DATA.id].originTime = new Date(DATA.earthquake.originTime);

                        if (!(this.app.services.eew.reports[DATA.id].originTime instanceof Date)) {
                            this.app.services.eew.reports[DATA.id].originTimeText = "----/--/-- --:--";
                        } else {
                            this.app.services.eew.reports[DATA.id].originTimeText =
                                `${this.app.services.eew.reports[DATA.id].originTime.getFullYear()}/` +
                                `${this.#zeroPadding(this.app.services.eew.reports[DATA.id].originTime.getMonth() + 1)}/` +
                                `${this.#zeroPadding(this.app.services.eew.reports[DATA.id].originTime.getDate())} ` +
                                `${this.#zeroPadding(this.app.services.eew.reports[DATA.id].originTime.getHours())}:` +
                                `${this.#zeroPadding(this.app.services.eew.reports[DATA.id].originTime.getMinutes())}`
                        }

                        if (DATA.earthquake.hypocenter.name) {
                            this.app.services.eew.reports[DATA.id].regionName = DATA.earthquake.hypocenter.name;
                        } else {
                            this.app.services.eew.reports[DATA.id].regionName = '震源 不明';
                        }

                        this.app.services.eew.reports[DATA.id].magnitude = DATA.earthquake.hypocenter.magnitude;

                        if (this.app.services.eew.reports[DATA.id].magnitude === -1) {
                            this.app.services.eew.reports[DATA.id].magnitudeText = 'M不明';
                        } else {
                            this.app.services.eew.reports[DATA.id].magnitudeText = `M${this.app.services.eew.reports[DATA.id].magnitude}`;
                        }

                        this.app.services.eew.reports[DATA.id].depth = DATA.earthquake.hypocenter.depth;

                        switch (this.app.services.eew.reports[DATA.id].depth) {
                            case -1:
                                this.app.services.eew.reports[DATA.id].depthText = "不明";
                                break;

                            case 0:
                                this.app.services.eew.reports[DATA.id].depthText = "ごく浅い";
                                break;

                            default:
                                this.app.services.eew.reports[DATA.id].depthText = `約${this.app.services.eew.reports[DATA.id].depth}km`;
                                break;
                        }

                        DATA.areas.forEach((area) => {
                            this.app.services.eew.warnAreas.push(
                                new this.app.services.eew.WarnArea(
                                    this.app.services.eew,
                                    {
                                        name: area.name,
                                        pref: area.pref,
                                        arrivalTime: area.arrivalTime,
                                        scaleFrom: area.scaleFrom,
                                        scaleTo: area.scaleTo
                                    }
                                )
                            );
                        });

                        let warnAreasText = "";

                        this.app.services.eew.warnAreas.forEach(area => {
                            if (warnAreasText.indexOf(area.pref) !== -1) { return }
                            warnAreasText += `${area.pref}　`;
                        });

                        this.app.services.eew.warnAreasText = warnAreasText;

                        this.app.services.eew.warning();
                        this.app.services.eew.sound();
                        this.push(556);
                    } catch (error) {
                        console.error(error);
                    }
                })
                .catch((error) => {
                    console.error(error);
                    if (error != 'TypeError: Failed to fetch') {
                        this.app.services.notify.show(
                            "error",
                            "エラー",
                            `
                            P2P地震情報 (p2pquake.net) に接続できません。<br>
                            <code>${error}</code>
                        `
                        );
                    }
                });
        }

        fetch(P2pquake.urlRestEqinfo)
            .then((response) => response.json())
            .then((data) => {
                data.forEach((list) => {
                    if (
                        (list["code"] !== 551) ||
                        (list['issue']['type'] !== "DetailScale")
                    ) {
                        return
                    }

                    if (list["issue"]["type"] in P2pquake.typeToJp) {
                        list["issue"]["typeJp"] = P2pquake.typeToJp[list["issue"]["type"]];
                    } else {
                        list["issue"]["typeJp"] = "";
                    }

                    this.app.services.eqinfo.originTime = new Date(list["earthquake"]["time"]);

                    if (!(this.app.services.eqinfo.originTime instanceof Date)) {
                        this.app.services.eqinfo.originTimeText = "----/--/-- --:--";
                    } else {
                        this.app.services.eqinfo.originTimeText =
                            `${this.app.services.eqinfo.originTime.getFullYear()}/` +
                            `${this.#zeroPadding(this.app.services.eqinfo.originTime.getMonth() + 1)}/` +
                            `${this.#zeroPadding(this.app.services.eqinfo.originTime.getDate())} ` +
                            `${this.#zeroPadding(this.app.services.eqinfo.originTime.getHours())}:` +
                            `${this.#zeroPadding(this.app.services.eqinfo.originTime.getMinutes())}`
                    }

                    this.app.services.eqinfo.maxScale = list['earthquake']['maxScale'];

                    if (this.app.services.eqinfo.maxScale in P2pquake.maxScaleToText) {
                        this.app.services.eqinfo.maxScaleText = P2pquake.maxScaleToText[String(this.app.services.eqinfo.maxScale)];
                    } else {
                        this.app.services.eqinfo.maxScaleText = "?";
                    }

                    this.app.services.eqinfo.regionName = list['earthquake']['hypocenter']['name'];

                    if (this.app.services.eqinfo.regionName == '') {
                        this.app.services.eqinfo.regionName = '震源 調査中';
                    }

                    this.app.services.eqinfo.magnitude = list['earthquake']['hypocenter']['magnitude'];

                    if (this.app.services.eqinfo.magnitude == -1) {
                        this.app.services.eqinfo.magnitudeText = 'M調査中または不明';
                    } else {
                        this.app.services.eqinfo.magnitudeText = `M${this.app.services.eqinfo.magnitude}`;
                    }

                    this.app.services.eqinfo.depth = list['earthquake']['hypocenter']['depth'];

                    if (this.app.services.eqinfo.depth == -1) {
                        this.app.services.eqinfo.depthText = '調査中または不明';
                    } else if (this.app.services.eqinfo.depth == 0) {
                        this.app.services.eqinfo.depthText = 'ごく浅い';
                    } else {
                        this.app.services.eqinfo.depthText = `約${this.app.services.eqinfo.depth}km`;
                    }

                    this.app.services.eqinfo.tsunami = list['earthquake']['domesticTsunami'];

                    if (this.app.services.eqinfo.tsunami in P2pquake.tsunamiLevels) {
                        this.app.services.eqinfo.tsunamiJp = P2pquake.tsunamiLevels[this.app.services.eqinfo.tsunami];
                    } else {
                        this.app.services.eqinfo.tsunamiJp = "津波の影響は不明";
                    }

                    let bgcolor;
                    let color;

                    if (this.app.services.eqinfo.maxScale in P2pquake.scaleToColors) {
                        bgcolor = P2pquake.scaleToColors[this.app.services.eqinfo.maxScale]["bgcolor"];
                        color = P2pquake.scaleToColors[this.app.services.eqinfo.maxScale]["color"];
                    } else {
                        bgcolor = "#404040ff";
                        color = "#ffffffff";
                    }

                    this.app.services.eqinfo.addToList(true, this.eqinfoNum)
                    this.eqinfoNum++;
                });
            })
            .catch((error) => {
                console.error(error);
                if (error != 'TypeError: Failed to fetch') {
                    this.notify.show(
                        "error",
                        "エラー",
                        `
                            P2P地震情報 (p2pquake.net) に接続できません。<br>
                            <code>${error}</code>
                        `
                    );
                }
            });
    }


    /**
     * WebSocket を開始する
     * 
     * @returns {void}
     */
    startSocket() {
        if (!navigator.onLine) { return }
        if (this.socket instanceof WebSocket) { return }

        this.socket = new WebSocket(P2pquake.urlSocket);
        this.socket.addEventListener("open", (event) => this.#socketOpened(event));
        this.socket.addEventListener("close", (event) => this.#socketClosed(event));
        this.socket.addEventListener("message", (event) => this.#socketGotMessage(event));
        this.socket.addEventListener("error", (event) => this.#socketError(event));
    }


    /**
     * WebSocket に接続したときの処理
     * 
     * @param {Event} event 
     * @returns {void}
     */
    #socketOpened(event) {
        this.app.services.debugLogs.add(
            "network",
            `[${this.name}]`,
            "Connected to p2pquake WebSocket."
        );

        this.#startKeepAliveTimer();

        if (this.socketRetryCount > 0) {
            this.app.services.notify.show(
                "message",
                "WebSocket再接続",
                "P2P地震情報 WebSocket に再接続しました。"
            );
        }

        this.isError = false;
        this.socketRetryCount = 0;
    }


    /**
     * WebSocket が切断されたときの処理
     * 
     * @param {CloseEvent} event 
     * @returns {void}
     */
    #socketClosed(event) {
        this.socket = null;

        this.app.services.debugLogs.add(
            "network",
            `[${this.name}]`,
            "Disconnected from p2pquake WebSocket."
        );

        if (!navigator.onLine) { return; }

        if (navigator.onLine && !this.isError && this.socketRetryCount < 3) {
            this.app.services.notify.show(
                "error",
                "WebSocket切断",
                "P2P地震情報 WebSocket から切断しました。再接続試行中..."
            );
        }

        if (navigator.onLine && this.socketRetryCount < 3) {
            this.retryTimeout = setTimeout(
                () => {
                    this.startSocket();
                    this.socketRetryCount++;
                },
                10 * 1000
            );
        }

        // clearTimeout(this.retryTimeout);
    }


    /**
     * WebSocket のメッセージを受信したときの処理
     * 
     * @param {MessageEvent<any>} message 
     * @returns {void}
     */
    #socketGotMessage(message) {
        try {
            const DATA = JSON.parse(message.data);

            this.latestId = DATA["_id"];

            if (this.latestId !== null && this.latestId === this.lastId) { return }

            switch (DATA["code"]) {
                case 551:
                    this.#whenEqinfo(DATA);
                    break;

                case 556:
                    this.#whenEew(DATA);
                    break;

                default:
                    return;
            }
        } catch (error) {
            console.error(error);
        }
    }


    /**
     * EEW 情報を処理する
     * 
     * @param {Object} data 
     * @returns {void}
     */
    #whenEew(data) {
        if (data["test"]) { return }

        if (this.app.services.eew.reports[data._id] === undefined) {
            this.app.services.eew.reports[data._id] = new this.app.services.eew.Report();
        }

        this.app.services.eew.currentId = data._id;

        const NOW_TIME = this.app.services.datetime.gmt.getTime();
        const ISSUE_TIME = new Date(data.issue.time).getTime();

        // EEW発表から3分以下の場合は警報処理をする
        if (((NOW_TIME - ISSUE_TIME) / 1000) >= 180) {
            delete this.app.services.eew.reports[data._id]
            return;
        }

        this.app.services.eew.reports[data._id].isWarning = true;
        this.app.services.eew.isEew = true;

        this.app.services.eew.reports[data._id].originTime = new Date(data.earthquake.originTime);

        if (!(this.app.services.eew.reports[data._id].originTime instanceof Date)) {
            this.app.services.eew.reports[data._id].originTimeText = "----/--/-- --:--";
        } else {
            this.app.services.eew.reports[data._id].originTimeText =
                `${this.app.services.eew.reports[data._id].originTime.getFullYear()}/` +
                `${this.#zeroPadding(this.app.services.eew.reports[data._id].originTime.getMonth() + 1)}/` +
                `${this.#zeroPadding(this.app.services.eew.reports[data._id].originTime.getDate())} ` +
                `${this.#zeroPadding(this.app.services.eew.reports[data._id].originTime.getHours())}:` +
                `${this.#zeroPadding(this.app.services.eew.reports[data._id].originTime.getMinutes())}`
        }

        if (data.earthquake.hypocenter.name) {
            this.app.services.eew.reports[data._id].regionName = data.earthquake.hypocenter.name;
        } else {
            this.app.services.eew.reports[data._id].regionName = '震源 不明';
        }

        this.app.services.eew.reports[data._id].magnitude = data.earthquake.hypocenter.magnitude;

        if (this.app.services.eew.reports[data._id].magnitude === -1) {
            this.app.services.eew.reports[data._id].magnitudeText = 'M不明';
        } else {
            this.app.services.eew.reports[data._id].magnitudeText = `M${this.app.services.eew.reports[data._id].magnitude}`;
        }

        this.app.services.eew.reports[data._id].depth = data.earthquake.hypocenter.depth;

        switch (this.app.services.eew.reports[data._id].depth) {
            case -1:
                this.app.services.eew.reports[data._id].depthText = "不明";
                break;

            case 0:
                this.app.services.eew.reports[data._id].depthText = "ごく浅い";
                break;

            default:
                this.app.services.eew.reports[data._id].depthText = `約${this.app.services.eew.reports[data._id].depth}km`;
                break;
        }

        data.areas.forEach((area) => {
            this.app.services.eew.warnAreas.push(
                new this.app.services.eew.WarnArea(
                    this.app.services.eew,
                    {
                        name: area.name,
                        pref: area.pref,
                        arrivalTime: area.arrivalTime,
                        scaleFrom: area.scaleFrom,
                        scaleTo: area.scaleTo
                    }
                )
            );
        });

        let warnAreasText = "";

        this.app.services.eew.warnAreas.forEach(area => {
            if (warnAreasText.indexOf(area.pref) !== -1) { return }
            warnAreasText += `${area.pref}　`;
        });

        this.app.services.eew.warnAreasText = warnAreasText;

        this.app.services.eew.warning();
        this.app.services.eqinfo.sound();
        this.push(556);
    }


    /**
     * 地震情報を処理する
     * 
     * @param {Object} data 
     * @returns {void}
     */
    #whenEqinfo(data) {
        this.app.services.eqinfo.type = data['issue']['type'];

        if (this.app.services.eqinfo.type in P2pquake.typeToJp) {
            this.app.services.eqinfo.typeJp = P2pquake.typeToJp[this.app.services.eqinfo.type];
        } else {
            this.app.services.eqinfo.typeJp = "";
        }

        this.app.services.eqinfo.originTime = new Date(data["earthquake"]["time"]);

        if (!(this.app.services.eqinfo.originTime instanceof Date)) {
            this.app.services.eqinfo.originTimeText = "----/--/-- --:--";
        } else {
            this.app.services.eqinfo.originTimeText =
                `${this.app.services.eqinfo.originTime.getFullYear()}/` +
                `${this.#zeroPadding(this.app.services.eqinfo.originTime.getMonth() + 1)}/` +
                `${this.#zeroPadding(this.app.services.eqinfo.originTime.getDate())} ` +
                `${this.#zeroPadding(this.app.services.eqinfo.originTime.getHours())}:` +
                `${this.#zeroPadding(this.app.services.eqinfo.originTime.getMinutes())}`
        }

        this.app.services.eqinfo.maxScale = data['earthquake']['maxScale'];

        if (this.app.services.eqinfo.maxScale in P2pquake.maxScaleToText) {
            this.app.services.eqinfo.maxScaleText = P2pquake.maxScaleToText[String(this.app.services.eqinfo.maxScale)];
        } else {
            this.app.services.eqinfo.maxScaleText = "?";
        }

        this.app.services.eqinfo.regionName = data['earthquake']['hypocenter']['name'];

        if (this.app.services.eqinfo.regionName == '') {
            this.app.services.eqinfo.regionName = '震源 調査中';
        }

        this.app.services.eqinfo.magnitude = data['earthquake']['hypocenter']['magnitude'];

        if (this.app.services.eqinfo.magnitude == -1) {
            this.app.services.eqinfo.magnitudeText = 'M調査中';
        } else {
            this.app.services.eqinfo.magnitudeText = `M${this.app.services.eqinfo.magnitude}`;
        }

        this.app.services.eqinfo.depth = data['earthquake']['hypocenter']['depth'];

        if (this.app.services.eqinfo.depth == -1) {
            this.app.services.eqinfo.depthText = '深さ 調査中';
        } else if (this.app.services.eqinfo.depth == 0) {
            this.app.services.eqinfo.depthText = 'ごく浅い';
        } else {
            this.app.services.eqinfo.depthText = `約${this.app.services.eqinfo.depth}km`;
        }

        this.app.services.eqinfo.tsunami = data['earthquake']['domesticTsunami'];

        if (this.app.services.eqinfo.tsunami in P2pquake.tsunamiLevels) {
            this.app.services.eqinfo.tsunamiJp = P2pquake.tsunamiLevels[this.app.services.eqinfo.tsunami];
        } else {
            this.app.services.eqinfo.tsunamiJp = "津波の影響は不明";
        }

        let bgcolor;
        let color;

        if (this.app.services.eqinfo.maxScale in P2pquake.scaleToColors) {
            bgcolor = P2pquake.scaleToColors[this.app.services.eqinfo.maxScale]["bgcolor"];
            color = P2pquake.scaleToColors[this.app.services.eqinfo.maxScale]["color"];
        } else {
            bgcolor = "#404040ff";
            color = "#ffffffff";
        }

        this.lastId = this.latestId;

        if (this.app.services.eqinfo.type === "DetailScale") {
            this.app.services.eqinfo.addToList(false, this.eqinfoNum);
            this.eqinfoNum++;
        }

        this.app.services.eqinfo.sound();
        this.push(551);
    }


    /**
     * WebSocket のエラーが発生した場合の処理
     * 
     * @param {Event} event 
     * @returns {void}
     */
    #socketError(event) {
        this.app.services.debugLogs.add(
            "error",
            `[${this.name}]`,
            `Failed to connect to p2pquake WebSocket: ${event}`
        );

        this.isError = true;

        if (this.socketRetryCount < 3) {
            this.app.services.notify.show(
                "error",
                "エラー",
                "P2P地震情報 WebSocket 接続エラー - 再接続試行中..."
            );
        } else {
            this.app.services.notify.show(
                "error",
                "エラー",
                "P2P地震情報 WebSocket 接続エラー"
            );
        }

        this.socket = null;
    }


    /**
     * キープアライブのタイマーを開始する
     * 
     * @returns {void}
     */
    #startKeepAliveTimer() {
        const INTERVAL_ID = setInterval(
            () => this.#keepAlive(INTERVAL_ID),
            P2pquake.KEEP_ALIVE_INTERVAL
        );
    }


    /**
     * キープアライブを行う
     * 
     * @param {number} intervalId 
     * @returns {void}
     */
    #keepAlive(intervalId) {
        if (!(this.socket instanceof WebSocket)) {
            clearInterval(intervalId);
            return;
        }

        this.socket.send('ping');
    }
}
