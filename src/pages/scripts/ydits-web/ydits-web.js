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

import { Version, VersionLevel } from "https://cdn.yoneyo.com/scripts/version@1.1.0/version.js";
import { FirebaseApp } from "../packages/firebase-app-creator/src/app.js";
import { safecall } from "../packages/safecaller/src/safecaller.js";
import { PopupDialog } from "../packages/popup-dialog/src/popup-dialog.js";

import firebaseConfig from "./firebase-config.js";
import { Datetime } from "./services/datetime/datetime.js";
import { DebugLogs } from "./services/debug-logs/debug-logs.js";
import { ElementsManager } from "./services/elements/elements.js";
import { Notify } from "./services/notify/notify.js";
import { GeoLocation } from "./services/geolocation/geolocation.js";
import { Eew } from "./services/eew/eew.js";
import { Eqinfo } from "./services/eqinfo/eqinfo.js";
import { JmaDataFeed } from "./services/jma/jma-data-feed.js";
import { ServiceWorker } from "./services/service-worker/service-worker.js";
import { PushNotify } from "./services/push-notify/push-notify.js";
import { Sounds } from "./services/sounds/sounds.js";
import { Api } from "./services/api/api.js";
import { Settings } from "./services/settings/settings.js";
import { Map } from "./services/map/map.js";

/**
 * YDITS for Web
 */
export class YditsWeb extends FirebaseApp {
    /**
     * @type {{
     *     eqhistory: string,
     *     debuglog: string,
     * }}
     */
    static modes = Object.freeze({
        default: "default",
        eqhistory: "eqhistory",
        debuglog: "debuglog",
    });

    constructor() {
        super({
            name: "YDITS for Web",
            description: "防災情報をすぐに確認できるWebアプリケーション。",
            version: new Version(3, 19, 0, VersionLevel.dev),
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone",
            firebase: firebaseConfig,
        });
    }

    /**
     * @type {string | null}
     */
    get mode() {
        return this.#mode;
    }

    /**
     * @type {Object<string, (self: YditsWeb) => void>}
     */
    locationToExecute = {
        "/eqhistory/": (self) => self.#eqhistoryMode(),
        "/debug-logs/": (self) => self.#debugLogsMode(),
    }

    /**
     * @type {string | null}
     */
    #mode = null;

    /**
     * イニシャライズ開始時の `performance.now()` 値
     * @type {number | null}
     */
    #initializeStarteFrame = null;

    /**
     * イニシャライズ所要時間
     * @type {number | null}
     */
    #initializeTime = null;

    /**
     * アニメーションメインループのFPS値
     * @type {number}
     */
    #fps = -1;

    /**
     * アニメーションメインループのフレーム数
     * @type {number}
     */
    #frames = 0;

    /**
     * 最後にFPS値を更新したDate
     * @type {number}
     */
    #lastFpsUpdateTime = -1;

    /**
     * 最後に計測した `performance.now()` 値
     * @type {number}
     */
    #lastFrame = -1;

    /**
     * @returns {Promise<void>}
     */
    async run() {
        this.#initializeStarteFrame = performance.now();

        this.locationToExecute[location.pathname]?.(this);

        this.#setupEventListeners();

        this.buildEvent = new Event("build");
        document.addEventListener("build", async () => await this.#onBuild());

        this.#initializeCoreServices();
        this.#registerServices();
        this.#initializeUI();
    }

    /**
     * イベントリスナーを設定する
     * @returns {Promise<void>}
     */
    async #setupEventListeners() {
        window.addEventListener(
            "error",
            (event) => this.#onUnhandledError(event.error)
        );

        window.addEventListener(
            "online",
            () => this.#onNetworkConnected()
        );

        window.addEventListener(
            "offline",
            () => this.#onNetworkDisconnected()
        );
    }

    /**
     * ネットワーク接続時の処理
     * @returns {void}
     */
    #onNetworkConnected() {
        this.services.debugLogs.add(
            "network",
            `[${this.name}]`,
            "Network reconnected."
        );

        this.services.notify.show(
            "message",
            "ネットワーク再接続",
            "ネットワークに接続されました。"
        );

        setTimeout(() => {
            this.services.api.wolfx.connect();
            this.services.eqinfo.reconnect();
            this.services.map.updateHrpns();
        }, 1000);
    }

    /**
     * ネットワーク切断時の処理
     * @returns {void}
     */
    #onNetworkDisconnected() {
        this.services.elementsManager.getElementById("statusLamp").style.backgroundColor = "#ff4040";

        this.services.debugLogs.add(
            "error",
            `[${this.name}]`,
            "Network disconnected."
        );

        this.services.notify.show(
            "error",
            "ネットワーク接続なし",
            "ネットワークが切断されました。"
        );

        this.services.api.wolfx.disconnect();
        this.services.eqinfo.disconnect();
    }

    /**
     * ハンドルされない例外の処理
     * @param {Error} error
     * @returns {Promise<void>}
     */
    async #onUnhandledError(error) {
        console.error(error);

        this.services.debugLogs.add(
            "error",
            `[${this.name}]`,
            `Unhandled error: ${error.stack}.`
        )

        new PopupDialog({
            type: PopupDialog.types.error,
            id: "errorUnhandled",
            create: true,
            title: "エラー",
            content: `
                ハンドルされない例外が発生しました。<br>
                <code>${error.stack}</code>
            `,
        });
    }

    /**
     * コアサービスを初期化する
     * @returns {void}
     */
    #initializeCoreServices() {
        this.registerService(Datetime);
        this.services.datetime.update();
        this.registerService(DebugLogs);
        this.services.debugLogs.add("info", `[${this.name}]`, "Initializing application.");
    }

    /**
     * サービスを登録する
     * @returns {void}
     */
    #registerServices() {
        try {
            this.registerService(ElementsManager);
            this.services.elementsManager.addElementsById([
                "clock",
                "statusLamp",
                "fps",
                "initializeTime",
                "betaBanner",
                "menuOpenEqhistory",
                "menuBtn",
                "eqHistoryBtn",
                "homeBtn",
                "popup",
                "menu",
                "menuCloseButton",
                "menuVersion",
                "menuJmaDataFeed",
                "menuSettings",
                "menuLicense",
                "menuHelp",
                "control",
                "eqHistoryField",
                "mapWrapper",
                "settings",
                "license",
                "licenseCloseButton",
            ]);

            this.registerService(Notify);
            this.registerService(Eew);
            this.registerService(Eqinfo);
            this.registerService(JmaDataFeed);
            this.registerService(ServiceWorker);
            this.registerService(Sounds);
            this.registerService(Api);
            this.registerService(Settings);
            this.registerService(Map);

            try {
                this.registerService(PushNotify);
            } catch (error) {
                console.error(error);
                this.services.debugLogs.add("error", `[${this.name}]`, error);
            }

            this.registerService(GeoLocation);
        } catch (error) {
            this.#onInitializeError(error);
        }
    }

    /**
     * イニシャライズ中の例外処理
     * @param {Error | unknown} error
     * @returns {Promise<void>}
     */
    async #onInitializeError(error) {
        const stack = error instanceof Error ? error.stack : null;

        console.error(error);

        this.services.debugLogs.add(
            "error",
            `[${this.name}]`,
            `Failed Application initialization: ${stack ?? error}.`
        );

        this.services.notify.show(
            "error",
            "エラー",
            `
                イニシャライズ中にエラーが発生しました。<br>
                <code>${stack ?? error}</code>
            `
        );

        new PopupDialog({
            type: PopupDialog.types.error,
            id: "errorInitialize",
            create: true,
            title: "エラー",
            content: `
                イニシャライズ中にエラーが発生しました。<br>
                <code>${stack ?? error}</code>
            `
        });
    }

    /**
     * ビルド完了時の処理
     * @returns {Promise<void>}
     */
    async #onBuild() {
        await this.#initialize();

        if (this.version.level === Version.levels.beta) {
            this.services.elementsManager.getElementById("betaBanner").classList.add("active");
        }

        this.upTime = performance.now();
        this.startupTime = this.services.datetime.gmt.getTime();

        if (typeof this.#initializeStarteFrame === "number") {
            this.#initializeTime = this.upTime - this.#initializeStarteFrame;
            this.services.debugLogs.add("info", `[${this.name}]`, `Application initialized with version ${this.version.string}. Initialize time: ${Math.round(this.#initializeTime)}ms.`);
            this.#displayInitializedNotify();
            this.services.elementsManager.getElementById("initializeTime").textContent = `${Math.round(this.#initializeTime)}ms`;
        }

        this.#startIntervals();

        requestAnimationFrame(() => this.#mainloop());
    }

    /**
     * 初期化する
     * @returns {Promise<void>}
     */
    async #initialize() {
        this.services.settings.initialize();
        await this.services.api.dmdata.initialize();
        this.services.api.p2pquake.initialize();
        this.services.eew.initialize();
        this.services.eqinfo.initialize();
        await this.services.map.initialize();
    }

    /**
     * インターバルを開始する
     * @returns {void}
     */
    #startIntervals() {
        setInterval(async () => await this.#updateNtp(), 1000);
        setInterval(async () => await this.#updateClock(this.services.datetime), 1000);
        setInterval(async () => await this.#updateEew(), 1000);
        setInterval(async () => await this.#updateHrpns(), 1000 * 60);
        setInterval(async () => await this.#updateTyphoon(), 1000 * 300);
        setInterval(async () => await this.#updateDebugOutput(), 1000);
    }

    /**
     * UIをイニシャライズする
     * @returns {Promise<void>}
     */
    async #initializeUI() {
        this.services.elementsManager.getElementById("menuVersion").textContent = `Ver ${this.version.string}`;

        this.services.elementsManager.getElementById("menuOpenEqhistory").addEventListener("click", () => {
            window.open(
                '/eqhistory/',
                'popupWindow',
                'width=448,height=1024,top=128,left=128,scrollbars=yes,resizable=no'
            );
        });

        this.services.elementsManager.getElementById("menuBtn").addEventListener("click", () => {
            this.services.elementsManager.getElementById("popup").classList.add("active");
            this.services.elementsManager.getElementById("menu").classList.add("active");
        });

        this.services.elementsManager.getElementById("menuCloseButton").addEventListener("click", () => {
            this.services.elementsManager.getElementById("popup").classList.remove("active");
            this.services.elementsManager.getElementById("menu").classList.remove("active");
        });

        this.services.elementsManager.getElementById("eqHistoryBtn").addEventListener("click", () => {
            this.services.elementsManager.getElementById("control").classList.toggle("mobile");
            this.services.elementsManager.getElementById("eqHistoryField").classList.toggle("mobile");
            this.services.elementsManager.getElementById("mapWrapper").classList.toggle("mobile");
        });

        this.services.elementsManager.getElementById("homeBtn").addEventListener("click", () => {
            this.services.map.setViewHome();
        });

        // document.getElementById("menuJmaDataFeed").addEventListener("click", () => {
        //     document.getElementById("jmaDataFeed").classList.add("active");
        // });

        this.services.elementsManager.getElementById("menuSettings").addEventListener("click", () => {
            this.services.elementsManager.getElementById("settings").classList.add("active");
        });

        this.services.elementsManager.getElementById("menuLicense").addEventListener("click", () => {
            this.services.elementsManager.getElementById("license").classList.add("active");
        });

        this.services.elementsManager.getElementById("menuHelp").addEventListener("click", () => {
            window.open(
                '/help/',
                'popupWindow',
                'width=960,height=540,top=128,left=128,scrollbars=yes,resizable=yes'
            );
        });

        this.services.elementsManager.getElementById("licenseCloseButton").addEventListener("click", () => {
            this.services.elementsManager.getElementById("license").classList.remove("active");
        });

        this.services.elementsManager.getElementById("clock").textContent = "----/--/-- --:--:--";
    }

    /**
     * アニメーションメインループ
     * @returns {void}
     */
    #mainloop() {
        const timeNow = new Date();
        const timeNowMs = performance.now();

        this.#calcFps(timeNowMs);
        this.#displayFps(timeNowMs);
        this.services.map.update(timeNow, this.#fps);

        requestAnimationFrame(() => this.#mainloop());
    }

    /**
     * FPSを計算する
     * @param {number} timeNow
     * @returns {void}
     */
    #calcFps(timeNow) {
        const elapsed = timeNow - this.#lastFrame;
        this.#frames++;

        if (elapsed >= this.services.settings.debug.fpsMs) {
            this.#fps = Math.round((this.#frames * 1000) / elapsed);
            this.#frames = 0;
            this.#lastFrame = timeNow;
        }
    }

    /**
     * FPSを表示する
     * @param {number} timeNow
     * @returns {void}
     */
    #displayFps(timeNow) {
        if (timeNow - this.#lastFpsUpdateTime >= this.services.settings.debug.fpsMs) {
            const color = this.#fps <= 15 ? "#ff4040ff" : "#202020ff";
            this.services.elementsManager.getElementById("fps").textContent = `${Math.round(this.#fps)}FPS`;
            this.services.elementsManager.getElementById("fps").style.backgroundColor = color;
            this.#lastFpsUpdateTime = timeNow;
        }
    }

    async #updateNtp() {
        this.services.datetime.update();
    }

    async #updateEew() {
        this.services.eew.updateWarn();
        this.services.api.yahooKmoni.get();
    }

    async #updateHrpns() {
        if (!this.services.api.yahooKmoni.isEew) {
            this.services.map.updateHrpns();
        }
    }

    async #updateTyphoon() {
        if (!this.services.api.yahooKmoni.isEew) {
            this.services.map.updateTyphoon();
        }
    }

    async #updateDebugOutput() {
        if (!this.services.settings.debug.output) return;

        this.services.elementsManager.getElementById("debugOutputAppName").textContent = `${this.name} Version ${this.version.string}`;
        this.services.elementsManager.getElementById("debugOutputUserAgent").textContent = `User Agent: ${navigator.userAgent}`;
        this.services.elementsManager.getElementById("debugOutputLanguage").textContent = `Client Language: ${navigator.language}`;
        this.services.elementsManager.getElementById("debugOutputDisplay").textContent = `Display: ${screen.width} x ${screen.height}`;
        this.services.elementsManager.getElementById("debugOutputWolfxJmaEewSocket").textContent = `Wolfx JMA EEW WebSocket: ${this.services.api.wolfx.jmaEewSocket.socket ? "Connected" : "Disconnected"}`;
        this.services.elementsManager.getElementById("debugOutputP2pquakeSocket").textContent = `P2P地震情報 WebSocket: ${this.services.api.p2pquake.socket ? "Connected" : "Disconnected"}`;

        safecall(() => {
            let reports = "";
            Object.keys(this.services.eew.reports[this.services.eew.currentId]).forEach(key => {
                reports += `${key}: ${this.services.eew.reports[this.services.eew.currentId][key]}, `;
            });
            this.services.elementsManager.textContent = `Current EEW Data: ${reports}`;
        });

        this.services.elementsManager.getElementById("debugOutputWolfxJmaEewData").textContent = `Wolfx Jma EEW Data: ${JSON.stringify(this.services.api.wolfx.jmaEewData)}`;
    }

    /**
     * クロックの表示を更新する
     * @param {Datetime} time
     * @returns {Promise<void>}
     */
    async #updateClock(time) {
        const isValidTime = time instanceof Datetime && time.gmt instanceof Date;

        const clockText = isValidTime
            ? this.#formatDateTime(time)
            : "----/--/-- --:--:--";

        this.services.elementsManager.getElementById("clock").textContent = clockText;
    }

    /**
     * イニシャライズの完了を通知する
     * @returns {void}
     */
    #displayInitializedNotify() {
        this.services.notify.show("message", `YDITS for Web Ver ${this.version.string}`, "");
    }

    /**
     * 地震履歴ウィンドウ
     * @returns {void}
     */
    #eqhistoryMode() {
        this.#mode = YditsWeb.modes.eqhistory;

        this.registerService(Datetime);
        this.registerService(DebugLogs);
        this.registerService(Api);
        this.registerService(Notify);
        this.registerService(Eqinfo);

        this.services.api.p2pquake.initialize();
        this.#displayInitializedNotify();
    }

    /**
     * デバッグログウィンドウ
     * @returns {void}
     */
    #debugLogsMode() {
        this.#mode = YditsWeb.modes.debuglog;

        this.registerService(Datetime);
        this.registerService(DebugLogs);
        this.registerService(Notify);

        this.#displayInitializedNotify();
    }

    /**
     * 日時を表示用の文字列にフォーマットする
     * @param {Datetime} time
     * @returns {string}
     */
    #formatDateTime(time) {
        return [
            time.fullYear,
            this.#zeroPadding(time.month),
            this.#zeroPadding(time.date)
        ].join('/') + ' ' + [
            this.#zeroPadding(time.hours),
            this.#zeroPadding(time.minutes),
            this.#zeroPadding(time.seconds)
        ].join(':');
    }

    /**
     * 数値を二桁揃えする
     * @param {number} value
     * @returns {string}
     */
    #zeroPadding(value) {
        return ("0" + value).slice(-2);
    }
}
