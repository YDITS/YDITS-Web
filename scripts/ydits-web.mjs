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

import { DebugLogs } from "./modules/debug-logs.mjs";
import { Notify } from "./modules/notify.mjs";
import { ServiceWorker } from "./service-worker.mjs";
import { Datetime } from "./modules/datetime.mjs";
import { Sounds } from "./modules/sounds.mjs";
import { Settings } from "./modules/settings.mjs";
import { PushNotify } from "./modules/push-notify.mjs";
import { P2pquake } from "./api/p2pquake.mjs";
import { YahooKmoni } from "./api/yahoo-kmoni.mjs";
import { Eew } from "./eew/eew.mjs";
import { Eqinfo } from "./eqinfo/eqinfo.mjs";
import { Dmdata } from "./api/dmdata.mjs";
import { JmaDataFeed } from "./jma/jma-data-feed.mjs";
import { Map } from "./map/map.mjs";


const jmaDataFeedGetInterval = (1000 * 60) // 1min

let debugLogs = null;
let isOnline = true;
let notify = null;
let datetime = null;
let sounds = null;
let serviceWorker = null;
let settings = null;
let yahooKmoni = null;
let p2pquake = null;
let eew = null;
let eqinfo = null;
let dmdata = null;
let push = null;
let jmaDataFeed = null;
let kmoniLastStatus = true;
let dateNow;
let eewGetCnt = -1;
let ntpGetCnt = -1;
let jmaDataFeedGetCnt = -1;
let mapAutoMoveCnt = -1;


// ---------- EEW ---------- //
let eewNum = 1;
let eew_origin_time = null;
let eewReportId = null;
let eewReportIdLast = null;
let eew_intensity = null;
let eew_hypocenter = "";
let eew_data = null;
let eew_repNum = '';
let eew_repNum_last = '';
let eew_alertFlg = '';
let eew_timeYear = '';
let eew_timeMonth = '';
let eew_timeDay = '';
let eew_timeHour = '';
let eew_timeMinute = '';
let eew_timeSecond = '';
let eew_repNum_p = '';
let eew_calcintensity = '';
let eew_calcintensity_last = '';
let eew_Region_name = '';
let eew_Magnitude = '';
let eew_depth = '';
let eew_isFinal;
let eew_isCancel = false;
let eew_bgc;
let eew_fntc;
let eew_hypo_LatLng;


// ---------- dmdata ---------- //
let dmdataSocket = null;
let dmdata_access_token = null;


// ---------- Maps ---------- //
let map;
let mapItem = [];
let loopCnt_moni = -1;
let eew_waves = null;
let eew_wave_p = -1;
let eew_wave_s = -1;


// ---------- Main ---------- //
$(async () => {
    await init();
    requestAnimationFrame(mainloop);
});


// ---------- Mainloop ---------- //
function mainloop() {
    dateNow = new Date();

    if (dateNow - ntpGetCnt >= 1000) {
        datetime.update();
        clock();
        ntpGetCnt = dateNow;
    }

    if (dateNow - eewGetCnt >= 1000) {
        yahooKmoni.get();
        eewGetCnt = dateNow;
    }

    if ((dateNow - jmaDataFeedGetCnt >= jmaDataFeedGetInterval)) {
        jmaDataFeed.update();
        jmaDataFeedGetCnt = dateNow;
    }

    map.update(eew, dateNow);

    requestAnimationFrame(mainloop);
}


// ---------- Initialize ---------- //
async function init() {
    try {
        datetime = new Datetime();
        await datetime.update();
        debugLogs = new DebugLogs(datetime);

        notify = new Notify()

        try {
            serviceWorker = new ServiceWorker(debugLogs);
            sounds = new Sounds();
            try { push = new PushNotify() } catch { }
            dmdata = new Dmdata();
            settings = new Settings(debugLogs, notify, sounds, dmdata);
            eew = new Eew();
            eqinfo = new Eqinfo();
            yahooKmoni = new YahooKmoni(debugLogs, notify, datetime, settings, sounds, eew, dmdata);
            p2pquake = new P2pquake(debugLogs, notify, datetime, settings, sounds, eew, eqinfo);
            eew.initialize(settings);
            eqinfo.initialize(settings, p2pquake);
            dmdata.initialize(settings);

            initMenu();
            jmaDataFeed = new JmaDataFeed();
            initLicense();
            map = new Map(settings);

            window.addEventListener("online", () => {
                isOnline = true;
                debugLogs.add("NETWORK", "[NETWORK]", "Reconnected to the network.");
                notify.show("message", "ネットワーク再接続", "ネットワークに接続されました。");
                eqinfo.reconnect()
            });

            window.addEventListener("offline", () => {
                isOnline = false;
                debugLogs.add("ERROR", "[NETWORK]", "Network disconnected.");
                $('#statusLamp').css({ 'background-color': '#ff4040' });
                notify.show("error", "ネットワーク接続なし", "ネットワークが切断されました。");
                eqinfo.disconnect();
            });

            debugLogs.add("INFO", "[INFO]", "Application initialized.");
            notify.show("message", `YDITS for Web Ver ${VERSION}`, "");

            $("#eewTitle").text("読み込み中…");
        } catch (error) {
            console.error(error);
            debugLogs.add("INFO", "[INFO]", `Failed Application initialization: ${error}`);

            notify.show(
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


// ---------- Menu ---------- //
function initMenu() {
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


// ---------- License ---------- //
function initLicense() {
    $(document).on('click', '#license .closeBtn', function () {
        $('#license').removeClass('active');
    })
}


// ---------- Clock ---------- //
function clock() {
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


function zeroPadding(value) {
    value = "0" + value;
    value = value.slice(-2);
    return value;
}


// ---------- Dmdata ---------- //
function dmdataSocketStart() {
    const dmdataSocketUrl = 'https://api.dmdata.jp/v2/socket';
    const dmdataGetClassifications = ['socket.start', 'socket.list', 'socket.close', 'eew.forecast'];

    fetch(dmdataSocketUrl, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + dmdata_access_token },
        body: JSON.stringify({ classifications: dmdataGetClassifications, test: 'including' })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error === undefined) {
                dmdataSocket = new WebSocket(data.websocket.url, ['dmdata.v2']);

                dmdataSocket.addEventListener('open', () => {
                    debugLogs.add("NETWORK", `[NETWORK]`, "Successfully connected to dmdata.jp and WebSocket opened.");
                    $('#eewTitle').text("緊急地震速報は発表されていません");
                    $('#statusLamp').css({ 'background-color': '#4040ff' });
                });

                dmdataSocket.addEventListener('close', (event) => {
                    debugLogs.add("NETWORK", `[NETWORK]`, "Successfully disconnected from dmdata.jp and WebSocket closed.");
                    settings.connect.eew = "yahoo-kmoni";
                });

                dmdataSocket.addEventListener('message', (event) => {
                    const message = JSON.parse(event.data);

                    if (message.type === 'ping') {
                        dmdataSocket.send(JSON.stringify({ type: 'pong', pingId: message.pingId }));
                    }
                    if (message.type === 'data' && message.format === 'xml') {
                        dmdataEew(message.body);
                    }
                });

                dmdataSocket.onerror(event => {
                    debugLogs.add("ERROR", `[NETWORK]`, `Failed to connect to dmdata.jp.: ${event}`);

                    win('win_dmdata_oauth_error', 'dmdata接続エラー');

                    $('#win_dmdata_oauth_error>.content').html(`
                    <p>
                        WebSocket接続中にエラーが発生しました。<br>
                        <code>
                            ${event}
                        </code>
                    </p>
                    <button class="btn_retry">再試行</button>
                `)

                    $('#win_dmdata_oauth_error .navBar').css({
                        'background-color': '#c04040',
                        'color': '#ffffff'
                    })

                    $('#win_dmdata_oauth_error .content').css({
                        'padding': '1em'
                    })

                    $('#win_dmdata_oauth_error .content .btn_retry').css({
                        'position': 'absolute',
                        'right': '3em',
                        'bottom': '3em',
                        'width': '10em'
                    })

                    $('#win_dmdata_oauth_error .content .btn_retry').on('click', function () {
                        $('#win_dmdata_oauth_error').remove()
                        setTimeout('dmdataSocketStart()', 500);
                    })

                    settings.connect.eew = "yahoo-kmoni";
                });
            } else {
                if (document.getElementById('win_dmdata_oauth_error') === null) {
                    debugLogs.add("ERROR", `[NETWORK]`, `Failed to connect to dmdata.jp.: ${data.error.message}`);

                    win('win_dmdata_oauth_error', 'dmdata接続エラー');

                    $('#win_dmdata_oauth_error>.content').html(`
                    <p>
                        WebSocket接続に失敗しました。<br>
                        <code>
                            ${data.error.message}
                        </code>
                    </p>
                    <button class="btn_retry">再試行</button>
                `)

                    $('#win_dmdata_oauth_error .navBar').css({
                        'background-color': '#c04040',
                        'color': '#ffffff'
                    })

                    $('#win_dmdata_oauth_error .content').css({
                        'padding': '1em'
                    })

                    $('#win_dmdata_oauth_error .content .btn_retry').css({
                        'position': 'absolute',
                        'right': '3em',
                        'bottom': '3em',
                        'width': '10em'
                    })

                    $('#win_dmdata_oauth_error .content .btn_retry').on('click', function () {
                        $('#win_dmdata_oauth_error').remove()
                        setTimeout('dmdataSocketStart()', 500);
                    })

                    settings.connect.eew = "yahoo-kmoni"
                }
            }
        })
        .catch(error => {
            // hoge
        })
}


function dmdataEew(data) {
    let dmdataData = bodyToDocument(data);
    console.log(dmdataData);
}


function bodyToDocument(data) {
    const buffer = new Uint8Array(atob(data).split('').map(c => c.charCodeAt(0)));
    return new DOMParser().parseFromString(new TextDecoder().decode(new Zlib.Gunzip(buffer).decompress()), 'application/xml');
}
