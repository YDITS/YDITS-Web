/*
 *
 * ydits-web.mjs | YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

import { App } from "../app.mjs";
import { Datetime } from "../services/modules/datetime.mjs";
import { DebugLogs } from "../services/modules/debug-logs.mjs";
import { Notify } from "../services/modules/notify.mjs";
import { GeoLocation } from "../services/modules/geolocation.mjs";
import { Eew } from "../services/eew/eew.mjs";
import { Eqinfo } from "../services/eqinfo/eqinfo.mjs";
import { JmaDataFeed } from "../services/jma/jma-data-feed.mjs";
import { ServiceWorker } from "../services/service-worker.mjs";
import { PushNotify } from "../services/modules/push-notify.mjs";
import { Sounds } from "../services/modules/sounds.mjs";
import { Api } from "../services/api/api.mjs";
import { Settings } from "../services/modules/settings.mjs";
import { Map } from "../services/map/map.mjs";


export class YditsWeb extends App {
    buildEvent = null;
    eewGetCnt = -1;
    ntpGetCnt = -1;
    jmaDataFeedGetCnt = -1;
    jmaDataFeedGetInterval = (1000 * 60);


    constructor() {
        super({
            name: "YDITS for Web",
            description: "『YDITS for Web』は、地震速報をすぐに確認できるWebアプリケーションです。",
            version: "3.11.0 bata",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

        this.buildEvent = new Event("build");

        document.addEventListener("build", () => {
            this._services.settings.initialize();
            this._services.api.dmdata.initialize();
            this._services.api.p2pquake.initialize();
            this._services.eew.initialize();
            this._services.eqinfo.initialize();
            this._services.debugLogs.add("INFO", "[INFO]", "Application initialized.");
            this._services.notify.show("message", `YDITS for Web Ver ${this._version}`, "");
            requestAnimationFrame(() => this.mainloop());
        });

        try {
            this.register(Datetime);
            this._services.datetime.update();
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
                    this._services.debugLogs.add("ERROR", "[ERROR]", error);
                }

                this.register(GeoLocation);
                this.initMenu();
                this.initLicense();

                window.addEventListener("online", () => {
                    this.debugLogs.add("NETWORK", "[NETWORK]", "Reconnected to the network.");
                    this.notify.show("message", "ネットワーク再接続", "ネットワークに接続されました。");
                    this.eqinfo.reconnect();
                });

                window.addEventListener("offline", () => {
                    $('#statusLamp').css({ 'background-color': '#ff4040' });
                    this.debugLogs.add("ERROR", "[NETWORK]", "Network disconnected.");
                    this.notify.show("error", "ネットワーク接続なし", "ネットワークが切断されました。");
                    this.eqinfo.disconnect();
                });

                $("#eewTitle").text("読み込み中…");
            } catch (error) {
                console.error(error);
                this._services.debugLogs.add("INFO", "[INFO]", `Failed Application initialization: ${error}`);

                this._services.notify.show(
                    "error",
                    "エラー",
                    `
                        イニシャライズ中にエラーが発生しました。<br>
                        <code>${error}</code>
                    `
                );

                win(
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
     * メインループ。
     * 処理落ちしない限り60FPSでループします。
     */
    mainloop() {
        this.dateNow = new Date();

        if (this.dateNow - this.ntpGetCnt >= 1000) {
            this._services.datetime.update();
            this.clock();
            this.ntpGetCnt = this.dateNow;
        }

        if (this.dateNow - this.eewGetCnt >= 1000) {
            this._services.api.yahooKmoni.get();
            this.eewGetCnt = this.dateNow;
        }

        if ((this.dateNow - this.jmaDataFeedGetCnt >= this.jmaDataFeedGetInterval)) {
            this._services.jmaDataFeed.update();
            this._services.jmaDataFeedGetCnt = this.dateNow;
        }

        if (this._services.eew.isWarning) {
            this._services.eew.update();
        }

        this._services.map.update(this.dateNow);

        requestAnimationFrame(() => this.mainloop());
    }


    /**
     * メニュー項目をイニシャライズします。
     */
    initMenu() {
        $('#menu .version').text(`Ver ${this._version}`);

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
            this._services.map.setView([38.0194092, 138.3664968], 6);
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
     * ライセンス項目をイニシャライズします。
     */
    initLicense() {
        $(document).on('click', '#license .closeBtn', function () {
            $('#license').removeClass('active');
        });
    }


    /**
     * クロックの表示を更新します。
     */
    clock() {
        let clock;

        if (this._services.datetime.gmt === null) {
            clock = "----/--/-- --:--:--";
        } else {
            clock =
                `${this._services.datetime.year}/` +
                `${this.zeroPadding(this._services.datetime.month)}/` +
                `${this.zeroPadding(this._services.datetime.day)} ` +
                `${this.zeroPadding(this._services.datetime.hour)}:` +
                `${this.zeroPadding(this._services.datetime.minute)}:` +
                `${this.zeroPadding(this._services.datetime.second)}`;
        }

        $("#clock").text(clock);
    }


    /**
     * 数値を二桁揃えします。
     */
    zeroPadding(value) {
        value = "0" + value;
        value = value.slice(-2);
        return value;
    }


    /**
     * ポップアップウィンドウを生成します。
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
