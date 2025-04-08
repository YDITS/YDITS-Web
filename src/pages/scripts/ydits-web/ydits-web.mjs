/*
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the Apache License 2.0.
 *
 */

import { FirebaseApp } from "../firebase/app.mjs";
import { Version } from "../version.mjs";
import { Datetime } from "./services/modules/datetime.mjs";
import { DebugLogs } from "./services/modules/debug-logs.mjs";
import { Notify } from "./services/modules/notify.mjs";
import { GeoLocation } from "./services/modules/geolocation.mjs";
import { Eew } from "./services/eew/eew.mjs";
import { Eqinfo } from "./services/eqinfo/eqinfo.mjs";
import { JmaDataFeed } from "./services/jma/jma-data-feed.mjs";
import { ServiceWorker } from "./services/service-worker.mjs";
import { PushNotify } from "./services/modules/push-notify.mjs";
import { Sounds } from "./services/modules/sounds.mjs";
import { Api } from "./services/api/api.mjs";
import { Settings } from "./services/modules/settings.mjs";
import { Map } from "./services/map/map.mjs";


/**
 * YDITS for Web
 */
export class YditsWeb extends FirebaseApp {
    constructor() {
        super({
            name: "YDITS for Web",
            description: "『YDITS for Web』は、防災情報をすぐに確認できるWebアプリケーションです。",
            version: new Version(3, 18, 0, Version.LEVELS.beta),
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone",
            firebase: {
                apiKey: "AIzaSyBibDJX9w02oum1vSTMW3D4Stigya5Y9oE",
                authDomain: "ydits-for-web.firebaseapp.com",
                projectId: "ydits-for-web",
                storageBucket: "ydits-for-web.appspot.com",
                messagingSenderId: "177926103278",
                appId: "1:177926103278:web:da2bdcadb1d47b9ae653ff",
                measurementId: "G-SYYZ9EM05T"
            }
        });

        this.initializeStartedTime = performance.now();

        if (location.pathname === "/eqhistory/") {
            this.#eqhistoryMode();
            return;
        }

        if (location.pathname === "/debug-logs/") {
            this.#debugLogsMode();
            return;
        }

        this.#setupEventListeners();

        this.buildEvent = new Event("build");
        document.addEventListener("build", async () => await this.#onBuild());

        this.clockElement = document.getElementById("clock");
        this.fpsElement = document.getElementById("fps");

        this.#initializeServices();
        this.#registerServices();
        this.#initUI();
    }


    /**
     * @type {boolean}
     */
    isEqhistoryMode = false;


    /**
     * @type {boolean}
     */
    isDebugLogsMode = false;


    /**
     * イベントリスナーを設定する
     * 
     * @private
     * @returns {Promise<void>}
     */
    async #setupEventListeners() {
        window.addEventListener("error", (event) => this.#onUnhandledError(event.error));
        window.addEventListener("online", () => this.#onNetworkConnected());
        window.addEventListener("offline", () => this.#onNetworkDisconnected());
    }


    /**
     * ネットワーク接続時の処理
     * 
     * @private
     * @returns {void}
     */
    #onNetworkConnected() {
        this.services.debugLogs.add("network", `[${this.name}]`, "Network reconnected.");
        this.services.notify.show("message", "ネットワーク再接続", "ネットワークに接続されました。");

        setTimeout(() => {
            this.services.api.wolfx.connect();
            this.services.eqinfo.reconnect();
            this.services.map.updateHrpns();
        }, 3000);
    }


    /**
     * ネットワーク切断時の処理
     * 
     * @private
     * @returns {void}
     */
    #onNetworkDisconnected() {
        document.getElementById("statusLamp").style.backgroundColor = "#ff4040";
        this.services.debugLogs.add("error", `[${this.name}]`, "Network disconnected.");
        this.services.notify.show("error", "ネットワーク接続なし", "ネットワークが切断されました。");
        this.services.api.wolfx.disconnect();
        this.services.eqinfo.disconnect();
    }


    /**
     * ハンドルされない例外の処理
     * 
     * @private
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

        new Window({
            type: Window.types.error,
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
     * サービスを初期化する
     * 
     * @private
     * @returns {void}
     */
    #initializeServices() {
        this.register(Datetime);
        this.services.datetime.update();
        this.register(DebugLogs);
        this.services.debugLogs.add("info", `[${this.name}]`, "Initializing application.");
    }


    /**
     * サービスを登録する
     * 
     * @private
     * @returns {void}
     */
    #registerServices() {
        try {
            this.register(Notify);
            this.register(Eew);
            this.register(Eqinfo);
            this.register(JmaDataFeed);
            this.register(ServiceWorker);
            this.register(Sounds);
            this.register(Api);
            this.register(Settings);
            this.register(Map);

            try {
                this.register(PushNotify);
            } catch (error) {
                console.error(error);
                this.services.debugLogs.add("error", `[${this.name}]`, error);
            }

            this.register(GeoLocation);
        } catch (error) {
            this.#onInitializeError(error);
        }
    }


    /**
     * イニシャライズ中の例外処理
     * 
     * @private
     * @param {Error} error
     * @returns {Promise<void>}
     */
    async #onInitializeError(error) {
        console.error(error);

        this.services.debugLogs.add(
            "error",
            `[${this.name}]`,
            `Failed Application initialization: ${error.stack}.`
        );

        this.services.notify.show(
            "error",
            "エラー",
            `
                イニシャライズ中にエラーが発生しました。<br>
                <code>${error.stack}</code>
            `
        );

        new Window({
            type: Window.types.error,
            id: "errorInitialize",
            create: true,
            title: "エラー",
            content: `
                イニシャライズ中にエラーが発生しました。<br>
                <code>${error.stack}</code>
            `
        });
    }


    /**
     * ビルド完了時の処理
     * 
     * @private
     * @returns {Promise<void>}
     */
    async #onBuild() {
        await this.#initialize();

        if (this.version.level === Version.LEVELS.beta) {
            document.getElementById("betaBanner").classList.add("active");
        }

        this.upTime = performance.now();
        this.startupTime = this.services.datetime.gmt.getTime();
        this.initializeTime = this.upTime - this.initializeStartedTime;

        this.services.debugLogs.add("info", `[${this.name}]`, `Application initialized with version ${this.version.string}. Initialize time: ${Math.round(this.initializeTime)}ms.`);
        this.services.notify.show("message", `YDITS for Web Ver ${this.version.string}`, "");

        document.getElementById("initializeTime").textContent = `${Math.round(this.initializeTime)}ms`;

        this.#startIntervals();

        requestAnimationFrame(() => this.#mainloop());
    }


    /**
     * 初期化する
     * 
     * @private
     * @returns {Promise<void>}
     */
    async #initialize() {
        this.services.settings.initialize();
        this.services.api.dmdata.initialize();
        this.services.api.p2pquake.initialize();
        this.services.eew.initialize();
        this.services.eqinfo.initialize();
        await this.services.map.initialize();
    }


    /**
     * インターバルを開始する
     * 
     * @private
     * @returns {void}
     */
    #startIntervals() {
        setInterval(async () => await this.#ntp(), 1000);
        setInterval(async () => await this.#clock(this.services.datetime), 1000);
        setInterval(async () => await this.#eew(), 1000);
        setInterval(async () => await this.#hrpns(), 1000 * 30);
        setInterval(async () => await this.#jmaDataFeed(), this.#jmaDataFeedFetchInterval);
        setInterval(async () => await this.#debugOutput(), 1000);
    }


    /**
     * UIをイニシャライズする
     * 
     * @private
     * @returns {Promise<void>}
     */
    async #initUI() {
        await this.#initMenu();
        await this.#initLicense();
        this.clockElement.textContent = "----/--/-- --:--:--";
    }


    /**
     * メニュー項目をイニシャライズする
     * 
     * @private
     * @returns {Promise<void>}
     */
    async #initMenu() {
        document.querySelector("#menu .version").textContent = `Ver ${this.version.string}`;

        document.getElementById("menuOpenEqhistory").addEventListener("click", () => {
            window.open(
                '/eqhistory/',
                'popupWindow',
                'width=448,height=1024,top=128,left=128,scrollbars=yes,resizable=no'
            );
        });

        document.getElementById("menuBtn").addEventListener("click", () => {
            document.getElementById("popup").classList.add("active");
            document.getElementById("menu").classList.add("active");
        });

        document.querySelector("#menu .closeBtn").addEventListener("click", () => {
            document.getElementById("popup").classList.remove("active");
            document.getElementById("menu").classList.remove("active");
        });

        document.getElementById("eqHistoryBtn").addEventListener("click", () => {
            document.getElementById("control").classList.toggle("mobile");
            document.getElementById("eqHistoryField").classList.toggle("mobile");
            document.getElementById("mapWrapper").classList.toggle("mobile");
        });

        document.getElementById("homeBtn").addEventListener("click", () => {
            this.services.map.setViewHome();
        });

        // document.getElementById("menuJmaDataFeed").addEventListener("click", () => {
        //     document.getElementById("jmaDataFeed").classList.add("active");
        // });

        document.getElementById("menuSettings").addEventListener("click", () => {
            document.getElementById("settings").classList.add("active");
        });

        document.getElementById("menuLicense").addEventListener("click", () => {
            document.getElementById("license").classList.add("active");
        });

        document.getElementById("menuHelp").addEventListener("click", () => {
            window.open(
                '/help/',
                'popupWindow',
                'width=960,height=540,top=128,left=128,scrollbars=yes,resizable=yes'
            );
        });
    }


    /**
     * ライセンス項目をイニシャライズする
     * 
     * @private
     * @returns {Promise<void>}
     */
    async #initLicense() {
        document.querySelector("#license .closeBtn").addEventListener("click", () => {
            document.getElementById("license").classList.remove("active");
        });
    }


    /**
     * アニメーションメインループ
     * 
     * @private
     * @returns {void}
     */
    #mainloop() {
        const timeNow = new Date();
        const timeNowMs = performance.now();
        this.#calcFps(timeNowMs);
        this.#displayFps(timeNowMs);
        this.services.map.update(timeNow);
        requestAnimationFrame(() => this.#mainloop());
    }


    /**
     * FPSを計算する
     * 
     * @private
     * @returns {void}
     */
    #calcFps(timeNow) {
        const elapsed = timeNow - this.#lastTime;
        this.#frames++;

        if (elapsed >= this.services.settings.debug.fpsMs) {
            this.#fps = Math.round((this.#frames * 1000) / elapsed);
            this.#frames = 0;
            this.#lastTime = timeNow;
        }
    }


    /**
     * FPSを表示する
     * 
     * @private
     * @returns {void}
     */
    #displayFps(timeNow) {
        if (timeNow - this.#lastFpsUpdateTime >= this.services.settings.debug.fpsMs) {
            const color = this.#fps <= 15 ? "#ff4040ff" : "#202020ff";
            this.fpsElement.textContent = `${Math.round(this.#fps)}FPS`;
            this.fpsElement.style.backgroundColor = color;
            this.#lastFpsUpdateTime = timeNow;
        }
    }


    async #ntp() {
        this.services.datetime.update();
    }


    async #eew() {
        this.services.eew.updateWarn();
        this.services.api.yahooKmoni.get();
    }


    async #hrpns() {
        this.services.map.updateHrpns();
    }


    async #jmaDataFeed() {
        this.services.jmaDataFeed.update();
    }


    async #debugOutput() {
        if (!this.services.settings.debug.output) return;

        safeCall(() => {
            document.getElementById("debugOutputAppName").textContent = `${this.name} Version ${this.version.string}`;
        });

        safeCall(() => {
            document.getElementById("debugOutputUserAgent").textContent = `User Agent: ${navigator.userAgent}`;
        });

        safeCall(() => {
            document.getElementById("debugOutputLanguage").textContent = `Client Language: ${navigator.language}`;
        });

        safeCall(() => {
            document.getElementById("debugOutputDisplay").textContent = `Display: ${screen.width} x ${screen.height}`;
        });

        safeCall(() => {
            document.getElementById("debugOutputWolfxJmaEewSocket").textContent = `Wolfx JMA EEW WebSocket: ${this.services.api.wolfx.jmaEewSocket.socket ? "Connected" : "Disconnected"}`;
        });

        safeCall(() => {
            document.getElementById("debugOutputP2pquakeSocket").textContent = `P2P地震情報 WebSocket: ${this.services.api.p2pquake.socket ? "Connected" : "Disconnected"}`;
        });

        safeCall(() => {
            let reports = "";
            Object.keys(this.services.eew.reports[this.services.eew.currentId]).forEach(key => {
                reports += `${key}: ${this.services.eew.reports[this.services.eew.currentId][key]}, `;
            });
            document.getElementById("debugOutputEewData").textContent = `Current EEW Data: ${reports}`;
        });

        safeCall(() => {
            document.getElementById("debugOutputWolfxJmaEewData").textContent = `Wolfx Jma EEW Data: ${JSON.stringify(this.services.api.wolfx.jmaEewData)}`;
        });
    }


    /**
     * クロックの表示を更新する
     * 
     * @private
     * @param {Datetime} time
     * @returns {Promise<void>}
     */
    async #clock(time) {
        const isValidTime = time instanceof Datetime && time.gmt instanceof Date;

        const clockText = isValidTime
            ? this.#formatDateTime(time)
            : "----/--/-- --:--:--";

        this.clockElement.textContent = clockText;
    }


    /**
     * 日時を表示用の文字列にフォーマットする
     * 
     * @private
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
     * 
     * @private
     * @param {number} value
     * @returns {string}
     */
    #zeroPadding(value) {
        return ("0" + value).slice(-2);
    }


    /**
     * 地震履歴ウィンドウ
     * 
     * @private
     * @returns {void}
     */
    #eqhistoryMode() {
        this.isEqhistoryMode = true;

        this.register(Datetime);
        this.register(DebugLogs);
        this.register(Api);
        this.register(Notify);
        this.register(Eqinfo);

        this.services.api.p2pquake.initialize();
        this.services.notify.show("message", `YDITS for Web Ver ${this.version.string}`, "");
    }


    /**
     * デバッグログウィンドウ
     * 
     * @private
     * @returns {void}
     */
    #debugLogsMode() {
        this.isDebugLogsMode = true;

        this.register(Datetime);
        this.register(DebugLogs);
        this.register(Notify);

        this.services.notify.show("message", `YDITS for Web Ver ${this.version.string}`, "");
    }


    /**
     * JMA防災情報フィードの取得頻度 (ms)
     * 
     * @private
     * @type {number}
     */
    #jmaDataFeedFetchInterval = 1000 * 60;


    /**
     * アニメーションメインループのFPS値
     * 
     * @private
     * @type {number}
     */
    #fps = -1;


    /**
     * アニメーションメインループのフレーム数
     * 
     * @private
     * @type {number}
     */
    #frames = 0;


    /**
     * 最後にFPS値を更新したDate
     * 
     * @private
     * @type {number}
     */
    #lastFpsUpdateTime = -1;


    /**
     * 最後に計測した `performance.now()` 値
     * 
     * @private
     * @type {number}
     */
    #lastTime = -1;
}


/**
 * ポップアップウィンドウを作成する
 */
class Window {
    /**
     * @param {{
     *     type?: keyof typeof Window.types,
     *     id?: string,
     *     title?: string,
     *     content?: string,
     *     create?: boolean,
     * }} config
     */
    constructor({
        type = Window.types.default,
        id,
        title = "",
        content = "",
        create = true
    }) {
        this.type = type;
        this.id = id ? `win_${id}` : null;
        this.title = title;
        this.content = content;
        this.color = Window.windowTypeToColor[this.type] || Window.windowTypeToColor.default;

        if (create) {
            this.create();
        }
    }


    get element() {
        return document.getElementById(this.id);
    }


    /**
     * @readonly
     * @type {Object<string, string>}
     */
    static types = {
        message: "message",
        error: "error",
        default: "message",
    }


    /**
     * @readonly
     * @type {Object<string, string>}
     */
    static windowTypeToColor = {
        message: "#404040ff",
        error: "#ff5050ff",
        default: "#404040ff",
    }


    /**
     * ウィンドウを作成する
     * 
     * @returns {Promise<void>}
     */
    async create() {
        if (this.element instanceof HTMLElement) {
            throw new Error(`Window with id \`${this.id}\` already exists.`);
        };

        const newWindowElement = `
                <dialog class="dialog" id="${this.id}">
                    <div class="navBar">
                        <h2 class="title">${this.title}</h2>
                        <span class="close material-symbols-outlined">close</span>
                    </div>
    
                    <div class="content">
                        ${this.content}
                    </div>
                </dialog>
            `

        const parser = new DOMParser();
        const doc = parser.parseFromString(newWindowElement, "text/html");
        const dialogElement = doc.body.firstChild;

        dialogElement.querySelector(".navBar").style.backgroundColor = this.color;
        dialogElement.querySelector(".close").addEventListener("click", () => this.close());

        document.body.append(dialogElement);
    }


    /**
     * ウィンドウを閉じる
     * 
     * @returns {Promise<void>}
     */
    async close() {
        if (!(this.element instanceof HTMLElement)) {
            return;
        }

        this.element.remove();
    }
}
