/*
 *
 * ydits-web.js | YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */


// ---------- Debug Logs ---------- //
let debugLogs = [];


// ---------- Timers ---------- //
let gmt;
let cnt_eew = -1;
let cnt_getNTP = -1;
let cnt_p2p = -1;
let cnt_mapMove = -1;
let timeYear;
let timeMonth;
let timeDay;
let timeHour;
let timeMinute;
let timeSecond;


// ---------- Settings ---------- //
let settings_playSound_eew_any;
let settings_playSound_eew_cancel;


// ---------- EEW ---------- //
let eewGetType = "";
let eew_origin_time = null;
let mapItem = [];
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
let eew_repNum_p = '';
let eew_calcintensity = '';
let eew_Region_name = '';
let eew_Magnitude = '';
let eew_depth = '';
let eew_isCansel = null;
let eew_isTraining = null;
let eew_bgc;
let eew_fntc;


// ---------- dmdata ---------- //
let dmdataSocket = null;
let dmdata_access_token = null;


// ---------- P2pquake ---------- //
let p2p_data;
let p2p_time_temp = -1;
let p2p_id = -1;
let p2p_id_last = -1;
let p2p_his_id_last = -1;
let p2p_his_cnt = 0;
let loopCnt_history = -1;


// ---------- Maps ---------- //
let map;
let loopCnt_moni = -1;
let loopCnt_loopWaves = -1;
let hypo = null;
let wave_s = null;
let wave_p = null;
let hypo2 = null;
let wave_s2 = null;
let wave_p2 = null;
let eew_waves = null;
let eew_wave_p = -1;
let eew_wave_p_last = -1;
let eew_wave_p_Interval = -1;
let eew_wave_p_put = -1;
let eew_wave_s = -1;
let eew_wave_s_last = -1;
let eew_wave_s_Interval = -1;
let eew_wave_s_put = -1;
let eew_lat = '';
let eew_lng = '';
let eew_hypo_LatLng = null;


// ---------- Sounds ---------- //
let eew_sound;
let p2p_sound;
let eew_1_voice;
let eew_2_voice;
let eew_3_voice;
let eew_4_voice;
let eew_5_voice;
let eew_6_voice;
let eew_7_voice;
let eew_8_voice;
let eew_9_voice;
let eew_Cancel_voice;
let p2p_1_voice;
let p2p_2_voice;
let p2p_3_voice;
let p2p_4_voice;
let p2p_5_voice;
let p2p_6_voice;
let p2p_7_voice;
let p2p_8_voice;
let p2p_9_voice;


// ---------- Main ---------- //
$(async () => {
    await init();
    requestAnimationFrame(mainloop);
});


// ---------- Mainloop ---------- //
function mainloop() {
    dateNow = new Date();

    if (dateNow - cnt_getNTP >= 1000) {
        getNtp();
        clock();
        cnt_getNTP = dateNow;
    }

    if (dateNow - cnt_eew >= 1000) {
        kmoni();
        cnt_eew = dateNow;
    }

    if (dateNow - cnt_p2p >= 1000 * 4) {
        getInfo();
        eqinfo();
        cnt_p2p = dateNow;
    }

    mapMain();

    requestAnimationFrame(mainloop);
}


// ---------- Initialize ---------- //
async function init() {
    await getNtp();

    initDebugLogs();
    initServiceWorker();
    initSettings();
    initDmdata();
    initMenu();
    initLicense();
    initMap();
    initSounds();
    initPush();

    addDebugLogs("INFO", "[INFO]", "Application initialized.")
}


// ------------- Get NTP datetime ---------- //
async function getNtp() {
    await axios.head(window.location.href, { headers: { 'Cache-Control': 'no-cache' } })
        .then(res => {
            gmt = new Date(res.headers.date);

            timeYear = gmt.getFullYear();
            timeMonth = gmt.getMonth() + 1;
            timeDay = gmt.getDate();
            timeHour = gmt.getHours();
            timeMinute = gmt.getMinutes();
            timeSecond = gmt.getSeconds();
        }).catch(error => {
            if (error.code == 'ERR_NETWORK') {
                dmdataSocket.close();
                $('#statusLamp').css({ 'background-color': '#ff4040' });
            }
        })
}


// ---------- Debug Logs ---------- //
function initDebugLogs() {
    debugLogsRaw = localStorage.getItem("debugLogs");

    if (debugLogsRaw === null) {
        addDebugLogs("START", "[START]", "- Start log -");
    } else {
        debugLogs = JSON.parse(debugLogsRaw);
        debugLogs.forEach(log => {
            addDebugLogsHtml(log.time, log.type, log.title, log.text);
        });
    }

}

function addDebugLogs(type, title, text) {
    time = `${timeYear}/${('0' + timeMonth).slice(-2)}/${('0' + timeDay).slice(-2)} ${('0' + timeHour).slice(-2)}:${('0' + timeMinute).slice(-2)}:${('0' + timeSecond).slice(-2)}`;

    debugLogs.push({
        "time": time,
        "type": type,
        "title": title,
        "text": text
    });

    localStorage.setItem("debugLogs", JSON.stringify(debugLogs));

    addDebugLogsHtml(time, type, title, text);
}

function addDebugLogsHtml(time, type, title, text) {
    switch (type) {
        case "INFO":
            color = "#ffffffff";
            break;

        case "START":
            color = "#6060ffff";
            break;

        case "ERROR":
            color = "#ff6060ff";
            break;

        case "NETWORK":
            color = "#60ff60ff";
            break;

        default:
            color = "#ffffffff";
            break;
    }

    $('#debugLogLists').prepend(`
        <li>
            <h3 class="title" style="color: ${color};">${title} ${time}</h3>
            <p class="text">${text}</p>
        </li>
    `);
}

function deleteDebugLogs() {
    debugLogs = [];
    debugLogsRaw = null;
    $('#debugLogLists').html("");
    localStorage.removeItem("debugLogs");
}


// ---------- Service Worker ---------- //
function initServiceWorker() {
    const registerServiceWorker = async () => {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register(
                    './sw.js',
                    {
                        scope: './',
                    }
                );
                if (registration.installing) {
                    addDebugLogs("INFO", `[INFO]`, "Service worker installing.");
                } else if (registration.waiting) {
                    addDebugLogs("INFO", `[INFO]`, "Service worker installed.");
                } else if (registration.active) {
                    // addDebugLogs(`[INFO ]`, "Service worker active.");
                }
            } catch (error) {
                addDebugLogs("ERROR", `[ERROR]`, `Registration failed with ${error}`);
            }
        } else {
            addDebugLogs("INFO", `[INFO]`, "Service worker is not installed.");
        }
    };

    registerServiceWorker();
}


// ---------- Sounds ---------- //
function initSounds() {
    eew_sound = new Audio("https://webapp.ydits.net/sounds/eew.wav");
    p2p_sound = new Audio("https://webapp.ydits.net/sounds/info.wav");
    eew_1_voice = new Audio("https://webapp.ydits.net/sounds/eew_1_v.mp3");
    eew_2_voice = new Audio("https://webapp.ydits.net/sounds/eew_2_v.mp3");
    eew_3_voice = new Audio("https://webapp.ydits.net/sounds/eew_3_v.mp3");
    eew_4_voice = new Audio("https://webapp.ydits.net/sounds/eew_4_v.mp3");
    eew_5_voice = new Audio("https://webapp.ydits.net/sounds/eew_5_v.mp3");
    eew_6_voice = new Audio("https://webapp.ydits.net/sounds/eew_6_v.mp3");
    eew_7_voice = new Audio("https://webapp.ydits.net/sounds/eew_7_v.mp3");
    eew_8_voice = new Audio("https://webapp.ydits.net/sounds/eew_8_v.mp3");
    eew_9_voice = new Audio("https://webapp.ydits.net/sounds/eew_9_v.mp3");
    eew_Cancel_voice = new Audio("https://webapp.ydits.net/sounds/eew_cancel_v.mp3");
    p2p_1_voice = new Audio("https://webapp.ydits.net/sounds/info_1_v.mp3");
    p2p_2_voice = new Audio("https://webapp.ydits.net/sounds/info_2_v.mp3");
    p2p_3_voice = new Audio("https://webapp.ydits.net/sounds/info_3_v.mp3");
    p2p_4_voice = new Audio("https://webapp.ydits.net/sounds/info_4_v.mp3");
    p2p_5_voice = new Audio("https://webapp.ydits.net/sounds/info_5_v.mp3");
    p2p_6_voice = new Audio("https://webapp.ydits.net/sounds/info_6_v.mp3");
    p2p_7_voice = new Audio("https://webapp.ydits.net/sounds/info_7_v.mp3");
    p2p_8_voice = new Audio("https://webapp.ydits.net/sounds/info_8_v.mp3");
    p2p_9_voice = new Audio("https://webapp.ydits.net/sounds/info_9_v.mp3");
}


// ---------- Push ---------- //
function initPush() {
    if (!Push.Permission.has()) { Push.Permission.request(() => { }, () => { }) }
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
        map.setZoom(6);
        setTimeout('map.setView([38.0194092, 138.3664968])', 750);

    });

    $(document).on('click', '#menuSettings', () => {
        $('#settings').addClass('active');
    });

    $(document).on('click', '#menuLicense', () => {
        $('#license').addClass('active');
    });
}


// ---------- Settings ---------- //
function initSettings() {
    $(document).on('click', '#settings .closeBtn', function () {
        $('#settings').removeClass('active');
        $('#menu').addClass('active');
    });

    $(document).on('click', '#settings_list_sound', () => {
        $('#settings_sounds').addClass('active');
    });
    $(document).on('click', '#settings_sounds .closeBtn', () => {
        $('#settings_sounds').removeClass('active');
    });

    $(document).on('click', '#settings_list_map', () => {
        $('#settings_map').addClass('active');
    });
    $(document).on('click', '#settings_map .closeBtn', () => {
        $('#settings_map').removeClass('active');
    });

    $(document).on('click', '#settings_list_connect', () => {
        $('#settings_connect').addClass('active');
    });
    $(document).on('click', '#settings_connect .closeBtn', () => {
        $('#settings_connect').removeClass('active');
    });

    $(document).on('click', '#settings_list_notify', () => {
        $('#settings_notify').addClass('active');
    });
    $(document).on('click', '#settings_notify .closeBtn', () => {
        $('#settings_notify').removeClass('active');
    });

    $(document).on('click', '#settings_list_other', () => {
        $('#settings_other').addClass('active');
    });
    $(document).on('click', '#settings_other .closeBtn', () => {
        $('#settings_other').removeClass('active');
    });

    // ----- Sounds -----//
    $(document).on('click', '#settings_list_sound', () => {
        $('#settings_sounds').addClass('active');
        $('#settings_connect').removeClass('active');
        $('#settings_notify').removeClass('active');
        $('#settings_other').removeClass('active');
        $('#settings_list_sound').addClass('active');
        $('#settings_list_connect').removeClass('active');
        $('#settings_list_notify').removeClass('active');
        $('#settings_list_other').removeClass('active');
    });
    $(document).on('click', '#settings_list_connect', () => {
        $('#settings_sounds').removeClass('active');
        $('#settings_connect').addClass('active');
        $('#settings_notify').removeClass('active');
        $('#settings_other').removeClass('active');
        $('#settings_list_sound').removeClass('active');
        $('#settings_list_connect').addClass('active');
        $('#settings_list_notify').removeClass('active');
        $('#settings_list_other').removeClass('active');
    });
    $(document).on('click', '#settings_list_notify', () => {
        $('#settings_sounds').removeClass('active');
        $('#settings_connect').removeClass('active');
        $('#settings_notify').addClass('active');
        $('#settings_other').removeClass('active');
        $('#settings_list_sound').removeClass('active');
        $('#settings_list_connect').removeClass('active');
        $('#settings_list_notify').addClass('active');
        $('#settings_list_other').removeClass('active');
    });
    $(document).on('click', '#settings_list_other', () => {
        $('#settings_sounds').removeClass('active');
        $('#settings_connect').removeClass('active');
        $('#settings_notify').removeClass('active');
        $('#settings_other').addClass('active');
        $('#settings_list_sound').removeClass('active');
        $('#settings_list_connect').removeClass('active');
        $('#settings_list_notify').removeClass('active');
        $('#settings_list_other').addClass('active');
    });

    if (localStorage.getItem("settings-playSound-eew-any") == 'true') {
        settings_playSound_eew_any = true;
        $('#settings_playSound_eew_any .toggle-switch').addClass('on');
    } else if (localStorage.getItem("settings-playSound-eew-any") == 'false') {
        settings_playSound_eew_any = false;
        $('#settings_playSound_eew_any .toggle-switch').removeClass('on');
    } else {
        settings_playSound_eew_any = true;
        $('#settings_playSound_eew_any .toggle-switch').addClass('on');
    }

    $(document).on('click', '#settings_playSound_eew_any .toggle-switch', function () {
        if (settings_playSound_eew_any == false) {
            settings_playSound_eew_any = true;
            localStorage.setItem('settings-playSound-eew-any', 'true');
            $('#settings_playSound_eew_any .toggle-switch').addClass('on');
        } else if (settings_playSound_eew_any == true) {
            settings_playSound_eew_any = false;
            localStorage.setItem('settings-playSound-eew-any', 'false');
            $('#settings_playSound_eew_any .toggle-switch').removeClass('on');
        }
    })

    if (localStorage.getItem("settings-playSound-eew-cancel") == 'true') {
        settings_playSound_eew_cancel = true;
        $('#settings_playSound_eew_cancel .toggle-switch').addClass('on');
    } else if (localStorage.getItem("settings-playSound-eew-cancel") == 'false') {
        settings_playSound_eew_cancel = false;
        $('#settings_playSound_eew_cancel .toggle-switch').removeClass('on');
    } else {
        settings_playSound_eew_cancel = true;
        $('#settings_playSound_eew_cancel .toggle-switch').addClass('on');
    }

    $(document).on('click', '#settings_playSound_eew_cancel .toggle-switch', function () {
        if (settings_playSound_eew_cancel == false) {
            settings_playSound_eew_cancel = true;
            localStorage.setItem('settings-playSound-eew-cancel', 'true');
            $('#settings_playSound_eew_cancel .toggle-switch').addClass('on');
        } else if (settings_playSound_eew_cancel == true) {
            settings_playSound_eew_cancel = false;
            localStorage.setItem('settings-playSound-eew-cancel', 'false');
            $('#settings_playSound_eew_cancel .toggle-switch').removeClass('on');
        }
    })

    if (localStorage.getItem("settings-playSound-info") == 'true') {
        settings_playSound_eqinfo = true;
        $('#settings_playSound_eqinfo .toggle-switch').addClass('on');
    } else if (localStorage.getItem("settings-playSound-info") == 'false') {
        settings_playSound_eqinfo = false;
        $('#settings_playSound_eqinfo .toggle-switch').removeClass('on');
    } else {
        settings_playSound_eqinfo = true;
        $('#settings_playSound_eqinfo .toggle-switch').addClass('on');
    }

    $(document).on('click', '#settings_playSound_eqinfo .toggle-switch', function () {
        if (settings_playSound_eqinfo == false) {
            settings_playSound_eqinfo = true;
            localStorage.setItem('settings-playSound-info', 'true');
            $('#settings_playSound_eqinfo .toggle-switch').addClass('on');
        } else if (settings_playSound_eqinfo == true) {
            settings_playSound_eqinfo = false;
            localStorage.setItem('settings-playSound-info', 'false');
            $('#settings_playSound_eqinfo .toggle-switch').removeClass('on');
        }
    })

    // ----- Map ----- //
    if (localStorage.getItem("settings-map-auto-move") == 'true') {
        settings_map_auto_move = true;
        $('#settings_map_auto_move .toggle-switch').addClass('on');
    } else if (localStorage.getItem("settings-map-auto-move") == 'false') {
        settings_map_auto_move = false;
        $('#settings_map_auto_move .toggle-switch').removeClass('on');
    } else {
        settings_map_auto_move = true;
        $('#settings_map_auto_move .toggle-switch').addClass('on');
    }

    $(document).on('click', '#settings_map_auto_move .toggle-switch', function () {
        if (settings_map_auto_move == false) {
            settings_map_auto_move = true;
            localStorage.setItem('settings-map-auto-move', 'true');
            $('#settings_map_auto_move .toggle-switch').addClass('on');
        } else if (settings_map_auto_move == true) {
            settings_map_auto_move = false;
            localStorage.setItem('settings-map-auto-move', 'false');
            $('#settings_map_auto_move .toggle-switch').removeClass('on');
        }
    })


    // ----- Get Type -----//
    if (localStorage.getItem("settings-getType-eew") != null) {
        eewGetType = localStorage.getItem("settings-getType-eew");
    } else {
        eewGetType = "yahoo-kmoni";
    }

    $(`select[name="settings-getType-eew"]`).val(`${eewGetType}`);

    if (eewGetType === 'yahoo-kmoni') {
        $('#settings_dmdata').hide();
    } else if (eewGetType === 'dmdata') {
        $('#settings_dmdata').show();

    }

    dmdata_access_token = localStorage.getItem('settings-dmdata-access-token');
    if (dmdata_access_token === null) {
        $('#settings_dmdata_init').show();
        $('#settings_dmdata_main').hide();
    } else {
        $('#settings_dmdata_init').hide();
        $('#settings_dmdata_main').show();
    }

    $(document).on('change', 'select[name="settings-getType-eew"]', () => {
        eewGetType = $('option:selected').val();
        if (eewGetType === 'yahoo-kmoni') {
            $('#settings_dmdata').hide();
            if (dmdata_access_token !== null) {
                dmdataSocket.close();
            }
        } else if (eewGetType === 'dmdata') {
            $('#settings_dmdata').show();
            if (dmdata_access_token !== null) {
                dmdataSocketStart();
            }
        }
        localStorage.setItem('settings-getType-eew', eewGetType);
    });

    if (localStorage.getItem("settings-getType-eqinfo") != null) {
        eqinfoGetType = localStorage.getItem("settings-getType-eqinfo");
    } else {
        eqinfoGetType = "p2pquake";
    }

    $(`select[name="settings-getType-eqinfo"]`).val(`${eqinfoGetType}`);

    $(document).on('change', 'select[name="settings-getType-eqinfo"]', () => {
        eqinfoGetType = $('option:selected').val();
        if (eqinfoGetType === 'p2pquake') {
        } else if (eqinfoGetType === 'dmdata') {
        }
        localStorage.setItem('settings-getType-eqinfo', eqinfoGetType);
    });

    if (localStorage.getItem("settings-getType-tsunami") != null) {
        tsunamiGetType = localStorage.getItem("settings-getType-tsunami");
    } else {
        tsunamiGetType = "p2pquake";
    }

    $(`select[name="settings-getType-tsunami"]`).val(`${tsunamiGetType}`);

    $(document).on('change', 'select[name="settings-getType-tsunami"]', () => {
        tsunamiGetType = $('option:selected').val();
        if (tsunamiGetType === 'p2pquake') {
        } else if (tsunamiGetType === 'dmdata') {
        }
        localStorage.setItem('settings-getType-tsunami', tsunamiGetType);
    });

    // ----- dmdata -----//
    $(document).on('click', '#settings_dmdata_init_btn', connectDmdata)

    // ----- Reset -----//
    $(document).on('click', '#settings_resetSettingsBtn', function () {
        eewGetType = "yahoo-kmoni";
        eqinfoGetType = "p2pquake";
        tsunamiGetType = "p2pquake";
        $(`select[name="settings-getType-eew"]`).val(`${eewGetType}`);
        $(`select[name="settings-getType-eqinfo"]`).val(`${eqinfoGetType}`);
        $(`select[name="settings-getType-tsunami"]`).val(`${tsunamiGetType}`);

        settings_map_auto_move = true;
        $('#settings_map_auto_move .toggle-switch').addClass('on');

        dmdata_access_token = null;
        $('#settings_dmdata').hide();
        $('#settings_dmdata_init').show();
        $('#settings_dmdata_main').hide();

        settings_playSound_eew_any = true;
        $('#settings_playSound_eew_any .toggle-switch').addClass('on');

        settings_playSound_eew_cancel = true;
        $('#settings_playSound_eew_cancel .toggle-switch').addClass('on');

        settings_playSound_eqinfo = true;
        $('#settings_playSound_eqinfo .toggle-switch').addClass('on');

        localStorage.clear()
        localStorage.setItem("debugLogs", JSON.stringify(debugLogs));

        if (document.getElementById('win_settings_reset') == null) {

            win('win_settings_reset', '設定のリセット');

            $('#win_settings_reset>.content').html(`
                <p>
                    設定をリセットしました。
                </p>
                <button class="btn_ok">OK</button>
            `)

            $('#win_settings_reset .content').css({
                'padding': '1em'
            })

            $('#win_settings_reset .content .btn_ok').css({
                'position': 'absolute',
                'height': '2rem',
                'right': '2rem',
                'bottom': '2rem',
                'width': 'calc(100% - 4rem)',
                'border': 'none',
                'border-radius': '1rem',
                'background-color': '#606060ff',
                'color': '#ffffffff',
                'cursor': 'pointer'
            })

            $(document).on('click', '#win_settings_reset .content .btn_ok', function () {
                $('#win_settings_reset').remove()
            })
        }

        addDebugLogs("INFO", `[INFO]`, "Settings were reset.");
    });

    // ----- Test Play Sounds -----//
    $(document).on('click', '#btn_eew_chk_sound', function () {
        eew_sound.play();
        eew_7_voice.play();
    });
    $(document).on('click', '#btn_earthquake_info_chk_sound', function () {
        p2p_sound.play();
        p2p_7_voice.play();
    });
    $(document).on('click', '#btn_eew_cancel_chk_sound', function () {
        eew_Cancel_voice.play();
    });
    $(document).on('click', '#btn_push_chk', function () {
        Push.create(`YDITS for Web`, {
            body: `これはプッシュ通知のテストです。`,
            timeout: 10000,
            onClick: function () {
                window.focus();
                this.close();
            }
        })
    });

    // ----- Debug Logs -----//
    $(document).on("click", "#openDebugLogsButton", () => {
        $("#debugLogsWindow").addClass("active");
    });
    $(document).on("click", "#debugLogsWindow .closeBtn", () => {
        $("#debugLogsWindow").removeClass("active");
    });

    // ----- Delete Debug Logs -----//
    $(document).on('click', '#deleteDebugLogsButton', function () {
        deleteDebugLogs();
        addDebugLogs("START", "[START]", "- Start log -");

        if (document.getElementById('windowDebugLogsDeleted') == null) {

            win('windowDebugLogsDeleted', 'デバッグログの削除');

            $('#windowDebugLogsDeleted>.content').html(`
                <p>
                    デバッグログを削除しました。
                </p>
                <button class="btn_ok">OK</button>
            `)

            $('#windowDebugLogsDeleted .content').css({
                'padding': '1em'
            })

            $('#windowDebugLogsDeleted .content .btn_ok').css({
                'position': 'absolute',
                'height': '2rem',
                'right': '2rem',
                'bottom': '2rem',
                'width': 'calc(100% - 4rem)',
                'border': 'none',
                'border-radius': '1rem',
                'background-color': '#606060ff',
                'color': '#ffffffff',
                'cursor': 'pointer'
            })

            $(document).on('click', '#windowDebugLogsDeleted .content .btn_ok', function () {
                $('#windowDebugLogsDeleted').remove()
            })
        }
    });
}


// ---------- License ---------- //
function initLicense() {
    $(document).on('click', '#license .closeBtn', function () {
        $('#license').removeClass('active');
    })
}


// ---------- Dmdata ---------- //
function connectDmdata() {
    const dmdataOAuthBaseUrl = 'https://manager.dmdata.jp/account/oauth2/v1/auth';
    const state = "Ze4VX8";
    const dmdataOAuthConfig = '?client_id=CId.M7sB113X43c8dDZ6SgEWXOa0gMm4S7tlh0fCM-IEJ5VV' +
        '&response_type=code' +
        '&redirect_uri=https:%2F%2Fwebapp.ydits.net%2F' +
        '&scope=socket.start%20socket.list%20socket.close%20eew.get.warning%20eew.get.forecast' +
        `&state=${state}`

    addDebugLogs("NETWORK", "[NETWORK]", "OAuth authentication to dmdata.jp.")
    window.open(dmdataOAuthBaseUrl + dmdataOAuthConfig, '_blank');
}


// Dmdata Redirect Checking
function initDmdata() {
    if (eewGetType === 'dmdata') {
        if (dmdata_access_token !== null) {
            addDebugLogs("NETWORK", "[NETWORK]", "The access token for dmdata.jp is correct.")
            $('#settings_dmdata_init').hide();
            $('#settings_dmdata_main').show();
            dmdataSocketStart()
        } else {
            const state = "Ze4VX8";
            const resCode = getParam('code');
            const resState = getParam('state');

            if (resState === state) {
                let resError = getParam('error');
                let resError_description = getParam('error_description');

                if (resError === null) {
                    const dmdataFormData = {
                        'client_id': 'CId.M7sB113X43c8dDZ6SgEWXOa0gMm4S7tlh0fCM-IEJ5VV',
                        'grant_type': 'authorization_code',
                        'code': resCode
                    }
                    const dmdataFormBody = new URLSearchParams(dmdataFormData).toString();

                    fetch('https://manager.dmdata.jp/account/oauth2/v1/token', {
                        method: 'POST',
                        Host: 'manager.dmdata.jp',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: dmdataFormBody
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data['error'] === undefined) {
                                dmdata_access_token = data['access_token'];
                                localStorage.setItem('settings-dmdata-access-token', dmdata_access_token);
                                $('#settings_dmdata_init').hide();
                                $('#settings_dmdata_main').show();
                                dmdataSocketStart()
                            } else if (data['error'] === 'invalid_grant') {
                                addDebugLogs("ERROR", "[NETWORK]", "DM-D.S.S Account authentication failed.")

                                $('#eewTitle').text("Error; dmdataの接続設定を確認してください。");

                                win('win_dmdata_oauth_error', 'DM-D.S.S アカウント認証エラー');

                                $('#win_dmdata_oauth_error>.content').html(`
                                <p>
                                    dmdataとの接続を続行するにはDM-D.S.Sアカウントを再度連携をしてください。<br>
                                    <code>
                                        ${data['error']}<br>
                                        ${data['error_description']}<br>
                                    </code>
                                </p>
                                <button class="btn_ok">OK</button>
                            `)

                                $('#win_dmdata_oauth_error .navBar').css({
                                    'background-color': '#c04040',
                                    'color': '#ffffff'
                                })

                                $('#win_dmdata_oauth_error .content').css({
                                    'padding': '1em'
                                })

                                $('#win_dmdata_oauth_error .content .btn_ok').css({
                                    'position': 'absolute',
                                    'right': '3em',
                                    'bottom': '3em',
                                    'width': '10em'
                                })

                                $(document).on('click', '#win_dmdata_oauth_error .content .btn_ok', function () {
                                    $('#win_dmdata_oauth_error').remove()
                                })
                            } else {
                                addDebugLogs("ERROR", "[NETWORK]", "DM-D.S.S Account authentication failed.")

                                $('#eewTitle').text("Error; dmdataの接続設定を確認してください。");

                                win('win_dmdata_oauth_error', 'DM-D.S.S アカウント認証エラー');

                                $('#win_dmdata_oauth_error>.content').html(`
                                <p>
                                    DM-D.S.S アカウント認証でエラーが発生しました。<br>
                                    設定をリセットした場合は再度アカウント連携をしてください。<br>
                                    <code>
                                        ${data['error']}<br>
                                        ${data['error_description']}<br>
                                    </code>
                                </p>
                                <button class="btn_ok">OK</button>
                            `)

                                $('#win_dmdata_oauth_error .navBar').css({
                                    'background-color': '#c04040',
                                    'color': '#ffffff'
                                })

                                $('#win_dmdata_oauth_error .content').css({
                                    'padding': '1em'
                                })

                                $('#win_dmdata_oauth_error .content .btn_ok').css({
                                    'position': 'absolute',
                                    'right': '3em',
                                    'bottom': '3em',
                                    'width': '10em'
                                })

                                $(document).on('click', '#win_dmdata_oauth_error .content .btn_ok', function () {
                                    $('#win_dmdata_oauth_error').remove()
                                })
                            }
                        })
                        .catch(error => {
                            addDebugLogs("ERROR", "[NETWORK]", "DM-D.S.S Account authentication failed.")

                            $('#eewTitle').text("Error; dmdataの接続設定を確認してください。");

                            win('win_dmdata_oauth_error', 'DM-D.S.S アカウント認証エラー');

                            $('#win_dmdata_oauth_error>.content').html(`
                            <p>
                                DM-D.S.S アカウント認証時にエラーが発生しました。<br>
                                <code>${error}</code>
                            </p>
                            <button class="btn_ok">OK</button>
                        `)

                            $('#win_dmdata_oauth_error .navBar').css({
                                'background-color': '#c04040',
                                'color': '#ffffff'
                            })

                            $('#win_dmdata_oauth_error .content').css({
                                'padding': '1em'
                            })

                            $('#win_dmdata_oauth_error .content .btn_ok').css({
                                'position': 'absolute',
                                'right': '3em',
                                'bottom': '3em',
                                'width': '10em'
                            })

                            $(document).on('click', '#win_dmdata_oauth_error .content .btn_ok', function () {
                                $('#win_dmdata_oauth_error').remove()
                            })
                        })

                } else {
                    addDebugLogs("ERROR", "[NETWORK]", "DM-D.S.S Account authentication failed.")

                    $('#eewTitle').text("Error; dmdataの接続設定を確認してください。");

                    win('win_dmdata_oauth_error', 'DM-D.S.S アカウント連携エラー');

                    $('#win_dmdata_oauth_error>.content').html(`
                        <p>
                            ${resError}<br>
                            ${resError_description}
                        </p>
                        <button class="btn_ok">OK</button>
                    `)

                    $('#win_dmdata_oauth_error .navBar').css({
                        'background-color': '#c04040',
                        'color': '#ffffff'
                    })

                    $('#win_dmdata_oauth_error .content').css({
                        'padding': '1em'
                    })

                    $('#win_dmdata_oauth_error .content .btn_ok').css({
                        'position': 'absolute',
                        'right': '3em',
                        'bottom': '3em',
                        'width': '10em'
                    })

                    $(document).on('click', '#win_dmdata_oauth_error .content .btn_ok', function () {
                        $('#win_dmdata_oauth_error').remove()
                    })
                }
            }
        }
    }
}


function getParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


// ---------- Clock ---------- //
function clock() {
    $('#clock').text(`${timeYear}/${('0' + timeMonth).slice(-2)}/${('0' + timeDay).slice(-2)} ${('0' + timeHour).slice(-2)}:${('0' + timeMinute).slice(-2)}:${('0' + timeSecond).slice(-2)}`);
}


// ---------- eew ---------- //
function kmoni() {
    yahooeewDate = makeDate_yahooeew();
    const yahooeewUrl = `https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/${yahooeewDate}.json`;

    // --- debug
    // const yahooeewUrl = `https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/20210213/20210213230859.json`;  //2021-2-13-23:08 Fukushima
    // const yahooeewUrl = "https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/20220529/20220529155631.json";  //2022-5-29-15:55 Ibaraki
    // const yahooeewUrl = `https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/19700101/19700101000000.json`;  //1970-1-1-00:00 HTTP 403
    // const yahooeewUrl = "https://www.lmoni.bosai.go.jp/monitor/webservice/hypo/eew/20220330001911.json";                 //2022-3-30-00:19 kmoni
    // ---

    fetch(yahooeewUrl)
        .then(response => { return response.json() })
        .then(result => {
            eew_data = result;

            if (eewGetType === 'yahoo-kmoni' || dmdata_access_token === null) {
                if (eew_data["hypoInfo"] != null) {
                    eew_repNum = eew_data["hypoInfo"]["items"][0]["reportNum"];

                    // --- debug
                    // eew_repNum = '1';  // First report
                    // eew_repNum_last = -2;  // Difficalt report
                    // ---

                    if (eew_repNum != eew_repNum_last) {
                        eew_repNum_last = eew_repNum;

                        eew_isFinal = eew_data["hypoInfo"]["items"][0]["isFinal"];

                        // --- debug
                        // eew_isFinal = 'true'; 
                        // ---

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

                        eew_Region_name = eew_data["hypoInfo"]["items"][0]["regionName"];

                        // --- debug
                        // eew_Region_name = '東京湾';
                        // ---

                        if (!eew_Region_name) {
                            eew_Region_name = '不明';
                        }

                        eew_calcintensity_last = eew_calcintensity;

                        eew_calcintensity = eew_data["hypoInfo"]["items"][0]["calcintensity"];

                        // --- debug
                        // eew_calcintensity = '5-';
                        // ---

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

                        // --- debug
                        // eew_Magnitude = '7.0';
                        // ---

                        if (eew_Magnitude) {
                            eew_Magnitude = 'M' + eew_Magnitude;
                        } else {
                            eew_Magnitude = '不明';
                        }

                        eew_depth = eew_data["hypoInfo"]["items"][0]["depth"];

                        // --- debug
                        // eew_depth = '70km';
                        // ---

                        if (eew_depth) {
                            eew_depth = '約' + eew_depth;
                        } else {
                            eew_depth = '不明';
                        }

                        // Yahoo 強震モニタのJSONデータに 予報・警報 のフラッグがないため 未実装

                        // eew_alertFlg = eew_data['alertflg'];

                        // switch (eew_alertFlg) {
                        //   case 'true':
                        //     eew_alertFlg = "警報"
                        //     break;

                        //   case 'false':
                        //     eew_alertFlg = "予報"
                        //     break;

                        //   case null:
                        //     eew_alertFlg = "{Null}"
                        //     break;

                        //   default:
                        //     eew_alertFlg = "{Unknown}"
                        //     break;
                        // }

                        eew_alertFlg = '';

                        eew_isCansel = eew_data["hypoInfo"]["items"][0]['isCancel'];

                        // --- debug
                        // eew_isCansel = 'true';
                        // ---

                        if (eew_isCansel == 'true') {
                            eew_alertFlg = '取消報';
                        }

                        if (eew_isCansel == 'true') {
                            if (settings_playSound_eew_cancel == true) {
                                // 取消報 受信時
                                eew_Cancel_voice.play();
                            }
                        } else {
                            if (settings_playSound_eew_any == true && eew_calcintensity_last != eew_calcintensity) {
                                switch (eew_calcintensity) {
                                    case '1':
                                        eew_sound.play();
                                        eew_1_voice.play();
                                        break;

                                    case '2':
                                        eew_sound.play();
                                        eew_2_voice.play();
                                        break;

                                    case '3':
                                        eew_sound.play();
                                        eew_3_voice.play();
                                        break;

                                    case '4':
                                        eew_sound.play();
                                        eew_4_voice.play();
                                        break;

                                    case '5-':
                                        eew_sound.play();
                                        eew_5_voice.play();
                                        break;

                                    case '5+':
                                        eew_sound.play();
                                        eew_6_voice.play();
                                        break;

                                    case '6-':
                                        eew_sound.play();
                                        eew_7_voice.play();
                                        break;

                                    case '6+':
                                        eew_sound.play();
                                        eew_8_voice.play();
                                        break;

                                    case '7':
                                        eew_sound.play();
                                        eew_9_voice.play();
                                        break;

                                    default:
                                        eew_sound.play();
                                        break;
                                }
                            }
                        }

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

                        if (eew_isCansel == 'true') {
                            eew_bgc = "#7f7fc0";
                            eew_fntc = "#010101";
                        }

                        $('#eewTitle').text(`緊急地震速報 ${eew_alertFlg}(${eew_repNum_p})`);
                        $('#eewCalc').text(eew_calcintensity);
                        $('#eewRegion').text(eew_Region_name);
                        $('#eewOrigin_time').text(`発生日時: ${eew_timeYear}/${eew_timeMonth}/${eew_timeDay} ${eew_timeHour}:${eew_timeMinute}`);
                        $('#eewMagnitude').text(`規模 ${eew_Magnitude}`);
                        $('#eewDepth').text(`深さ ${eew_depth}`);
                        $('#eewText').text('');

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

                    $('#eewField').css({
                        'background-color': eew_bgc,
                        'color': eew_fntc
                    })
                }

                $('#statusLamp').css({ 'background-color': '#40ff40' });
            }
        })

        .catch(error => {
            if (eewGetType === 'yahoo-kmoni' || dmdata_access_token === null) {
                addDebugLogs("ERROR", "[NETWORK]", `${error}; ${result}`)

                if (error != 'TypeError: Failed to fetch') {
                    $('#statusLamp').css({ 'background-color': '#ff4040' });
                }
            }
        })
};


function makeDate_yahooeew() {
    let yahooeewDate = new Date(gmt);
    let second = yahooeewDate.getSeconds();
    yahooeewDate.setSeconds(second - 2);
    yahooeewDate = `${yahooeewDate.getFullYear()}${('0' + (yahooeewDate.getMonth() + 1)).slice(-2)}${('0' + yahooeewDate.getDate()).slice(-2)}/${yahooeewDate.getFullYear()}${('0' + (yahooeewDate.getMonth() + 1)).slice(-2)}${('0' + yahooeewDate.getDate()).slice(-2)}${('0' + yahooeewDate.getHours()).slice(-2)}${('0' + yahooeewDate.getMinutes()).slice(-2)}${('0' + yahooeewDate.getSeconds()).slice(-2)}`;
    return yahooeewDate;
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
                    addDebugLogs("NETWORK", `[NETWORK]`, "Successfully connected to dmdata.jp and WebSocket opened.");
                    $('#eewTitle').text("緊急地震速報は発表されていません");
                    $('#statusLamp').css({ 'background-color': '#4040ff' });
                });

                dmdataSocket.addEventListener('close', (event) => {
                    addDebugLogs("NETWORK", `[NETWORK]`, "Successfully disconnected from dmdata.jp and WebSocket closed.");
                    eewGetType = "yahoo-kmoni";
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
                    addDebugLogs("ERROR", `[NETWORK]`, `Failed to connect to dmdata.jp.: ${event}`);

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

                    eewGetType = "yahoo-kmoni";
                });
            } else {
                if (document.getElementById('win_dmdata_oauth_error') === null) {
                    addDebugLogs("ERROR", `[NETWORK]`, `Failed to connect to dmdata.jp.: ${data.error.message}`);

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

                    eewGetType = "yahoo-kmoni"
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
    if (eew_isCansel) {
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
        // 1
        eew_waves = eew_data['psWave']['items'][0];

        if (eew_waves !== null) {
            mapItem[0].eew_lat = eew_waves['latitude'].replace("N", "");
            mapItem[0].eew_lng = eew_waves['longitude'].replace("E", "");
            eew_hypo_LatLng = new L.LatLng(mapItem[0].eew_lat, mapItem[0].eew_lng);

            eew_wave_p = eew_waves['pRadius'];
            eew_wave_s = eew_waves['sRadius'];
            eew_wave_p *= 1000;
            eew_wave_s *= 1000;
        }

        if (eew_wave_s != mapItem[0].eew_wave_s_last) {
            mapItem[0].eew_wave_s_Interval = (eew_wave_s - mapItem[0].eew_wave_s_last) / (60 * ((dateNow - loopCnt_moni) / 1000));
            mapItem[0].eew_wave_s_last = eew_wave_s;
            mapItem[0].eew_wave_s_put = eew_wave_s;
        } else if (eew_wave_s == mapItem[0].eew_wave_s_last) {
            mapItem[0].eew_wave_s_put += mapItem[0].eew_wave_s_Interval;
        }

        if (eew_wave_p != mapItem[0].eew_wave_p_last) {
            mapItem[0].eew_wave_p_Interval = (eew_wave_p - mapItem[0].eew_wave_p_last) / (60 * ((dateNow - loopCnt_moni) / 1000));
            mapItem[0].eew_wave_p_last = eew_wave_p;
            mapItem[0].eew_wave_p_put = eew_wave_p;
            loopCnt_moni = dateNow;
        } else if (eew_wave_p == mapItem[0].eew_wave_p_last) {
            mapItem[0].eew_wave_p_put += mapItem[0].eew_wave_p_Interval;
        }

        if (settings_map_auto_move) {
            if (dateNow - cnt_mapMove >= 1000 * 3) {
                if (mapItem[0].eew_wave_p_put >= 560000) {
                    map.setZoom(5);
                } else if (mapItem[0].eew_wave_p_put >= 280000) {
                    map.setZoom(6);
                } else if (mapItem[0].eew_wave_p_put > 0) {
                    map.setZoom(7);
                }
                map.setView([mapItem[0].eew_lat, mapItem[0].eew_lng]);

                cnt_mapMove = dateNow
            }
        }

        // 2
        if (eew_data['psWave']['items'][1] !== undefined) {
            eew_waves = eew_data['psWave']['items'][1];

            mapItem[1].eew_lat = eew_waves['latitude'].replace("N", "");
            mapItem[1].eew_lng = eew_waves['longitude'].replace("E", "");
            eew_hypo_LatLng = new L.LatLng(mapItem[1].eew_lat, mapItem[1].eew_lng);

            eew_wave_p = eew_waves['pRadius'];
            eew_wave_s = eew_waves['sRadius'];
            eew_wave_p *= 1000;
            eew_wave_s *= 1000;

            //
            if (eew_wave_s != mapItem[1].eew_wave_s_last) {
                mapItem[1].eew_wave_s_Interval = (eew_wave_s - mapItem[1].eew_wave_s_last) / (60 * ((dateNow - loopCnt_moni) / 1000));
                mapItem[1].eew_wave_s_last = eew_wave_s;
                mapItem[1].eew_wave_s_put = eew_wave_s;
            } else if (eew_wave_s == mapItem[1].eew_wave_s_last) {
                mapItem[1].eew_wave_s_put += mapItem[1].eew_wave_s_Interval;
            }
    
            if (eew_wave_p != mapItem[1].eew_wave_p_last) {
                mapItem[1].eew_wave_p_Interval = (eew_wave_p - mapItem[1].eew_wave_p_last) / (60 * ((dateNow - loopCnt_moni) / 1000));
                mapItem[1].eew_wave_p_last = eew_wave_p;
                mapItem[1].eew_wave_p_put = eew_wave_p;
                loopCnt_moni = dateNow;
            } else if (eew_wave_p == mapItem[1].eew_wave_p_last) {
                mapItem[1].eew_wave_p_put += mapItem[1].eew_wave_p_Interval;
            }
    
            if (settings_map_auto_move) {
                if (dateNow - cnt_mapMove >= 1000 * 3) {
                    if (mapItem[1].eew_wave_p_put >= 560000) {
                        map.setZoom(5);
                    } else if (mapItem[1].eew_wave_p_put >= 280000) {
                        map.setZoom(6);
                    } else if (mapItem[1].eew_wave_p_put > 0) {
                        map.setZoom(7);
                    }
                    map.setView([mapItem[1].eew_lat, mapItem[1].eew_lng]);
    
                    cnt_mapMove = dateNow
                }
            }
        }
        
        mapItem[0].hypo.setLatLng(new L.LatLng(mapItem[0].eew_lat, mapItem[0].eew_lng));
        mapItem[0].wave_s.setLatLng(new L.LatLng(mapItem[0].eew_lat, mapItem[0].eew_lng));
        mapItem[0].wave_s.setRadius(mapItem[0].eew_wave_s_put);
        mapItem[0].wave_p.setLatLng(new L.LatLng(mapItem[0].eew_lat, mapItem[0].eew_lng));
        mapItem[0].wave_p.setRadius(mapItem[0].eew_wave_p_put);
        
        mapItem[1].hypo.setLatLng(new L.LatLng(mapItem[1].eew_lat, mapItem[1].eew_lng));
        mapItem[1].wave_s.setLatLng(new L.LatLng(mapItem[1].eew_lat, mapItem[1].eew_lng));
        mapItem[1].wave_s.setRadius(mapItem[1].eew_wave_s_put);
        mapItem[1].wave_p.setLatLng(new L.LatLng(mapItem[1].eew_lat, mapItem[1].eew_lng));
        mapItem[1].wave_p.setRadius(mapItem[1].eew_wave_p_put);

    } else {
        mapItem[0].hypo.setLatLng(new L.LatLng(0, 0));
        mapItem[0].wave_s.setLatLng(new L.LatLng(0, 0));
        mapItem[0].wave_p.setLatLng(new L.LatLng(0, 0));
        mapItem[0].wave_s.setRadius(0);
        mapItem[0].wave_p.setRadius(0);
        mapItem[1].hypo.setLatLng(new L.LatLng(0, 0));
        mapItem[1].wave_s.setLatLng(new L.LatLng(0, 0));
        mapItem[1].wave_p.setLatLng(new L.LatLng(0, 0));
        mapItem[1].wave_s.setRadius(0);
        mapItem[1].wave_p.setRadius(0);

        mapItem[0].eew_origin_time = null;
        mapItem[1].eew_origin_time = null;
    }
}


// ---------- Init monitor map ---------- //
function initMap() {
    map = L.map('map', {
        // center: [36.1852, 139.3442],
        // center: [35.4232, 138.2647],
        center: [38.0194092, 138.3664968],
        zoom: 6,
        maxZoom: 10,
        minZoom: 4,
        // preferCanvas: true,
        zoomControl: false
        // gestureHandling: true
    });

    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        apikey: 'c168fc2f-2f64-4f13-874c-ce2dcec92819',
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(map);

    mapItem[0] = new MapItem();
    mapItem[1] = new MapItem();

    // loopCnt_loopWaves = new Date();
}

// ---------- Map Items ---------- //
class MapItem {
    constructor() {
        this.isCurrent = false;
        this.eew_origin_time = null;

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
            fillColor: '#ff4020',
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


// ---------- Get p2p ---------- //
function getInfo() {
    const url_p2p = "https://api.p2pquake.net/v2/history?codes=551&limit=40";

    fetch(url_p2p)
        .then(response => response.json())
        .then(data => {
            p2p_data = data;
            p2p_id = p2p_data[0]['id'];
        });
}


// ---------- Eqinfo ---------- //
function eqinfo() {
    if (p2p_id != p2p_id_last) {
        if (p2p_id_last == -1) {
            for (let i = 0; i < 40; i++) {
                p2p_type = p2p_data[i]['issue']['type'];

                p2p_types = {
                    'ScalePrompt': '震度速報',
                    'Destination': '震源情報',
                    'ScaleAndDestination': '震源・震度情報',
                    'DetailScale': '各地の震度情報',
                    'Foreign': '遠地地震情報',
                    'Other': '地震情報'
                };

                p2p_type_put = p2p_types[p2p_type];

                if (p2p_type == 'DetailScale') {
                    p2p_latest_time = p2p_data[i]['earthquake']['time'];
                    p2p_latest_timeYear = p2p_latest_time.substring(0, 4);
                    p2p_latest_timeMonth = p2p_latest_time.substring(5, 7);
                    p2p_latest_timeDay = p2p_latest_time.substring(8, 10);
                    p2p_latest_timeHour = p2p_latest_time.substring(11, 13);
                    p2p_latest_timeMinute = p2p_latest_time.substring(14, 16);

                    p2p_hypocenter = p2p_data[i]['earthquake']['hypocenter']['name'];

                    if (p2p_hypocenter == '') { p2p_hypocenter = '調査中'; }

                    p2p_maxScale = p2p_data[i]['earthquake']['maxScale'];

                    switch (p2p_maxScale) {
                        case -1: p2p_maxScale = '-'; break;
                        case 10: p2p_maxScale = '1'; break;
                        case 20: p2p_maxScale = '2'; break;
                        case 30: p2p_maxScale = '3'; break;
                        case 40: p2p_maxScale = '4'; break;
                        case 45: p2p_maxScale = '5-'; break;
                        case 50: p2p_maxScale = '5+'; break;
                        case 55: p2p_maxScale = '6-'; break;
                        case 60: p2p_maxScale = '6+'; break;
                        case 70: p2p_maxScale = '7'; break;

                        default:
                            p2p_maxScale = `?`;
                            break;
                    }

                    p2p_magnitude = p2p_data[i]['earthquake']['hypocenter']['magnitude'];

                    if (p2p_magnitude == -1) {
                        p2p_magnitude = '-';
                    } else {
                        p2p_magnitude = 'M' + String(p2p_magnitude);
                    }

                    p2p_depth = p2p_data[i]['earthquake']['hypocenter']['depth'];

                    if (p2p_depth == -1) {
                        p2p_depth = '-';
                    } else if (p2p_depth == 0) {
                        p2p_depth = 'ごく浅い';
                    } else {
                        p2p_depth = '約' + String(p2p_depth) + 'km';
                    }

                    p2p_tsunami = p2p_data[i]['earthquake']['domesticTsunami'];

                    tsunamiLevels = {
                        'None': '津波の心配なし',
                        'Unknown': '津波の影響は不明',
                        'Checking': '津波の影響を現在調査中',
                        'NonEffective': '若干の海面変動が予想されるが、被害の心配はなし',
                        'Watch': '津波注意報が発表',
                        'Warning': '津波警報等（大津波警報・津波警報あるいは津波注意報）が発表'
                    };

                    p2p_tsunami = tsunamiLevels[p2p_tsunami];

                    let p2p_his_bgc;
                    let p2p_his_fntc;

                    switch (p2p_maxScale) {
                        case '1':
                            p2p_his_bgc = "#808080";
                            p2p_his_fntc = "#ffffff";
                            break;
                        case '2':
                            p2p_his_bgc = "#4040c0";
                            p2p_his_fntc = "#ffffff";
                            break;
                        case '3':
                            p2p_his_bgc = "#40c040";
                            p2p_his_fntc = "#ffffff";
                            break;
                        case '4':
                            p2p_his_bgc = "#c0c040";
                            p2p_his_fntc = "#ffffff";
                            break;
                        case '5-':
                            p2p_his_bgc = "#c0a040";
                            p2p_his_fntc = "#ffffff";
                            break;
                        case '5+':
                            p2p_his_bgc = "#c08040";
                            p2p_his_fntc = "#ffffff";
                            break;
                        case '6-':
                            p2p_his_bgc = "#c04040";
                            p2p_his_fntc = "#ffffff";
                            break;
                        case '6+':
                            p2p_his_bgc = "#a04040";
                            p2p_his_fntc = "#ffffff";
                            break;
                        case '7':
                            p2p_his_bgc = "#804080";
                            p2p_his_fntc = "#ffffff";
                            break;

                        default:
                            p2p_his_bgc = "#8080c0";
                            p2p_his_fntc = "#ffffff";
                            break;
                    }

                    if (p2p_id_last == -1) {
                        $('#eewTitle').text(`${p2p_type_put}`);
                        $('#eewCalc').text(p2p_maxScale);
                        $('#eewRegion').text(p2p_hypocenter);
                        $('#eewOrigin_time').text(`発生日時: ${p2p_latest_timeYear}/${p2p_latest_timeMonth}/${p2p_latest_timeDay} ${p2p_latest_timeHour}:${p2p_latest_timeMinute}`);
                        $('#eewMagnitude').text(`規模 ${p2p_magnitude}`);
                        $('#eewDepth').text(`深さ ${p2p_depth}`);
                        $('#eewText').text(`${p2p_tsunami}`);

                        $(`#eewCalc`).css({
                            'background-color': p2p_his_bgc,
                            'color': p2p_his_fntc
                        })
                    }


                    if (p2p_his_cnt != 0) {
                        $('#eqHistoryField').append(`
                            <li class="list list-${i}">
                                <div class="maxScale">
                                    <p>${p2p_maxScale}</p>
                                </div>

                                <div class="right">
                                    <p class="hypocenter">${p2p_hypocenter}</p>
                                    <p>${p2p_latest_timeYear}/${p2p_latest_timeMonth}/${p2p_latest_timeDay} ${p2p_latest_timeHour}:${p2p_latest_timeMinute}</p>
                                    <div class="hypoInfo">
                                        <p>${p2p_depth}</p>
                                        <p>${p2p_magnitude}</p>
                                    </div>
                                    <p>${p2p_tsunami}</p>
                                </div>
                            </li>
                        `)

                        $(`#eqHistoryField>.list-${i}>.maxScale`).css({
                            'background-color': p2p_his_bgc,
                            'color': p2p_his_fntc
                        })
                    }

                    p2p_his_cnt++;
                }

                p2p_id_last = p2p_id;

                if (p2p_his_cnt >= 20) { break }
            }
        } else {
            for (let i = 0; i < 2; i++) {
                p2p_type = p2p_data[i]['issue']['type'];

                p2p_types = {
                    'ScalePrompt': '震度速報',
                    'Destination': '震源情報',
                    'ScaleAndDestination': '震源・震度情報',
                    'DetailScale': '各地の震度情報',
                    'Foreign': '遠地地震情報',
                    'Other': '地震情報'
                };

                p2p_type_put = p2p_types[p2p_type];

                p2p_latest_time = p2p_data[i]['earthquake']['time'];
                p2p_latest_timeYear = p2p_latest_time.substring(0, 4);
                p2p_latest_timeMonth = p2p_latest_time.substring(5, 7);
                p2p_latest_timeDay = p2p_latest_time.substring(8, 10);
                p2p_latest_timeHour = p2p_latest_time.substring(11, 13);
                p2p_latest_timeMinute = p2p_latest_time.substring(14, 16);

                p2p_hypocenter = p2p_data[i]['earthquake']['hypocenter']['name'];

                if (p2p_hypocenter == '') { p2p_hypocenter = '調査中'; }

                p2p_maxScale = p2p_data[i]['earthquake']['maxScale'];

                if (i == 0) {
                    if (settings_playSound_eqinfo == true && p2p_id_last != -1) {
                        if (p2p_type == 'DetailScale' || p2p_type == 'ScalePrompt') {
                            switch (p2p_maxScale) {
                                case 10:
                                    p2p_sound.play();
                                    p2p_1_voice.play();
                                    break;

                                case 20:
                                    p2p_sound.play();
                                    p2p_2_voice.play();
                                    break;

                                case 30:
                                    p2p_sound.play();
                                    p2p_3_voice.play();
                                    break;

                                case 40:
                                    p2p_sound.play();
                                    p2p_4_voice.play();
                                    break;

                                case 45:
                                    p2p_sound.play();
                                    p2p_5_voice.play();
                                    break;

                                case 50:
                                    p2p_sound.play();
                                    p2p_6_voice.play();
                                    break;

                                case 55:
                                    p2p_sound.play();
                                    p2p_7_voice.play();
                                    break;

                                case 60:
                                    p2p_sound.play();
                                    p2p_8_voice.play();
                                    break;

                                case 70:
                                    p2p_sound.play();
                                    p2p_9_voice.play();
                                    break;

                                default:
                                    p2p_sound.play();
                                    break;
                            }
                        }
                    }
                }

                switch (p2p_maxScale) {
                    case -1: p2p_maxScale = '-'; break;
                    case 10: p2p_maxScale = '1'; break;
                    case 20: p2p_maxScale = '2'; break;
                    case 30: p2p_maxScale = '3'; break;
                    case 40: p2p_maxScale = '4'; break;
                    case 45: p2p_maxScale = '5-'; break;
                    case 50: p2p_maxScale = '5+'; break;
                    case 55: p2p_maxScale = '6-'; break;
                    case 60: p2p_maxScale = '6+'; break;
                    case 70: p2p_maxScale = '7'; break;

                    default:
                        p2p_maxScale = `?`;
                        break;
                }

                p2p_magnitude = p2p_data[i]['earthquake']['hypocenter']['magnitude'];

                if (p2p_magnitude == -1) {
                    p2p_magnitude = '-';
                } else {
                    p2p_magnitude = 'M' + String(p2p_magnitude);
                }

                p2p_depth = p2p_data[i]['earthquake']['hypocenter']['depth'];

                if (p2p_depth == -1) {
                    p2p_depth = '-';
                } else if (p2p_depth == 0) {
                    p2p_depth = 'ごく浅い';
                } else {
                    p2p_depth = '約' + String(p2p_depth) + 'km';
                }

                p2p_tsunami = p2p_data[i]['earthquake']['domesticTsunami'];

                tsunamiLevels = {
                    'None': '津波の心配なし',
                    'Unknown': '津波の影響は不明',
                    'Checking': '津波の影響を現在調査中',
                    'NonEffective': '若干の海面変動が予想されるが、被害の心配はなし',
                    'Watch': '津波注意報が発表',
                    'Warning': '津波警報等（大津波警報・津波警報あるいは津波注意報）が発表'
                };

                p2p_tsunami = tsunamiLevels[p2p_tsunami];

                let p2p_his_bgc;
                let p2p_his_fntc;

                switch (p2p_maxScale) {
                    case '1':
                        p2p_his_bgc = "#808080";
                        p2p_his_fntc = "#ffffff";
                        break;
                    case '2':
                        p2p_his_bgc = "#4040c0";
                        p2p_his_fntc = "#ffffff";
                        break;
                    case '3':
                        p2p_his_bgc = "#40c040";
                        p2p_his_fntc = "#ffffff";
                        break;
                    case '4':
                        p2p_his_bgc = "#c0c040";
                        p2p_his_fntc = "#ffffff";
                        break;
                    case '5-':
                        p2p_his_bgc = "#c0a040";
                        p2p_his_fntc = "#ffffff";
                        break;
                    case '5+':
                        p2p_his_bgc = "#c08040";
                        p2p_his_fntc = "#ffffff";
                        break;
                    case '6-':
                        p2p_his_bgc = "#c04040";
                        p2p_his_fntc = "#ffffff";
                        break;
                    case '6+':
                        p2p_his_bgc = "#a04040";
                        p2p_his_fntc = "#ffffff";
                        break;
                    case '7':
                        p2p_his_bgc = "#804080";
                        p2p_his_fntc = "#ffffff";
                        break;

                    default:
                        p2p_his_bgc = "#8080c0";
                        p2p_his_fntc = "#ffffff";
                        break;
                }

                if (i == 0) {
                    $('#eewTitle').text(`${p2p_type_put}`);
                    $('#eewCalc').text(p2p_maxScale);
                    $('#eewRegion').text(p2p_hypocenter);
                    $('#eewOrigin_time').text(`発生日時: ${p2p_latest_timeYear}/${p2p_latest_timeMonth}/${p2p_latest_timeDay} ${p2p_latest_timeHour}:${p2p_latest_timeMinute}`);
                    $('#eewMagnitude').text(`規模 ${p2p_magnitude}`);
                    $('#eewDepth').text(`深さ ${p2p_depth}`);
                    $('#eewText').text(`${p2p_tsunami}`);

                    $(`#eewCalc`).css({
                        'background-color': p2p_his_bgc,
                        'color': p2p_his_fntc
                    })

                    eqinfo_pushNotify();
                }

                if (i == 1) {
                    if (p2p_type == 'DetailScale') {
                        $('#eqHistoryField').prepend(`
                            <li class="list list-${p2p_his_cnt}">
                                <div class="maxScale">
                                    <p>${p2p_maxScale}</p>
                                </div>

                                <div class="right">
                                    <p class="hypocenter">${p2p_hypocenter}</p>
                                    <p>${p2p_latest_timeYear}/${p2p_latest_timeMonth}/${p2p_latest_timeDay} ${p2p_latest_timeHour}:${p2p_latest_timeMinute}</p>
                                    <div class="hypoInfo">
                                        <p>${p2p_depth}</p>
                                        <p>${p2p_magnitude}</p>
                                    </div>
                                    <p>${p2p_tsunami}</p>
                                </div>
                            </li>
                        `)

                        $(`#eqHistoryField>.list-${p2p_his_cnt}>.maxScale`).css({
                            'background-color': p2p_his_bgc,
                            'color': p2p_his_fntc
                        })

                        p2p_his_cnt++;
                    }
                }
            }
        }
    }

    p2p_id_last = p2p_id;
}


// ---------- Eqinfo Push Notification ---------- //
function eqinfo_pushNotify() {
    Push.create(p2p_type_put, {
        body: `${p2p_hypocenter}を震源とする、最大震度${p2p_maxScale}の地震がありました。\n規模は${p2p_magnitude}、深さは${p2p_depth}と推定されます。\n${p2p_tsunami}\nページ表示するにはここを選択してください。\n`,
        onClick: function () {
            window.focus();
            this.close();
        }
    })
}
