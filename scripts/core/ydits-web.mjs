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
import { ServiceWorker } from "../service-worker.mjs";
import { PushNotify } from "../services/modules/push-notify.mjs";
import { Sounds } from "../services/modules/sounds.mjs";
import { Api } from "../services/api/api.mjs";
import { Settings } from "../services/modules/settings.mjs";
import { Map } from "../services/map/map.mjs";


export class YditsWeb extends App {
    eewGetCnt = -1;
    ntpGetCnt = -1;
    jmaDataFeedGetCnt = -1;
    jmaDataFeedGetInterval = (1000 * 60);  // 1min

    isOnline = true;
    datetime = null;
    debugLogs = null;
    notify = null;
    api = null;
    eew = null;
    eqinfo = null;
    map = null;
    sounds = null;
    serviceWorker = null;
    settings = null;
    push = null;
    jmaDataFeed = null;
    geolocation = null;


    constructor() {
        super({
            name: "YDITS for Web",
            description: "『YDITS for Web』は、地震速報をすぐに確認できるWebアプリケーションです。",
            version: "3.11.0 bata",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

        const buildEvent = new Event("build");

        this.serviceManager = this.services.serviceManager;

        try {
            this.serviceManager.register(Datetime);
            this.serviceManager.register(DebugLogs);
            this.serviceManager.register(Notify);

            try {
                this.serviceManager.register(GeoLocation);
                this.serviceManager.register(Eew);
                this.serviceManager.register(Eqinfo);
                this.serviceManager.register(JmaDataFeed);
                this.serviceManager.register(ServiceWorker);

                try {
                    this.serviceManager.register(PushNotify);
                } catch (error) {
                    // Without Webkit
                    console.error(error);
                    this.services.debugLogs.add(
                        "ERROR",
                        "[ERROR]",
                        error
                    );
                }

                this.serviceManager.register(Sounds);
                this.serviceManager.register(Api);
                this.serviceManager.register(Settings);
                this.serviceManager.register(Map);

                this.initMenu();
                this.initLicense();

                window.addEventListener("online", () => {
                    this.isOnline = true;
                    this.debugLogs.add("NETWORK", "[NETWORK]", "Reconnected to the network.");
                    this.notify.show("message", "ネットワーク再接続", "ネットワークに接続されました。");
                    this.eqinfo.reconnect();
                });

                window.addEventListener("offline", () => {
                    this.isOnline = false;
                    $('#statusLamp').css({ 'background-color': '#ff4040' });
                    this.debugLogs.add("ERROR", "[NETWORK]", "Network disconnected.");
                    this.notify.show("error", "ネットワーク接続なし", "ネットワークが切断されました。");
                    this.eqinfo.disconnect();
                });

                this.debugLogs.add("INFO", "[INFO]", "Application initialized.");
                this.notify.show("message", `YDITS for Web Ver ${VERSION}`, "");

                $("#eewTitle").text("読み込み中…");

                document.dispatchEvent(buildEvent);
            } catch (error) {
                console.error(error);
                this.services.debugLogs.add("INFO", "[INFO]", `Failed Application initialization: ${error}`);

                this.services.notify.show(
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

        requestAnimationFrame(() => this.mainloop());
    }


    mainloop() {
        this.dateNow = new Date();

        if (this.dateNow - this.ntpGetCnt >= 1000) {
            this.services.datetime.update();
            this.services.clock.update();
            this.ntpGetCnt = this.dateNow;
        }

        if (this.dateNow - this.eewGetCnt >= 1000) {
            this.services.yahooKmoni.get();
            this.eewGetCnt = this.dateNow;
        }

        if ((this.dateNow - this.jmaDataFeedGetCnt >= this.jmaDataFeedGetInterval)) {
            this.jmaDataFeed.update();
            this.jmaDataFeedGetCnt = dateNow;
        }

        if (this.services.eew.isWarning) {
            this.services.eew.update();
        }

        this.services.map.update(eew, dateNow);

        requestAnimationFrame(mainloop);
    }


    initMenu() {
        $('#menu .version').text(`Ver ${VERSION}`);

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
            map.setView([38.0194092, 138.3664968], 6);
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


    initLicense() {
        $(document).on('click', '#license .closeBtn', function () {
            $('#license').removeClass('active');
        });
    }


    clock() {
        let clock;

        if (datetime.second === null) {
            clock = "----/--/-- --:--:--";
        } else {
            clock =
                `${datetime.year}/` +
                `${zeroPadding(datetime.month)}/` +
                `${zeroPadding(datetime.day)} ` +
                `${zeroPadding(datetime.hour)}:` +
                `${zeroPadding(datetime.minute)}:` +
                `${zeroPadding(datetime.second)}`;
        }

        $("#clock").text(clock);
    }


    zeroPadding(value) {
        value = "0" + value;
        value = value.slice(-2);
        return value;
    }


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
