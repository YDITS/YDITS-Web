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
import { Datetime } from "./modules/datetime.mjs";
import { Sounds } from "./modules/sounds.mjs";
import { ServiceWorker } from "./modules/service-worker.mjs";
import { Settings } from "./modules/settings.mjs";
import { PushNotify } from "./modules/push-notify.mjs";
import { Eqinfo } from "./eqinfo/eqinfo.mjs";
import { Dmdata } from "./dmdata/dmdata.mjs";
import { JmaDataFeed } from "./jma/jma-data-feed.mjs";


let debugLogs = null;
let isOnline = true;
let notify = null;
let datetime = null;
let sounds = null;
let serviceWorker = null;
let settings = null;
let eqinfo = null;
let dmdata = null;
let push = null;
let jmaDataFeed = null;
let kmoniLastStatus = true;
let eqinfoLastStatus = false;
let dateNow;
let eewGetCnt = -1;
let ntpGetCnt = -1;
let jmaDataFeedGetCnt = -1;
let mapAutoMoveCnt = -1;

const jmaDataFeedGetInterval = (1000 * 60) // 1min


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
let eew_isCancel = null;
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
        kmoni();
        eewGetCnt = dateNow;
    }

    if ((dateNow - jmaDataFeedGetCnt >= jmaDataFeedGetInterval)) {
        jmaDataFeed.update();
        jmaDataFeedGetCnt = dateNow;
    }

    mapMain();

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
            eqinfo = new Eqinfo(debugLogs, notify, settings, sounds);
            eqinfo.init(settings);
            dmdata.init(settings);

            initMenu();
            jmaDataFeed = new JmaDataFeed();
            initLicense();
            initMap();

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
            notify.show("message", `YDITS for Web Ver ${version}`, "");

            $("#eewTitle").text("読み込み中…");
        } catch (error) {
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
    $('#menu .version').text(`Ver ${version}`);

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


// ---------- eew ---------- //
function kmoni() {
    let kmoniDatetime = makeKmoniDatetime();
    if (kmoniDatetime === null) { return null }

    let url = `https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/${kmoniDatetime}.json`;

    // --- debug
    // const url = `https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/20210213/20210213230859.json`;  //2021-2-13-23:08 Fukushima
    // const url = "https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/20220529/20220529155631.json";  //2022-5-29-15:55 Ibaraki
    // const url = `https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/19700101/19700101000000.json`;  //1970-1-1-00:00 HTTP 403
    // const url = `https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/20200212/202002121937${zeroPadding(datetime.second)}.json`;  //2020-2-12-19:36 double eew
    // const url = `https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/20240101/202401011610${zeroPadding(datetime.second)}.json`;  //2024-1-1-16:10 Ishikawa
    // const url = "https://www.lmoni.bosai.go.jp/monitor/webservice/hypo/eew/20220330001911.json";                 //2022-3-30-00:19 kmoni
    // ---

    fetch(url)
        .then(response => { return response.json() })
        .then(data => {
            eew_data = data;

            if (settings.connect.eew === 'yahoo-kmoni' || dmdata_access_token === null) {
                if (eew_data["hypoInfo"] != null) {
                    eew_repNum = eew_data["hypoInfo"]["items"][0]["reportNum"];

                    if (eew_repNum != eew_repNum_last) {
                        eew_repNum_last = eew_repNum;

                        eew_isFinal = eew_data["hypoInfo"]["items"][0]["isFinal"];

                        if (eew_isFinal == 'true') {
                            eew_repNum_p = '最終報';
                        } else {
                            eew_repNum_p = `第${eew_repNum}報`
                        }

                        eew_origin_time = eew_data["hypoInfo"]["items"][0]["originTime"];
                        eew_timeYear = eew_origin_time.substring(0, 4);
                        eew_timeMonth = eew_origin_time.substring(5, 7);
                        eew_timeDay = eew_origin_time.substring(8, 10);
                        eew_timeHour = eew_origin_time.substring(11, 13);
                        eew_timeMinute = eew_origin_time.substring(14, 16);
                        eew_timeSecond = eew_origin_time.substring(17, 19);

                        eewReportId = eew_data["hypoInfo"]["items"][0]["reportId"];

                        eew_Region_name = eew_data["hypoInfo"]["items"][0]["regionName"];

                        if (!eew_Region_name) {
                            eew_Region_name = '不明';
                        }

                        eew_calcintensity_last = eew_calcintensity;

                        eew_calcintensity = eew_data["hypoInfo"]["items"][0]["calcintensity"];

                        switch (eew_calcintensity) {
                            case '01': eew_calcintensity = "1"; break;
                            case '02': eew_calcintensity = "2"; break;
                            case '03': eew_calcintensity = "3"; break;
                            case '04': eew_calcintensity = "4"; break;
                            case '5-': eew_calcintensity = "5-"; break;
                            case '5+': eew_calcintensity = "5+"; break;
                            case '6-': eew_calcintensity = "6-"; break;
                            case '6+': eew_calcintensity = "6+"; break;
                            case '07': eew_calcintensity = "7"; break;

                            default:
                                eew_calcintensity = `?`;
                                break;
                        }

                        eew_Magnitude = eew_data["hypoInfo"]["items"][0]["magnitude"];

                        if (eew_Magnitude) {
                            eew_Magnitude = 'M' + eew_Magnitude;
                        } else {
                            eew_Magnitude = '不明';
                        }

                        eew_depth = eew_data["hypoInfo"]["items"][0]["depth"];

                        if (eew_depth) {
                            eew_depth = '約' + eew_depth;
                        } else {
                            eew_depth = '不明';
                        }

                        /*
                        // Yahoo 強震モニタのJSONデータに 予報・警報 のフラッグがないため 未実装
                        
                        eew_alertFlg = eew_data['alertflg'];

                        switch (eew_alertFlg) {
                            case 'true':
                                eew_alertFlg = "警報"
                                break;

                            case 'false':
                                eew_alertFlg = "予報"
                                break;

                            case null:
                                eew_alertFlg = "{Null}"
                                break;

                            default:
                                eew_alertFlg = "{Unknown}"
                                break;
                        }
                        */

                        eew_alertFlg = '';

                        eew_isCancel = eew_data["hypoInfo"]["items"][0]['isCancel'];

                        if (eew_isCancel == 'true') {
                            eew_alertFlg = '取消報';
                        }

                        if (eew_isCancel == 'true') {
                            if (settings.sound.eewCancel == true) {
                                sounds.eewVoiceCancel.play();
                            }
                        } else {
                            if (settings.sound.eewAny == true && eew_calcintensity_last != eew_calcintensity) {
                                switch (eew_calcintensity) {
                                    case '1':
                                        sounds.eewVoice1.play();
                                        break;

                                    case '2':
                                        sounds.eewVoice2.play();
                                        break;

                                    case '3':
                                        sounds.eewVoice3.play();
                                        break;

                                    case '4':
                                        sounds.eewVoice4.play();
                                        break;

                                    case '5-':
                                        sounds.eew.play();
                                        sounds.eewVoice5.play();
                                        break;

                                    case '5+':
                                        sounds.eew.play();
                                        sounds.eewVoice6.play();
                                        break;

                                    case '6-':
                                        sounds.eew.play();
                                        sounds.eewVoice7.play();
                                        break;

                                    case '6+':
                                        sounds.eew.play();
                                        sounds.eewVoice8.play();
                                        break;

                                    case '7':
                                        sounds.eew.play();
                                        sounds.eewVoice9.play();
                                        break;

                                    default:
                                        sounds.eew.play();
                                        break;
                                }
                            }
                        }

                        eew_push()

                        // ----- put ----- //
                        let eew_bgc;
                        let eew_fntc;

                        switch (eew_calcintensity) {
                            case '1':
                                eew_bgc = "#808080";
                                eew_fntc = "#ffffff";
                                break;
                            case '2':
                                eew_bgc = "#4040c0";
                                eew_fntc = "#ffffff";
                                break;
                            case '3':
                                eew_bgc = "#40c040";
                                eew_fntc = "#ffffff";
                                break;
                            case '4':
                                eew_bgc = "#c0c040";
                                eew_fntc = "#ffffff";
                                break;
                            case '5-':
                                eew_bgc = "#c0a040";
                                eew_fntc = "#ffffff";
                                break;
                            case '5+':
                                eew_bgc = "#c08040";
                                eew_fntc = "#ffffff";
                                break;
                            case '6-':
                                eew_bgc = "#c04040";
                                eew_fntc = "#ffffff";
                                break;
                            case '6+':
                                eew_bgc = "#a04040";
                                eew_fntc = "#ffffff";
                                break;
                            case '7':
                                eew_bgc = "#804080";
                                eew_fntc = "#ffffff";
                                break;

                            default:
                                eew_bgc = "#8080c0";
                                eew_fntc = "#ffffff";
                                break;
                        }

                        if (eew_isCancel == 'true') {
                            eew_bgc = "#7f7fc0";
                            eew_fntc = "#010101";
                        }

                        $('#eewTitle').text(`緊急地震速報 ${eew_alertFlg}(${eew_repNum_p})`);
                        $('#eewCalc').text(eew_calcintensity);
                        $('#eewRegion').text(eew_Region_name);
                        $('#eewOrigin_time').text(`発生日時: ${eew_timeYear}/${eew_timeMonth}/${eew_timeDay} ${eew_timeHour}:${eew_timeMinute}:${eew_timeSecond}`);
                        $('#eewMagnitude').text(`規模 ${eew_Magnitude}`);
                        $('#eewDepth').text(`深さ ${eew_depth}`);

                        $('#eewField').css({
                            'background-color': eew_bgc,
                            'color': eew_fntc
                        })
                        $(`#eewCalc`).css({
                            'background-color': 'initial',
                            'color': 'initial'
                        })
                    }
                } else {
                    eew_repNum = '';
                    eew_repNum_last = '';
                    eew_alertFlg = '';
                    eew_timeYear = '';
                    eew_timeMonth = '';
                    eew_timeDay = '';
                    eew_timeHour = '';
                    eew_timeMinute = '';
                    eew_calcintensity = '';
                    eew_Region_name = '';
                    eew_Magnitude = '';
                    eew_depth = '';
                    eew_bgc = "#404040";
                    eew_fntc = "#ffffff";

                    $('#eewTitle').text(`緊急地震速報は発表されていません`);
                    $('#eewCalc').text("");
                    $('#eewRegion').text("");
                    $('#eewOrigin_time').text("");
                    $('#eewMagnitude').text("");
                    $('#eewDepth').text("");

                    $('#eewField').css({
                        'background-color': eew_bgc,
                        'color': eew_fntc
                    })
                    $(`#eewCalc`).css({
                        'background-color': 'initial',
                        'color': 'initial'
                    })
                }

                $('#statusLamp').css({ 'background-color': '#40ff40' });

                if (!kmoniLastStatus) {
                    kmoniLastStatus = true;
                }
            }
        })

        .catch(error => {
            if (settings.connect.eew === 'yahoo-kmoni' || dmdata_access_token === null) {
                if (error != 'TypeError: Failed to fetch') {
                    $('#statusLamp').css({ 'background-color': '#ff4040' });

                    if (kmoniLastStatus) {
                        debugLogs.add("ERROR", "[NETWORK]", `${error};}`)
                        notify.show("error", "エラー", "Yahoo! 強震モニタ (storage-yahoo.jp) に接続できません。<br>強震モニタが一時的に利用できないか、ネットワークが低速な可能性があります。");
                    }

                    kmoniLastStatus = false;
                }
            }
        })
};


function makeKmoniDatetime() {
    if (datetime.gmt === null) { return null }

    let kmoniDatetime = datetime.gmt;

    kmoniDatetime.setSeconds(datetime.second - 2);
    kmoniDatetime =
        `${kmoniDatetime.getFullYear()}` +
        `${zeroPadding(kmoniDatetime.getMonth() + 1)}` +
        `${zeroPadding(kmoniDatetime.getDate())}` +
        `/` +
        `${kmoniDatetime.getFullYear()}` +
        `${zeroPadding(kmoniDatetime.getMonth() + 1)}` +
        `${zeroPadding(kmoniDatetime.getDate())}` +
        `${zeroPadding(kmoniDatetime.getHours())}` +
        `${zeroPadding(kmoniDatetime.getMinutes())}` +
        `${zeroPadding(kmoniDatetime.getSeconds())}`;

    return kmoniDatetime;
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


// ---------- eew push ---------- //
function eew_push() {
    if (eew_isCancel) {
        Push.create(`緊急地震速報 (${eew_alertFlg})  ${eew_repNum_p}`, {
            body: `先程の緊急地震速報は取り消されました。\nページ表示するにはここを選択してください。\n`,
            onClick: function () {
                window.focus();
                this.close();
            }
        })
    } else {
        Push.create(`緊急地震速報 (${eew_alertFlg})  ${eew_repNum_p}`, {
            body: `${eew_hypocenter}で地震発生。予想最大震度は${eew_intensity}です。\nページ表示するにはここを選択してください。\n`,
            onClick: function () {
                window.focus();
                this.close();
            }
        })
    }
}


// ---------- Monitor ---------- //
function mapMain() {
    if (eew_data != null && eew_data["hypoInfo"] != null) {
        if (eewReportId !== eewReportIdLast && eewReportIdLast !== null) {
            eewNum++;
        }

        eewReportIdLast = eewReportId;

        for (let cnt = 0; cnt <= eewNum; cnt++) {
            if (cnt === eewNum) {
                eew_waves = eew_data['psWave']['items'][0];

                if (eew_waves !== null) {
                    mapItem[eewNum].eew_lat = eew_waves['latitude'].replace("N", "");
                    mapItem[eewNum].eew_lng = eew_waves['longitude'].replace("E", "");
                    eew_hypo_LatLng = new L.LatLng(mapItem[eewNum].eew_lat, mapItem[eewNum].eew_lng);

                    eew_wave_p = eew_waves['pRadius'];
                    eew_wave_s = eew_waves['sRadius'];
                    eew_wave_p *= 1000;
                    eew_wave_s *= 1000;
                }

                if (eew_wave_s != mapItem[eewNum].eew_wave_s_last) {
                    mapItem[eewNum].eew_wave_s_Interval = (eew_wave_s - mapItem[eewNum].eew_wave_s_last) / (60 * ((dateNow - loopCnt_moni) / 1000));
                    mapItem[eewNum].eew_wave_s_last = eew_wave_s;
                    mapItem[eewNum].eew_wave_s_put = eew_wave_s;
                } else if (eew_wave_s == mapItem[eewNum].eew_wave_s_last) {
                    mapItem[eewNum].eew_wave_s_put += mapItem[eewNum].eew_wave_s_Interval;
                }

                if (eew_wave_p != mapItem[eewNum].eew_wave_p_last) {
                    mapItem[eewNum].eew_wave_p_Interval = (eew_wave_p - mapItem[eewNum].eew_wave_p_last) / (60 * ((dateNow - loopCnt_moni) / 1000));
                    mapItem[eewNum].eew_wave_p_last = eew_wave_p;
                    mapItem[eewNum].eew_wave_p_put = eew_wave_p;
                    loopCnt_moni = dateNow;
                } else if (eew_wave_p == mapItem[eewNum].eew_wave_p_last) {
                    mapItem[eewNum].eew_wave_p_put += mapItem[eewNum].eew_wave_p_Interval;
                }
            } else {
                mapItem[cnt].eew_wave_s_put += mapItem[cnt].eew_wave_s_Interval;
                mapItem[cnt].eew_wave_p_put += mapItem[cnt].eew_wave_p_Interval;
            }

            mapItem[cnt].hypo.setLatLng(new L.LatLng(mapItem[cnt].eew_lat, mapItem[cnt].eew_lng));
            mapItem[cnt].wave_s.setLatLng(new L.LatLng(mapItem[cnt].eew_lat, mapItem[cnt].eew_lng));
            mapItem[cnt].wave_s.setRadius(mapItem[cnt].eew_wave_s_put);
            mapItem[cnt].wave_p.setLatLng(new L.LatLng(mapItem[cnt].eew_lat, mapItem[cnt].eew_lng));
            mapItem[cnt].wave_p.setRadius(mapItem[cnt].eew_wave_p_put);
        }

        if (settings.map.autoMove) {
            if (dateNow - mapAutoMoveCnt >= 1000 * 3) {
                if (mapItem[eewNum].eew_wave_p_put >= 560000) {
                    map.setView([mapItem[eewNum].eew_lat, mapItem[eewNum].eew_lng], 5);
                } else if (mapItem[eewNum].eew_wave_p_put >= 280000) {
                    map.setView([mapItem[eewNum].eew_lat, mapItem[eewNum].eew_lng], 6);
                } else if (mapItem[eewNum].eew_wave_p_put > 0) {
                    map.setView([mapItem[eewNum].eew_lat, mapItem[eewNum].eew_lng], 7);
                }

                mapAutoMoveCnt = dateNow
            }
        }
    } else {
        eewNum = 0;

        for (let cnt = 0; cnt < 9; cnt++) {
            mapItem[cnt].hypo.setLatLng(new L.LatLng(0, 0));
            mapItem[cnt].wave_s.setLatLng(new L.LatLng(0, 0));
            mapItem[cnt].wave_p.setLatLng(new L.LatLng(0, 0));
            mapItem[cnt].wave_s.setRadius(0);
            mapItem[cnt].wave_p.setRadius(0);
        }
    }
}


// ---------- Init monitor map ---------- //
function initMap() {
    map = L.map('map', {
        center: [38.0194092, 138.3664968],
        zoom: 6,
        maxZoom: 10,
        minZoom: 4,
        zoomSnap: 0,
        zoomDelta: 0,
        zoomControl: false
    });

    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        apikey: 'c168fc2f-2f64-4f13-874c-ce2dcec92819',
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(map);

    for (let cnt = 0; cnt < 9; cnt++) {
        mapItem[cnt] = new MapItem();
    }
}

// ---------- Map Items ---------- //
class MapItem {
    constructor() {
        this.isCurrent = false;

        this.hypo = L.circle([0, 0], {
            radius: 5000,
            weight: 2,
            color: '#ff2010',
            fillColor: '#ff2010',
            fillOpacity: 1,
        }).addTo(map);

        this.wave_s = L.circle([0, 0], {
            radius: -1,
            weight: 1,
            color: '#ff4020',
            fillColor: '#ff402080',
            fillOpacity: 0.25,
        }).addTo(map);

        this.wave_p = L.circle([0, 0], {
            radius: -1,
            weight: 1,
            color: '#4080ff',
            fillColor: '#00000000',
            fillOpacity: 0,
        }).addTo(map);

        this.eew_lat = 0;
        this.eew_lng = 0;
        this.eew_wave_p_last = null;
        this.eew_wave_p_Interval = null;
        this.eew_wave_p_put = null;
        this.eew_wave_s_last = null;
        this.eew_wave_s_Interval = null;
        this.eew_wave_s_put = null;
    }
}
