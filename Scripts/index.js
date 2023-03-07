//
// index.js | YDITS for Web
//
// (c) 2022-2023 よね/Yone
//
// No modification or reproduction of any kind is permitted.
// 改変や複製を一切禁じます。
//

let scene = 0;
let gmt;
let DT;
let cnt_getNTP = -1;

let settings_darkMode;
let settings_playSound_eew_any;
let settings_playSound_eew_cancel;
let settings_playSound_eqinfo;

let cnt_eew = -1;
let EEW_flg = false;
let EEW_data_nakn = null;
let EEW_repDT = null;
let EEW_origin_time = null;
let EEW_intensity = null;
let EEW_hypocenter = "";
let EEW_originTimeYear = -1;
let EEW_originTimeMonth = -1;
let EEW_originTimeDay = -1;
let EEW_originTimeHour = -1;
let EEW_originTimeMinute = -1;
let EEW_originTimeSecond = -1;

let EEW_data = null;
let EEW_time = 1;
let EEW_repNum = '';
let EEW_repNum_last = '';
let EEW_alertFlg = '';
let EEW_timeYear = '';
let EEW_timeMonth = '';
let EEW_timeDay = '';
let EEW_timeHour = '';
let EEW_timeMinute = '';
let EEW_repNum_p = '';
let EEW_calcintensity = '';
let EEW_Region_name = '';
let EEW_Magnitude = '';
let EEW_depth = '';
let EEW_isCansel = null;
let EEW_isTraining = null;
let EEW_bgc;
let EEW_fntc;

let p2p_data;
let p2p_time = -1;
let p2p_time_temp = -1;
let cnt_p2p = -1;
let p2p_id = -1;
let p2p_id_last = -1;

let timeYear;
let timeMonth;
let timeDay;
let timeHour;
let timeMinute;
let timeSecond;

let p2p_his_id_last = -1;
let p2p_his_cnt = 0;
let loopCnt_history = -1;

let map;
let cnt_mapMove = -1;
let hypo = null;
let wave_s = null;
let wave_p = null;
let loopCnt_moni = -1;
let EEW_waves = null;
let EEW_wave_p = -1;
let EEW_wave_p_last = -1;
let EEW_wave_p_Interval = -1;
let EEW_wave_p_put = -1;
let EEW_wave_s = -1;
let EEW_wave_s_last = -1;
let EEW_wave_s_Interval = -1;
let EEW_wave_s_put = -1;
let EEW_lat = '';
let EEW_lng = '';
let EEW_hypo_LatLng = null;
let loopCnt_loopWaves = -1;
let isFullscreen_map = false;

let EEW_sound
let p2p_sound
let EEW_1_voice
let EEW_2_voice
let EEW_3_voice
let EEW_4_voice
let EEW_5_voice
let EEW_6_voice
let EEW_7_voice
let EEW_8_voice
let EEW_9_voice
let EEW_Cancel_voice
let p2p_1_voice
let p2p_2_voice
let p2p_3_voice
let p2p_4_voice
let p2p_5_voice
let p2p_6_voice
let p2p_7_voice
let p2p_8_voice
let p2p_9_voice


document.addEventListener('DOMContentLoaded', () => {
    init();
    mainloop();
})


// -------------------- Functions -------------------- //
// ---------- Mainloop ---------- //
function mainloop() {
    dateNow = new Date();

    if (dateNow - cnt_getNTP >= 1000) {
        cnt_getNTP = dateNow;
        getNtp();
    }

    if (dateNow - cnt_eew >= 1000 * EEW_time) {
        cnt_eew = dateNow;
        eew();
    }

    if (dateNow - cnt_p2p >= 1000 * p2p_time) {
        cnt_p2p = dateNow;
        getInfo();
        eqinfo();
    }

    mapMain();

    requestAnimationFrame(mainloop);
}


// ---------- Page ---------- //
function init() {
    initMenu();
    init_sounds();
    init_push();
    settings_init();
    licence_init();
    select_init();
    init_map();
}


// ------------- Get NTP datetime ---------- //
function getNtp() {
    axios.head(window.location.href, {
        headers: {
            'Cache-Control': 'no-cache'
        }
    }).then(res => {
        gmt = new Date(res.headers.date); // Server datetime

        timeYear = gmt.getFullYear();
        timeMonth = gmt.getMonth() + 1;
        timeDay = gmt.getDate();
        timeHour = gmt.getHours();
        timeMinute = gmt.getMinutes();
        timeSecond = gmt.getSeconds();
    })
}


// ---------- sounds ---------- //
function init_sounds() {
    EEW_sound = new Audio("https://webapp.ydits.net/Sounds/eew.wav");
    p2p_sound = new Audio("https://webapp.ydits.net/Sounds/info.wav");
    EEW_1_voice = new Audio("https://webapp.ydits.net/Sounds/eew_1_v.mp3");
    EEW_2_voice = new Audio("https://webapp.ydits.net/Sounds/eew_2_v.mp3");
    EEW_3_voice = new Audio("https://webapp.ydits.net/Sounds/eew_3_v.mp3");
    EEW_4_voice = new Audio("https://webapp.ydits.net/Sounds/eew_4_v.mp3");
    EEW_5_voice = new Audio("https://webapp.ydits.net/Sounds/eew_5_v.mp3");
    EEW_6_voice = new Audio("https://webapp.ydits.net/Sounds/eew_6_v.mp3");
    EEW_7_voice = new Audio("https://webapp.ydits.net/Sounds/eew_7_v.mp3");
    EEW_8_voice = new Audio("https://webapp.ydits.net/Sounds/eew_8_v.mp3");
    EEW_9_voice = new Audio("https://webapp.ydits.net/Sounds/eew_9_v.mp3");
    EEW_Cancel_voice = new Audio("https://webapp.ydits.net/Sounds/eew_cancel_v.mp3");
    p2p_1_voice = new Audio("https://webapp.ydits.net/Sounds/info_1_v.mp3");
    p2p_2_voice = new Audio("https://webapp.ydits.net/Sounds/info_2_v.mp3");
    p2p_3_voice = new Audio("https://webapp.ydits.net/Sounds/info_3_v.mp3");
    p2p_4_voice = new Audio("https://webapp.ydits.net/Sounds/info_4_v.mp3");
    p2p_5_voice = new Audio("https://webapp.ydits.net/Sounds/info_5_v.mp3");
    p2p_6_voice = new Audio("https://webapp.ydits.net/Sounds/info_6_v.mp3");
    p2p_7_voice = new Audio("https://webapp.ydits.net/Sounds/info_7_v.mp3");
    p2p_8_voice = new Audio("https://webapp.ydits.net/Sounds/info_8_v.mp3");
    p2p_9_voice = new Audio("https://webapp.ydits.net/Sounds/info_9_v.mp3");
}


// ---------- Push ---------- //
function init_push() {
    if (!Push.Permission.has()) {
        Push.Permission.request(
            // OK
            () => { },

            // NG
            () => { }
        )
    }
}


// ---------- Menu ---------- //
function initMenu() {
    $(document).on('click', '#menuBtn', () => {
        $('#popup').addClass('active');
        $('#menu').addClass('active');
    });
    $(document).on('click', '#menu .closeBtn', () => {
        $('#popup').removeClass('active');
        $('#menu').removeClass('active');
    });

    $(document).on('click', '#menuSettings', () => {
        $('#settings').addClass('active');
        $('#menu').removeClass('active')
    });

    $(document).on('click', '#menuLicense', () => {
        $('#license').addClass('active');
        $('#menu').removeClass('active')
    });
}

// ---------- Settings ---------- //
function settings_init() {
    $('#settings .version').text(`Ver ${version}`);

    $(document).on('click', '#settings .closeBtn', function () {
        $('#settings').removeClass('active');
        $('#menu').addClass('active')
    });

    // --- Play sound
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

    // --- EEW get cnt
    if (localStorage.getItem("settings-getCnt_eew") != null) {
        EEW_time = Number(localStorage.getItem("settings-getCnt_eew"));
    } else {
        EEW_time = 1;
    }

    $('#settings_getCnt_eew_bar').val(EEW_time);
    $('#settings_getCnt_eew_put').text(EEW_time);

    $(document).on('input', '#settings_getCnt_eew_bar', function () {
        EEW_time = $('#settings_getCnt_eew_bar').val();
        localStorage.setItem('settings-getCnt_eew', String(EEW_time));
        $('#settings_getCnt_eew_put').text(EEW_time);
    });

    // --- P2P get cnt
    if (localStorage.getItem("settings-getCnt_p2p") != null) {
        p2p_time = Number(localStorage.getItem("settings-getCnt_p2p"));
    } else {
        p2p_time = 8;
    }

    $('#settings_getCnt_eqinfo_bar').val(p2p_time);
    $('#settings_getCnt_eqinfo_put').text(p2p_time);

    $(document).on('input', '#settings_getCnt_eqinfo_bar', function () {
        p2p_time = $('#settings_getCnt_eqinfo_bar').val();
        localStorage.setItem('settings-getCnt_p2p', String(p2p_time));
        $('#settings_getCnt_eqinfo_put').text(p2p_time);
    });

    // --- resetsettings
    $(document).on('click', '#settings_resetSettingsBtn', function () {
        EEW_time = 1;
        $('#settings_getCnt_eew_bar').val(EEW_time);
        $('#settings_getCnt_eew_put').text(EEW_time);

        p2p_time = 8;
        $('#settings_getCnt_eqinfo_bar').val(p2p_time);
        $('#settings_getCnt_eqinfo_bar').text(p2p_time);

        settings_playSound_eew_any = true;
        $('#settings_playSound_eew_any .toggle-switch').addClass('on');

        settings_playSound_eew_cancel = true;
        $('#settings_playSound_eew_cancel .toggle-switch').addClass('on');

        settings_playSound_eqinfo = true;
        $('#settings_playSound_eqinfo .toggle-switch').addClass('on');

        localStorage.clear()

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
                'right': '3em',
                'bottom': '3em',
                'width': '10em'
            })

            $(document).on('click', '#win_settings_reset .content .btn_ok', function () {
                $('#win_settings_reset').remove()
            })
        }
    });

    $(document).on('click', '#btn_eew_chk_sound', function () {
        EEW_sound.play();
        EEW_7_voice.play();
    });
    $(document).on('click', '#btn_earthquake_info_chk_sound', function () {
        p2p_sound.play();
        p2p_7_voice.play();
    });
    $(document).on('click', '#btn_eew_cancel_chk_sound', function () {
        EEW_Cancel_voice.play();
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
};

// ---------- select ---------- //
function select_init() {
    $('#earthquake').addClass('active');

    $(document).on('click', '#nav>ul>.home', function () {
        reset_show();
        if (pageLang === 'en-US') {
            window.location.href = "en-US/#pageTop";
        } else {
            window.location.href = "#pageTop";
        }
        $('#earthquake').addClass('active');
    })
    $(document).on('click', '#nav>ul>.monitor', function () {
        reset_show();
        if (pageLang === 'en-US') {
            window.location.href = "en-US/#pageTop";
        } else {
            window.location.href = "#pageTop";
        }
        $('#monitor').addClass('active');
        init_map();
    })
    $(document).on('click', '#nav>ul>.menu', function () {
        reset_show();
        if (pageLang === 'en-US') {
            window.location.href = "en-US/#pageTop";
        } else {
            window.location.href = "#pageTop";
        }
        $('#menu').addClass('active');
    })

    $('#eew').addClass('active');

    $(document).on('click', '#btn_eew', function () {
        reset_show_eq();
        $('#eew').addClass('active');
    })
    $(document).on('click', '#btn_info', function () {
        reset_show_eq();
        $('#earthquake_info').addClass('active');
    })
    $(document).on('click', '#btn_history', function () {
        reset_show_eq();
        $('#earthquake_history').addClass('active');
    })
}

function reset_show() {
    $('#main>.content').removeClass('active');
}

function reset_show_eq() {
    $('#earthquake>.content').removeClass('active');
}


// ---------- Info ---------- //
function licence_init() {
    $(document).on('click', '#license>.closeBtn', function () {
        $('#license').removeClass('active');
        $('#menu').addClass('active')
    })
}


// ---------- EEW ---------- //
function eew() {
    yahooEewDate = makeDate_yahooEew();
    const yahooEewUrl = `https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/${yahooEewDate}.json`;

    // --- debug
    // const yahooEewUrl = `https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/20210213/20210213230859.json`;  //2021-2-13-23:08 Fukushima
    // const yahooEewUrl = "https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/20220529/20220529155631.json";  //2022-5-29-15:55 Ibaraki
    // const yahooEewUrl = `https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/19700101/19700101000000.json`;  //1970-1-1-00:00 HTTP 403
    // const yahooEewUrl = "https://www.lmoni.bosai.go.jp/monitor/webservice/hypo/eew/20220330001911.json";                 //2022-3-30-00:19 kmoni
    // ---

    fetch(yahooEewUrl)

        .then(response => {
            if (!response.ok) {
                $('#eewTitle').text(`取得できません Error: HTTP ${response.status}`);
            }

            return response.json()
        })

        .then(result => {
            EEW_data = result;

            if (EEW_data["hypoInfo"] != null) {
                EEW_repNum = EEW_data["hypoInfo"]["items"][0]["reportNum"];

                // --- debug
                // EEW_repNum = '1';  // First report
                // EEW_repNum_last = -2;  // Difficalt report
                // ---

                if (EEW_repNum != EEW_repNum_last) {
                    EEW_repNum_last = EEW_repNum;

                    // --- Final report --- //
                    EEW_isFinal = EEW_data["hypoInfo"]["items"][0]["isFinal"];

                    // --- debug
                    // EEW_isFinal = 'true'; 
                    // ---

                    if (EEW_isFinal == 'true') {
                        EEW_repNum_p = '最終報';
                    } else {
                        EEW_repNum_p = `第${EEW_repNum}報`
                    }

                    // --- Origin time --- //
                    EEW_origin_time = EEW_data["hypoInfo"]["items"][0]["originTime"];
                    // datetime
                    EEW_timeYear = EEW_origin_time.substring(0, 4);
                    EEW_timeMonth = EEW_origin_time.substring(5, 7);
                    EEW_timeDay = EEW_origin_time.substring(8, 10);
                    EEW_timeHour = EEW_origin_time.substring(11, 13);
                    EEW_timeMinute = EEW_origin_time.substring(14, 16);
                    EEW_timeSecond = EEW_origin_time.substring(17, 19);

                    // --- Region name --- //
                    EEW_Region_name = EEW_data["hypoInfo"]["items"][0]["regionName"];

                    // --- debug
                    // EEW_Region_name = '東京湾';
                    // ---

                    if (!EEW_Region_name) {
                        EEW_Region_name = '不明';
                    }

                    // --- Calcintensity --- //
                    EEW_calcintensity_last = EEW_calcintensity;

                    EEW_calcintensity = EEW_data["hypoInfo"]["items"][0]["calcintensity"];

                    // --- debug
                    // EEW_calcintensity = '5-';
                    // ---

                    switch (EEW_calcintensity) {
                        case '01': EEW_calcintensity = "1"; break;
                        case '02': EEW_calcintensity = "2"; break;
                        case '03': EEW_calcintensity = "3"; break;
                        case '04': EEW_calcintensity = "4"; break;
                        case '5-': EEW_calcintensity = "5-"; break;
                        case '5+': EEW_calcintensity = "5+"; break;
                        case '6-': EEW_calcintensity = "6-"; break;
                        case '6+': EEW_calcintensity = "6+"; break;
                        case '07': EEW_calcintensity = "7"; break;

                        default:
                            EEW_calcintensity = `?`;
                            break;
                    }

                    // --- Magnitude --- //
                    EEW_Magnitude = EEW_data["hypoInfo"]["items"][0]["magnitude"];

                    // --- debug
                    // EEW_Magnitude = '7.0';
                    // ---

                    if (EEW_Magnitude) {
                        EEW_Magnitude = 'M' + EEW_Magnitude;
                    } else {
                        EEW_Magnitude = '不明';
                    }

                    // --- Depth --- //
                    EEW_depth = EEW_data["hypoInfo"]["items"][0]["depth"];

                    // --- debug
                    // EEW_depth = '70km';
                    // ---

                    if (EEW_depth) {
                        EEW_depth = '約' + EEW_depth;
                    } else {
                        EEW_depth = '不明';
                    }

                    // --- alert flag --- //

                    // Yahoo 強震モニタのJSONデータに 予報・警報 のフラッグがないため 未実装

                    // EEW_alertFlg = EEW_data['alertflg'];

                    // switch (EEW_alertFlg) {
                    //   case 'true':
                    //     EEW_alertFlg = "警報"
                    //     break;

                    //   case 'false':
                    //     EEW_alertFlg = "予報"
                    //     break;

                    //   case null:
                    //     EEW_alertFlg = "{Null}"
                    //     break;

                    //   default:
                    //     EEW_alertFlg = "{Unknown}"
                    //     break;
                    // }

                    EEW_alertFlg = '';

                    // --- Is cansel --- //
                    EEW_isCansel = EEW_data["hypoInfo"]["items"][0]['isCancel'];

                    // --- debug
                    // EEW_isCansel = 'true';
                    // ---

                    if (EEW_isCansel == 'true') {
                        EEW_alertFlg = '取消報';
                    }

                    // Sound
                    if (EEW_isCansel == 'true') {
                        if (settings_playSound_eew_cancel == true) {
                            // 取消報 受信時
                            EEW_Cancel_voice.play();
                        }
                    } else {
                        if (settings_playSound_eew_any == true && EEW_calcintensity_last != EEW_calcintensity) {
                            switch (EEW_calcintensity) {
                                case '1':
                                    EEW_sound.play();
                                    EEW_1_voice.play();
                                    break;

                                case '2':
                                    EEW_sound.play();
                                    EEW_2_voice.play();
                                    break;

                                case '3':
                                    EEW_sound.play();
                                    EEW_3_voice.play();
                                    break;

                                case '4':
                                    EEW_sound.play();
                                    EEW_4_voice.play();
                                    break;

                                case '5-':
                                    EEW_sound.play();
                                    EEW_5_voice.play();
                                    break;

                                case '5+':
                                    EEW_sound.play();
                                    EEW_6_voice.play();
                                    break;

                                case '6-':
                                    EEW_sound.play();
                                    EEW_7_voice.play();
                                    break;

                                case '6+':
                                    EEW_sound.play();
                                    EEW_8_voice.play();
                                    break;

                                case '7':
                                    EEW_sound.play();
                                    EEW_9_voice.play();
                                    break;

                                default:
                                    EEW_sound.play();
                                    break;
                            }
                        }
                    }

                    // ----- put ----- //
                    let EEW_bgc;
                    let EEW_fntc;

                    switch (EEW_calcintensity) {
                        case '1':
                            EEW_bgc = "#c0c0c0";
                            EEW_fntc = "#010101";
                            break;
                        case '2':
                            EEW_bgc = "#2020c0";
                            EEW_fntc = "#ffffff";
                            break;
                        case '3':
                            EEW_bgc = "#20c020";
                            EEW_fntc = "#010101";
                            break;
                        case '4':
                            EEW_bgc = "#c0c020";
                            EEW_fntc = "#010101";
                            break;
                        case '5-':
                            EEW_bgc = "#c0a020";
                            EEW_fntc = "#010101";
                            break;
                        case '5+':
                            EEW_bgc = "#c07f20";
                            EEW_fntc = "#010101";
                            break;
                        case '6-':
                            EEW_bgc = "#e02020";
                            EEW_fntc = "#ffffff";
                            break;
                        case '6+':
                            EEW_bgc = "#a02020";
                            EEW_fntc = "#ffffff";
                            break;
                        case '7':
                            EEW_bgc = "#7f207f";
                            EEW_fntc = "#ffffff";
                            break;

                        default:
                            EEW_bgc = "#7f7fc0";
                            EEW_fntc = "#010101";
                            break;
                    }

                    if (EEW_isCansel == 'true') {
                        EEW_bgc = "#7f7fc0";
                        EEW_fntc = "#010101";
                    }

                    // reset_show();
                    // $('#earthquake').addClass('active');

                    // reset_show_eq();
                    // $('#eew').addClass('active');

                    $('#eewTitle').text(`緊急地震速報 ${EEW_alertFlg}(${EEW_repNum_p})`);
                    $('#eewCalc').text(EEW_calcintensity);
                    $('#eewRegion').text(EEW_Region_name);
                    $('#eewOrigin_time').text(`発生日時: ${EEW_timeYear}/${EEW_timeMonth}/${EEW_timeDay} ${EEW_timeHour}:${EEW_timeMinute}`);
                    $('#eewMagnitude').text(`規模 ${EEW_Magnitude}`);
                    $('#eewDepth').text(`深さ ${EEW_depth}`);

                    $('#eewField').css({
                        'background-color': EEW_bgc,
                        'color': EEW_fntc
                    })
                }
            } else {
                EEW_repNum = '';
                EEW_repNum_last = '';
                EEW_alertFlg = '';

                EEW_timeYear = '';
                EEW_timeMonth = '';
                EEW_timeDay = '';
                EEW_timeHour = '';
                EEW_timeMinute = '';

                EEW_calcintensity = '';
                EEW_Region_name = '';
                EEW_Magnitude = '';
                EEW_depth = '';

                if (settings_darkMode) {
                    EEW_bgc = "#103050";
                    EEW_fntc = "#eeeeee";
                } else {
                    EEW_bgc = "#e0e0e0";
                    EEW_fntc = "#010101";
                }

                $('#eewTitle').text("緊急地震速報は発表されていません");

                $('#eew .calcintensity_para').text('');
                $('#eew .region').text('');
                $('#eew .origin_time').text('');
                $('#eew .magnitude').text('');
                $('#eew .depth').text('');

                $('#eew').css({
                    'background-color': EEW_bgc,
                    'color': EEW_fntc
                })
            }
        })
};


function makeDate_yahooEew() {
    yahooEewDate = new Date();
    yahooEewDate.setSeconds(timeSecond - 2)
    yahooEewDate = `${yahooEewDate.getFullYear()}${('0' + (yahooEewDate.getMonth() + 1)).slice(-2)}${('0' + yahooEewDate.getDate()).slice(-2)}/${yahooEewDate.getFullYear()}${('0' + (yahooEewDate.getMonth() + 1)).slice(-2)}${('0' + yahooEewDate.getDate()).slice(-2)}${('0' + yahooEewDate.getHours()).slice(-2)}${('0' + yahooEewDate.getMinutes()).slice(-2)}${('0' + yahooEewDate.getSeconds()).slice(-2)}`
    return yahooEewDate
}


// EEW datetime format
function setEEW_DT(num) {
    let ret;

    if (num == 1) {
        ret = 60 - 1;
    } else if (num == 0) {
        ret = 60 - 2;
    } else {
        ret = num - 2;
    }

    return ret;
}


// ---------- EEW push ---------- //
function eew_push() {
    if (EEW_isCansel) {
        Push.create(`緊急地震速報 (${EEW_alertFlg})  ${EEW_repNum_p}`, {
            body: `先程の緊急地震速報は取り消されました。\nページ表示するにはここを選択してください。\n`,
            onClick: function () {
                window.focus();
                this.close();
            }
        })
    } else {
        Push.create(`緊急地震速報 (${EEW_alertFlg})  ${EEW_repNum_p}`, {
            body: `${EEW_hypocenter}で地震発生。予想最大震度は${EEW_intensity}です。\nページ表示するにはここを選択してください。\n`,
            onClick: function () {
                window.focus();
                this.close();
            }
        })
    }
}


// ---------- Monitor ---------- //
function mapMain() {
    if (EEW_data != null && EEW_data["hypoInfo"] != null) {
        EEW_waves = EEW_data['psWave']['items'][0];

        if (EEW_waves !== null) {
            EEW_lat = EEW_waves['latitude'].replace("N", "");
            EEW_lng = EEW_waves['longitude'].replace("E", "");
            EEW_hypo_LatLng = new L.LatLng(EEW_lat, EEW_lng);

            EEW_wave_p = EEW_waves['pRadius'];
            EEW_wave_s = EEW_waves['sRadius'];
            EEW_wave_p *= 1000;
            EEW_wave_s *= 1000;
        }

        if (EEW_wave_s != EEW_wave_s_last) {
            EEW_wave_s_Interval = (EEW_wave_s - EEW_wave_s_last) / (60 * ((dateNow - loopCnt_moni) / 1000));
            EEW_wave_s_last = EEW_wave_s;
            EEW_wave_s_put = EEW_wave_s;
        } else if (EEW_wave_s == EEW_wave_s_last) {
            EEW_wave_s_put += EEW_wave_s_Interval;
        }

        if (EEW_wave_p != EEW_wave_p_last) {
            EEW_wave_p_Interval = (EEW_wave_p - EEW_wave_p_last) / (60 * ((dateNow - loopCnt_moni) / 1000));
            EEW_wave_p_last = EEW_wave_p;
            EEW_wave_p_put = EEW_wave_p;
            loopCnt_moni = dateNow;
        } else if (EEW_wave_p == EEW_wave_p_last) {
            EEW_wave_p_put += EEW_wave_p_Interval;
        }

        if (dateNow - cnt_mapMove >= 1000 * 3) {
            if (EEW_wave_p_put >= 480000) {
                map.setZoom(6.5);
            } else if (EEW_wave_p_put >= 320000) {
                map.setZoom(6.5);
            } else if (EEW_wave_p_put >= 140000) {
                map.setZoom(6.5);
            } else if (EEW_wave_p_put > 0) {
                map.setZoom(7);
            }
            map.setView([EEW_lat, EEW_lng]);

            cnt_mapMove = dateNow
        }

        hypo.setLatLng(new L.LatLng(EEW_lat, EEW_lng));

        wave_s.setLatLng(new L.LatLng(EEW_lat, EEW_lng));
        wave_s.setRadius(EEW_wave_s_put);
        wave_p.setLatLng(new L.LatLng(EEW_lat, EEW_lng));
        wave_p.setRadius(EEW_wave_p_put);

    } else {
        hypo.setLatLng(new L.LatLng(0, 0));
        wave_s.setLatLng(new L.LatLng(0, 0));
        wave_p.setLatLng(new L.LatLng(0, 0));

        wave_s.setRadius(0);
        wave_p.setRadius(0);
    }
}


// ---------- Init monitor map ---------- //
function init_map() {
    map = L.map('map', {
        // center: [36.1852, 139.3442],
        // center: [35.4232, 138.2647],
        center: [38.0194092, 138.3664968],

        zoom: 5.5,
        maxZoom: 10,
        minZoom: 4,
        zoomSnap: 0.5,

        // preferCanvas: true,

        zoomControl: false,
        // gestureHandling: true
    });

    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        apikey: 'c168fc2f-2f64-4f13-874c-ce2dcec92819',
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(map);

    hypo = L.circle([0, 0], {
        radius: 5000,
        weight: 2,
        color: '#ff2010',
        fillColor: '#ff2010',
        fillOpacity: 1,
    }).addTo(map);

    wave_s = L.circle([0, 0], {
        radius: -1,
        weight: 1,
        color: '#ff4020',
        fillColor: '#ff4020',
        fillOpacity: 0.25,
    }).addTo(map);

    wave_p = L.circle([0, 0], {
        radius: -1,
        weight: 1,
        color: '#4080ff',
        fillColor: '#00000000',
        fillOpacity: 0,
    }).addTo(map);

    // loopCnt_loopWaves = new Date();
}


// ---------- Get p2p ---------- //
function getInfo() {
    const url_p2p = "https://api.p2pquake.net/v2/history?codes=551&limit=40";

    response = fetch(url_p2p)
        .then(response => {
            return response.json()
        })
        .then(data => {

            p2p_data = data;
            p2p_id = p2p_data[0]['id'];

        });

}


// ---------- Eqinfo ---------- //
function eqinfo() {
    if (p2p_id != p2p_his_id_last) {
        p2p_his_id_last = p2p_id;

        for (let i = 0; i < 40; i++) {
            // --- type --- //
            p2p_type = p2p_data[i]['issue']['type'];

            // p2p_types = {
            //   'ScalePrompt': '震度速報',
            //   'Destination': '震源情報',
            //   'ScaleAndDestination': '震源・震度情報',
            //   'DetailScale': '各地の震度情報',
            //   'Foreign': '遠地地震情報',
            //   'Other': '地震情報'
            // };

            // p2p_type = p2p_types[p2p_type];

            if (p2p_type == 'DetailScale') {
                // --- time --- //
                p2p_latest_time = p2p_data[i]['earthquake']['time'];
                // datetime
                p2p_latest_timeYear = p2p_latest_time.substring(0, 4);
                p2p_latest_timeMonth = p2p_latest_time.substring(5, 7);
                p2p_latest_timeDay = p2p_latest_time.substring(8, 10);
                p2p_latest_timeHour = p2p_latest_time.substring(11, 13);
                p2p_latest_timeMinute = p2p_latest_time.substring(14, 16);

                // --- hypocenter --- //
                p2p_hypocenter = p2p_data[i]['earthquake']['hypocenter']['name'];

                if (p2p_hypocenter == '') {
                    if (pageLang === 'en-US') {
                        p2p_hypocenter = 'Checking';
                    } else {
                        p2p_hypocenter = '調査中';
                    }
                }

                // --- maxScale --- //
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

                // --- Magnitude --- //
                p2p_magnitude = p2p_data[i]['earthquake']['hypocenter']['magnitude'];

                if (p2p_magnitude == -1) {
                    if (pageLang === 'en-US') {
                        p2p_magnitude = 'Checking';
                    } else {
                        p2p_magnitude = '調査中';
                    }
                } else {
                    p2p_magnitude = 'M' + String(p2p_magnitude);
                }

                // --- Depth --- //
                p2p_depth = p2p_data[i]['earthquake']['hypocenter']['depth'];

                if (p2p_depth == -1) {
                    p2p_depth = '調査中';
                } else if (p2p_depth == 0) {
                    p2p_depth = 'ごく浅い';
                } else {
                    p2p_depth = '約' + String(p2p_depth) + 'km';
                }

                // --- Tsunami --- //
                p2p_tsunami = p2p_data[i]['earthquake']['domesticTsunami'];

                tsunamiLevels = {
                    'None': '津波の心配はありません。',
                    'Unknown': '津波の影響は不明です。',
                    'Checking': '津波の影響を現在調査中です。',
                    'NonEffective': '若干の海面変動が予想されますが、被害の心配はありません。',
                    'Watch': '津波注意報が発表されています。',
                    'Warning': '津波警報等（大津波警報・津波警報あるいは津波注意報）が発表されています。'
                };

                p2p_tsunami = tsunamiLevels[p2p_tsunami];

                // ----- put ----- //
                let p2p_his_bgc;
                let p2p_his_fntc;

                switch (p2p_maxScale) {
                    case '1':
                        p2p_his_bgc = "#c0c0c0";
                        p2p_his_fntc = "#010101";
                        break;
                    case '2':
                        p2p_his_bgc = "#2020c0";
                        p2p_his_fntc = "#ffffff";
                        break;
                    case '3':
                        p2p_his_bgc = "#20c020";
                        p2p_his_fntc = "#010101";
                        break;
                    case '4':
                        p2p_his_bgc = "#c0c020";
                        p2p_his_fntc = "#010101";
                        break;
                    case '5-':
                        p2p_his_bgc = "#c0a020";
                        p2p_his_fntc = "#010101";
                        break;
                    case '5+':
                        p2p_his_bgc = "#c07f20";
                        p2p_his_fntc = "#010101";
                        break;
                    case '6-':
                        p2p_his_bgc = "#e02020";
                        p2p_his_fntc = "#010101";
                        break;
                    case '6+':
                        p2p_his_bgc = "#a02020";
                        p2p_his_fntc = "#ffffff";
                        break;
                    case '7':
                        p2p_his_bgc = "#7f207f";
                        p2p_his_fntc = "#ffffff";
                        break;

                    default:
                        p2p_his_bgc = "#7f7fc0";
                        p2p_his_fntc = "#010101";
                        break;
                }

                $('#eqHistoryField').append(`
                    <li class="list list-${i}">
                        <div class="maxScale">
                            <p>${p2p_maxScale}</p>
                        </div>

                        <div class="right">
                            <p class="hypocenter">${p2p_hypocenter}</p>
                            <p>${p2p_latest_timeYear}/${p2p_latest_timeMonth}/${p2p_latest_timeDay} ${p2p_latest_timeHour}:${p2p_latest_timeMinute}</p>
                            <div class="hypoInfo">
                                <p>${p2p_magnitude}</p>
                                <p>${p2p_depth}</p>
                            </div>
                            <p>${p2p_tsunami}</p>
                        </div>
                    </li>
                `)

                $(`#eqHistoryField>.list-${i}>.maxScale`).css({
                    'background-color': p2p_his_bgc,
                    'color': p2p_his_fntc
                })

                p2p_his_cnt++;
            }

            if (p2p_his_cnt >= 20) { break }
        }

        eqinfo_pushNotify();

    }
}


// ---------- Eqinfo Push Notification ---------- //
function eqinfo_pushNotify() {
    if (p2p_id_last != -1) {
        Push.create(p2p_type_put, {
            body: `${p2p_hypocenter}を震源とする、最大震度${p2p_maxScale}の地震がありました。\n規模は${p2p_magnitude}、深さは${p2p_depth}と推定されます。\n${p2p_tsunami}\nページ表示するにはここを選択してください。\n`,
            onClick: function () {
                window.focus();
                this.close();
            }
        })
    }
}


// ---------- Error ---------- //
function error(errCode, errContent) {
    console.error(
        `Code: ${errCode}\n` +
        `${errContent}`
    )
}
