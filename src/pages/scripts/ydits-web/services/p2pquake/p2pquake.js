/*!
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
import { Notify } from "../notify/notify.js";
import { p2pquakeScaleToTextJp } from "../../core/utils/p2pquake/p2pquake-scale-to-text-jp.js";
import { p2pquakeEqinfoTypeToTextJpShort } from "../../core/utils/p2pquake/p2pquake-eqinfo-type-to-text-jp.js";
import { p2pquakeTsunamiTypeToTextJpShort } from "../../core/utils/p2pquake/p2pquake-tsunami-type-to-text-jp.js";
import { p2pquakeScaleToYditsScaleColors } from "../../core/utils/p2pquake/p2pquake-scale-to-ydits-scale-colors.js";

/**
 * P2P地震情報 APIを扱う
 */
export class P2pquake extends Service {
    /**
     * KeepAliveの間隔[ms]
     * @type {number}
     */
    static KEEP_ALIVE_INTERVAL_MS = 20 * 1000;

    /**
     * 緊急地震速報のURL
     * @type {URL}
     */
    static REST_EEW_URL = new URL("https://api.p2pquake.net/v2/history?codes=556&limit=1");

    // DEBUG:
    // static urlRestEew = new URL("https://api.p2pquake.net/v2/history?codes=556&limit=1&offset=16");

    /**
     * 地震情報のURL
     * @type {URL}
     */
    static REST_EQINFO_URL = new URL("https://api.p2pquake.net/v2/history?codes=551&limit=100");

    // DEBUG:
    // static REST_EQINFO_URL = new URL("https://api.p2pquake.net/v2/history?codes=551&limit=100&offset=100");

    /**
     * WebSocketのURL
     * @type {URL}
     */
    static SOCKET_URL = new URL("wss://api.p2pquake.net/v2/ws");

    // DEBUG:
    // static SOCKET_URL = new URL("wss://api-realtime-sandbox.p2pquake.net/v2/ws");

    /**
     * @type {YditsWeb}
     * @override
     */
    app;

    /**
     * キーアライブのInterval
     * @type {number | null}
     */
    socketKeepAliveInterval = null;

    /**
     * 再接続用のTimeout ID
     * @type {number | null}
     */
    retryTimeout = null;

    /**
     * 現在対象の緊急地震速報(警報)のID
     * @type {string  | null}
     */
    currentEewId = null;

    /**
     * 保持している地震情報の数
     * @type {number}
     */
    eqinfoNum = 0;

    /**
     * 地震情報のID
     * @type {{
     *     id: string?,
     *     lastId: string?,
     *     eventId: string?,
     *     lastEventId: string?,
     *     serial: string?,
     *     lastSerial: string?,
     * }}
     */
    id = {
        id: null,
        lastId: null,
        eventId: null,
        lastEventId: null,
        serial: null,
        lastSerial: null,
    }

    /**
     * WebSocketインスタンス
     * @type {WebSocket | null}
     */
    socket = null;

    /**
     * WebSocketの再接続試行のインターバル[ms]
     * @type {number}
     */
    reconnectIntervalMs = 0;

    /**
     * 地震情報のリストクラス
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
     * 最後にキープアライブを実行したDate
     * @type {Date}
     */
    #lastRunKeepAliveDate = new Date();

    /**
     * @param {YditsWeb} app
     */
    constructor(app) {
        super(app, {
            name: "p2pquake",
            description: "P2P地震情報 APIを扱うサービス。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

        this.app = app;

        this.startSocket();
    }

    /**
     * 地震情報をプッシュする
     * @param {number} code
     * @returns {void}
     */
    push(code) {
        try {
            switch (code) {
                // eqinfo
                case 551:
                    const eqinfo = this.app.services.eqinfo;

                    switch (eqinfo.type) {
                        case "DetailScale":
                            this.app.services.notify.showNotify({
                                type: Notify.types.message,
                                title: eqinfo.typeJp,
                                body: `
                                    ${eqinfo.regionName}を震源とする、最大震度${eqinfo.maxScaleText}の地震がありました。<br>
                                    規模は${eqinfo.magnitudeText}、深さは${eqinfo.depthText}と推定されます。<br>
                                    ${eqinfo.tsunamiJp}
                                `,
                            });

                            this.app.services.pushNotify.notify(
                                eqinfo.typeJp,
                                {
                                    body: `${eqinfo.regionName}を震源とする、最大震度${eqinfo.maxScaleText}の地震がありました。\n規模は${eqinfo.magnitudeText}、深さは${eqinfo.depthText}と推定されます。\n${eqinfo.tsunamiJp}`
                                }
                            );
                            break;

                        case "ScalePrompt":
                            this.app.services.notify.showNotify({
                                type: Notify.types.message,
                                title: eqinfo.typeJp,
                                body: `
                                    最大震度${eqinfo.maxScaleText}の地震がありました。<br>
                                    ${eqinfo.tsunamiJp}
                                `,
                            });

                            this.app.services.pushNotify.notify(
                                eqinfo.typeJp,
                                {
                                    body: `最大震度${eqinfo.maxScaleText}の地震がありました。\n${eqinfo.tsunamiJp}`
                                }
                            );
                            break;

                        default:
                            return;
                    }
                    break;

                // EEW
                case 556:
                    const eew = this.app.services.eew;
                    const isCanceled = (
                        typeof this.currentEewId === "string" &&
                        Object.keys(eew.reports).includes(this.currentEewId)
                    ) ? (
                        eew.reports[this.currentEewId].isCancel
                    ) : (
                        false
                    );

                    if (isCanceled) {
                        this.app.services.notify.showEewNotify({
                            title: "緊急地震速報 (取消)",
                            body: "先程の緊急地震速報は取り消されました。",
                        });

                        this.app.services.pushNotify.notify(
                            "緊急地震速報 (取消)",
                            {
                                body: "先程の緊急地震速報は取り消されました。"
                            }
                        );
                    } else {
                        this.app.services.notify.showEewNotify({
                            title: `緊急地震速報 (警報)`,
                            body: `
                                《次の地域では強い揺れに備えてください》<br>
                                ${eew.warnAreasText}
                            `
                        });

                        this.app.services.pushNotify.notify(
                            "緊急地震速報 (警報)",
                            {
                                body: `《次の地域では強い揺れに備えてください》\n${eew.warnAreasText}`
                            }
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
     * @returns {void}
     */
    initialize() {
        this.app.services.notify.showNotify({
            type: Notify.types.message,
            title: "",
            body: `${this.name}をイニシャライズしています…`,
        });

        if (this.app.mode !== YditsWeb.MODES.eqhistory) {
            fetch(P2pquake.REST_EEW_URL)
                .then((response) => response.json())
                .then((data) => {
                    try {
                        const DATA = data[0];

                        if (this.app.services.eew.reports[DATA.id] === undefined) {
                            this.app.services.eew.reports[DATA.id] = new this.app.services.eew.Report();
                        }

                        this.app.services.eew.currentIdLast = this.app.services.eew.currentId;
                        this.app.services.eew.currentId = DATA.id;
                        this.currentEewId = DATA.id;

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
                        this.app.services.notify.showNotify({
                            type: Notify.types.error,
                            title: "エラー",
                            body: `
                                P2P地震情報 (p2pquake.net) に接続できません。<br>
                                <code>${error}</code>
                            `,
                        });
                    }
                });
        }

        fetch(P2pquake.REST_EQINFO_URL)
            .then((response) => response.json())
            .then((data) => {
                data.forEach((list) => {
                    if (
                        (list["code"] !== 551) ||
                        (list['issue']['type'] !== "DetailScale")
                    ) {
                        return
                    }

                    list["issue"]["typeJp"] = p2pquakeEqinfoTypeToTextJpShort(list["issue"]["type"]);

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

                    this.app.services.eqinfo.maxScaleText = p2pquakeScaleToTextJp(list['earthquake']['maxScale']);

                    this.app.services.eqinfo.regionName = list['earthquake']['hypocenter']['name'];

                    if (this.app.services.eqinfo.regionName == '') {
                        this.app.services.eqinfo.regionName = '震源 調査中';
                    }

                    this.app.services.eqinfo.magnitude = list['earthquake']['hypocenter']['magnitude'];

                    if (this.app.services.eqinfo.magnitude == -1) {
                        this.app.services.eqinfo.magnitudeText = '調査中または不明';
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

                    this.app.services.eqinfo.tsunamiJp = p2pquakeTsunamiTypeToTextJpShort(list['earthquake']['domesticTsunami']);

                    let bgcolor;
                    let color;

                    const colors = p2pquakeScaleToYditsScaleColors(this.app.services.eqinfo.maxScale);
                    const backgroundColor = colors.background;
                    const foregroundColor = colors.foreground;

                    this.app.services.eqinfo.addToList(true, this.eqinfoNum)
                    this.eqinfoNum++;
                });
            })
            .catch((error) => {
                console.error(error);
                if (error != 'TypeError: Failed to fetch') {
                    this.app.services.notify.showNotify({
                        type: Notify.types.error,
                        title: "エラー",
                        body: `
                            P2P地震情報 (p2pquake.net) に接続できません。<br>
                            <code>${error}</code>
                        `
                    });
                }
            });
    }

    /**
     * WebSocket を開始する
     * @returns {void}
     */
    startSocket() {
        if (!navigator.onLine) {
            return;
        }

        if (
            this.socket?.readyState === WebSocket.OPEN ||
            this.socket?.readyState === WebSocket.CONNECTING
        ) {
            this.app.services.debugLogs.add("network", `[${this.name}]`, "WebSocket is already open or connecting.");
            return;
        }

        try {
            this.socket = new WebSocket(P2pquake.SOCKET_URL);
            this.socket.addEventListener("open", (event) => this.#socketOpened(event));
            this.socket.addEventListener("close", (event) => this.#socketClosed(event));
            this.socket.addEventListener("message", (event) => this.#socketGotMessage(event));
            this.socket.addEventListener("error", (event) => this.#socketError(event));
        } catch (error) {
            this.socket = null;

            this.app.services.debugLogs.add(
                "error",
                `[${this.name}]`,
                `Failed to connect to p2pquake WebSocket: ${error}`
            );

            this.#reconnect();
        }
    }

    /**
     * WebSocketを再接続する
     */
    #reconnect() {
        if (this.retryTimeout) clearTimeout(this.retryTimeout);
        this.retryTimeout = setTimeout(
            () => this.startSocket(),
            this.reconnectIntervalMs
        );

        if (this.reconnectIntervalMs === 0) {
            // 再接続インターバルの初期値
            this.reconnectIntervalMs = 2000;
        } else if (this.reconnectIntervalMs >= 60000) {
            // 再接続インターバルの最大値
            this.reconnectIntervalMs = 60000;
        } else {
            // 指数関数的な再接続インターバル増加
            this.reconnectIntervalMs *= 2;
        }
    }

    /**
     * WebSocketに接続したときの処理
     * @param {Event} event
     * @returns {void}
     */
    #socketOpened(event) {
        this.app.services.debugLogs.add(
            "network",
            `[${this.name}]`,
            "Connected to p2pquake WebSocket."
        );

        this.#startKeepAlive();

        if (this.reconnectIntervalMs > 0) {
            this.app.services.notify.showNotify({
                type: Notify.types.message,
                title: "WebSocket再接続",
                body: "P2P地震情報 WebSocket に再接続しました。",
            });
        }

        this.retryTimeout = null;
        this.reconnectIntervalMs = 0;
    }

    /**
     * WebSocketが切断されたときの処理
     * @param {CloseEvent} event
     * @returns {void}
     */
    #socketClosed(event) {
        this.socket = null;
        this.#stopKeepAlive();

        this.app.services.debugLogs.add(
            "network",
            `[${this.name}]`,
            "Disconnected from p2pquake WebSocket."
        );

        if (!navigator.onLine) {
            return;
        }

        this.app.services.notify.showNotify({
            type: Notify.types.error,
            title: "WebSocket切断",
            body: "P2P地震情報 WebSocket 切断しました。再接続試行中…",
        });

        this.#reconnect();
    }

    /**
     * WebSocketのメッセージを受信したときの処理
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
     * EEWを処理する
     * @param {any} data
     * @returns {void}
     */
    #whenEew(data) {
        if (data["test"]) { return }

        if (this.app.services.eew.reports[data._id] === undefined) {
            this.app.services.eew.reports[data._id] = new this.app.services.eew.Report();
        }

        this.app.services.eew.currentId = data._id;
        this.currentEewId = data._id;

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
     * @param {any} data
     * @returns {void}
     */
    #whenEqinfo(data) {
        this.app.services.eqinfo.type = data['issue']['type'];

        this.app.services.eqinfo.typeJp = p2pquakeEqinfoTypeToTextJpShort(data['issue']['type']);

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

        this.app.services.eqinfo.maxScaleText = p2pquakeScaleToTextJp(data['earthquake']['maxScale']);

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

        this.app.services.eqinfo.tsunamiJp = p2pquakeTsunamiTypeToTextJpShort(data['earthquake']['domesticTsunami']);

        const colors = p2pquakeScaleToYditsScaleColors(this.app.services.eqinfo.maxScale);
        const backgroundColor = colors.background;
        const foregroundColor = colors.foreground;

        this.lastId = this.latestId;

        if (this.app.services.eqinfo.type === "DetailScale") {
            this.app.services.eqinfo.addToList(false, this.eqinfoNum);
            this.eqinfoNum++;
        }

        this.app.services.eqinfo.sound();
        this.push(551);
    }

    /**
     * WebSocketのエラーが発生した場合の処理
     * @param {Event} event
     * @returns {void}
     */
    #socketError(event) {
        this.socket = null;
        this.#stopKeepAlive();

        this.app.services.debugLogs.add(
            "error",
            `[${this.name}]`,
            `Failed to connect to p2pquake WebSocket: ${event}`
        );

        if (!navigator.onLine) {
            return;
        }

        this.app.services.notify.showNotify({
            type: Notify.types.error,
            title: "エラー",
            body: "P2P地震情報 WebSocket 接続エラー。再接続試行中…",
        });

        this.#reconnect();
    }

    /**
     * KeepAliveを開始する
     * @returns {void}
     */
    #startKeepAlive() {
        this.#stopKeepAlive();
        this.socketKeepAliveInterval = setInterval(
            () => this.#keepAlive(),
            P2pquake.KEEP_ALIVE_INTERVAL_MS,
        );
    }

    /**
     * KeepAliveを停止する
     * @returns {void}
     */
    #stopKeepAlive() {
        if (this.socketKeepAliveInterval) {
            clearInterval(this.socketKeepAliveInterval);
            this.socketKeepAliveInterval = null;
        }
    }

    /**
     * KeepAliveを送信する
     * @returns {void}
     */
    #keepAlive() {
        const nowDate = new Date();

        if (nowDate.getTime() - this.#lastRunKeepAliveDate.getTime() < P2pquake.KEEP_ALIVE_INTERVAL_MS) {
            return;
        }

        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send("ping");
            this.#lastRunKeepAliveDate = nowDate;
        }
    }

    /**
     * 数値を2桁にパディングする
     * @param {number} value
     * @returns {string}
     */
    #zeroPadding(value) {
        return String(value).padStart(2, '0');
    }
}
