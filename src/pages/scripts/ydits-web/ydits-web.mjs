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

import { FirebaseApp } from "../firebase/app.mjs";
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

export class YditsWeb extends FirebaseApp {
    eewGetCnt = -1;
    ntpGetCnt = -1;
    jmaDataFeedGetCnt = -1;

    get JMA_DATA_FEED_GET_INTERVAL() {
        return (1000 * 60);
    }


    constructor() {
        super({
            name: "YDITS for Web",
            description: "『YDITS for Web』は、地震速報をすぐに確認できるWebアプリケーションです。",
            version: "3.11.0",
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

        this.buildEvent = new Event("build");
        document.addEventListener("build", () => this.onBuild());

        try {
            this.register(Datetime);
            this.services.datetime.gmt = new Date();
            this.services.datetime.update();
            this.register(DebugLogs);
            this.register(Notify);

            try {
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
                    // Without Webkit
                    console.error(error);
                    this.services.debugLogs.add("error", "[ERROR]", error);
                }

                this.register(GeoLocation);
                this.initMenu();
                this.initLicense();

                window.addEventListener("online", () => {
                    this.services.debugLogs.add("network", "[NETWORK]", "Reconnected to the network.");
                    this.services.notify.show("message", "ネットワーク再接続", "ネットワークに接続されました。");
                    this.services.eqinfo.reconnect();
                });

                window.addEventListener("offline", () => {
                    $('#statusLamp').css({ 'background-color': '#ff4040' });
                    this.services.debugLogs.add("error", "[NETWORK]", "Network disconnected.");
                    this.services.notify.show("error", "ネットワーク接続なし", "ネットワークが切断されました。");
                    this.services.eqinfo.disconnect();
                });

                $("#eewTitle").text("読み込み中…");
                $("#clock").text("----/--/-- --:--:--");
            } catch (error) {
                console.error(error);
                this.services.debugLogs.add("info", "[INFO]", `Failed Application initialization: ${error}`);

                this.services.notify.show(
                    "error",
                    "エラー",
                    `
                        イニシャライズ中にエラーが発生しました。<br>
                        <code>${error}</code>
                    `
                );

                this.win(
                    "error",
                    "errorInitialize",
                    "エラー",
                    `
                        イニシャライズ中にエラーが発生しました。<br>
                        <code>${error}</code>
                    `
                );
            }
        } catch (error) {
            console.error(`[ERROR] An unhandled exception has occurred:\n    ${error}`);
        }
    }


    /**
     * ビルド完了時の処理
     */
    onBuild() {
        this.initialize();
        this.services.debugLogs.add("info", "[INFO]", "Application initialized.");
        this.services.notify.show("message", `YDITS for Web Ver ${this.version}`, "");
        requestAnimationFrame(() => this.mainloop());
    }


    /**
     * 初期化する。
     */
    initialize() {
        this.services.settings.initialize();
        this.services.api.dmdata.initialize();
        this.services.api.p2pquake.initialize();
        this.services.eew.initialize();
        this.services.eqinfo.initialize();
        this.services.map.initialize();
    }


    /**
     * メインループ。
     */
    mainloop() {
        const DATE_DOW = new Date();

        if (DATE_DOW - this.ntpGetCnt >= 1000) {
            this.services.datetime.update();
            this.clock(this.services.datetime);
            this.ntpGetCnt = DATE_DOW;
        }

        if (DATE_DOW - this.eewGetCnt >= 1000) {
            this.services.eew.updateWarn();
            this.services.api.yahooKmoni.get();
            this.eewGetCnt = DATE_DOW;
        }

        if ((DATE_DOW - this.jmaDataFeedGetCnt >= this.JMA_DATA_FEED_GET_INTERVAL)) {
            this.services.jmaDataFeed.update();
            this.jmaDataFeedGetCnt = DATE_DOW;
        }

        this.services.map.update(DATE_DOW);

        requestAnimationFrame(() => this.mainloop());
    }


    /**
     * メニュー項目をイニシャライズする。
     */
    initMenu() {
        $('#menu .version').text(`Ver ${this.version}`);

        $(document).on('click', '#menuBtn', () => {
            $('#popup').addClass('active');
            $('#menu').addClass('active');
        });
        $(document).on('click', '#menu .closeBtn', () => {
            $('#popup').removeClass('active');
            $('#menu').removeClass('active');
        });

        $(document).on('click', '#eqHistoryBtn', () => {
            $('#control').toggleClass('mobile');
            $('#eqHistoryField').toggleClass('mobile');
            $('#map').toggleClass('mobile');
        });

        $(document).on('click', '#homeBtn', () => {
            this.services.map.setView([38.0194092, 138.3664968], 6);
        });

        $(document).on('click', '#menuJmaDataFeed', () => {
            $('#jmaDataFeed').addClass('active');
        });

        $(document).on('click', '#menuSettings', () => {
            $('#settings').addClass('active');
        });

        $(document).on('click', '#menuLicense', () => {
            $('#license').addClass('active');
        });
    }


    /**
     * ライセンス項目をイニシャライズする。
     */
    initLicense() {
        $(document).on('click', '#license .closeBtn', function () {
            $('#license').removeClass('active');
        });
    }


    /**
     * クロックの表示を更新する。
     */
    clock(time) {
        let clock;

        if (!(time instanceof Datetime) || !(time.gmt instanceof Date)) {
            clock = "----/--/-- --:--:--";
        } else {
            clock =
                `${time.fullYear}/` +
                `${this.zeroPadding(time.month)}/` +
                `${this.zeroPadding(time.date)} ` +
                `${this.zeroPadding(time.hours)}:` +
                `${this.zeroPadding(time.minutes)}:` +
                `${this.zeroPadding(time.seconds)}`;
        }

        $("#clock").text(clock);
    }


    /**
     * 数値を二桁揃えする。
     */
    zeroPadding(value) {
        value = "0" + value;
        value = value.slice(-2);
        return value;
    }


    /**
     * ポップアップウィンドウを生成する。
     */
    win(type, id, title, content) {
        let color = null;

        switch (type) {
            case "message":
                color = "#404040ff";
                break;

            case "error":
                color = "#ff5050ff";
                break;

            default:
                color = "#404040ff";
                break;
        }

        $('body')
            .append(`
                <dialog class="dialog" id=${id}>
                    <div class="navBar">
                        <h2 class="title">${title}</h2>
                        <span class="close material-symbols-outlined">close</span>
                    </div>
    
                    <div class="content">
                        ${content}
                    </div>
                </dialog>
            `);

        $(document).on('click', `#${id}>.navBar>.close`, (event) => {
            $(`#${id}`).remove();
        });

        $(`#${id}>.navBar`).css({
            "background-color": color
        });
    }
}
