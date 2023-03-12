//
// index.js | YDITS for Web
//
// (c) 2022-2023 よね/Yone
//
// No modification or reproduction of any kind is permitted.
// 改変や複製を一切禁じます。
//
let gmt;
let cnt_getNTP = -1;

let settings_playSound_eew_any;
let settings_playSound_eew_cancel;
let settings_playSound_eqinfo;

let cnt_eew = -1;
let eew_flg = false;
let eew_data_nakn = null;
let eewGetType = "";
let eew_repDT = null;
let eew_origin_time = null;
let eew_intensity = null;
let eew_hypocenter = "";
let eew_originTimeYear = -1;
let eew_originTimeMonth = -1;
let eew_originTimeDay = -1;
let eew_originTimeHour = -1;
let eew_originTimeMinute = -1;
let eew_originTimeSecond = -1;

let eew_data = null;
let eew_time = 1;
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

let dmdata_access_token = null;

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
let loopCnt_loopWaves = -1;
let isFullscreen_map = false;

let eew_sound
let p2p_sound
let eew_1_voice
let eew_2_voice
let eew_3_voice
let eew_4_voice
let eew_5_voice
let eew_6_voice
let eew_7_voice
let eew_8_voice
let eew_9_voice
let eew_Cancel_voice
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
        clock();
    }

    if (dateNow - cnt_eew >= 1000 * eew_time) {
        cnt_eew = dateNow;
        if (eewGetType === "dmdata") {
            dmdata()
        } else {
            kmoni();
        }
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
    settings_init();
    initDmdata();
    initMenu();
    licence_init();
    init_map();
    init_sounds();
    init_push();
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
    eew_sound = new Audio("https://webapp.ydits.net/Sounds/eew.wav");
    p2p_sound = new Audio("https://webapp.ydits.net/Sounds/info.wav");
    eew_1_voice = new Audio("https://webapp.ydits.net/Sounds/eew_1_v.mp3");
    eew_2_voice = new Audio("https://webapp.ydits.net/Sounds/eew_2_v.mp3");
    eew_3_voice = new Audio("https://webapp.ydits.net/Sounds/eew_3_v.mp3");
    eew_4_voice = new Audio("https://webapp.ydits.net/Sounds/eew_4_v.mp3");
    eew_5_voice = new Audio("https://webapp.ydits.net/Sounds/eew_5_v.mp3");
    eew_6_voice = new Audio("https://webapp.ydits.net/Sounds/eew_6_v.mp3");
    eew_7_voice = new Audio("https://webapp.ydits.net/Sounds/eew_7_v.mp3");
    eew_8_voice = new Audio("https://webapp.ydits.net/Sounds/eew_8_v.mp3");
    eew_9_voice = new Audio("https://webapp.ydits.net/Sounds/eew_9_v.mp3");
    eew_Cancel_voice = new Audio("https://webapp.ydits.net/Sounds/eew_cancel_v.mp3");
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

    // --- Get type
    if (localStorage.getItem("settings-getType-eew") != null) {
        eewGetType = localStorage.getItem("settings-getType-eew");
    } else {
        eewGetType = "yahoo-kmoni";
    }

    $(`input[value=${eewGetType}]`).prop('checked', true);

    if (eewGetType === 'yahoo-kmoni') {
        $('#settings_yahoo_kmoni').show();
        $('#settings_dmdata').hide();
    } else if (eewGetType === 'dmdata') {
        $('#settings_yahoo_kmoni').hide();
        $('#settings_dmdata').show();
        
    }
    
    dmdata_access_token = localStorage.getItem('settings-dmdata-access-token');
    console.log(dmdata_access_token);
    if (dmdata_access_token === null) {
        $('#settings_dmdata_init').show();
        $('#settings_dmdata_main').hide();
    } else {
        $('#settings_dmdata_init').hide();
        $('#settings_dmdata_main').show();
    }
    
    $(document).on('input', 'input[name="settings-getType-eew"]', () => {
        eewGetType = $('input[name="settings-getType-eew"]:checked').val();
        if (eewGetType === 'yahoo-kmoni') {
            $('#settings_yahoo_kmoni').show();
            $('#settings_dmdata').hide();
        } else if (eewGetType === 'dmdata') {
            $('#settings_yahoo_kmoni').hide();
            $('#settings_dmdata').show();
        }
        localStorage.setItem('settings-getType-eew', eewGetType);
    });

    $(document).on('click', '#settings_dmdata_init_btn', connectDmdata)

    // --- eew get cnt
    if (localStorage.getItem("settings-getCnt_eew") != null) {
        eew_time = Number(localStorage.getItem("settings-getCnt_eew"));
    } else {
        eew_time = 1;
    }

    $('#settings_getCnt_eew_bar').val(eew_time);
    $('#settings_getCnt_eew_put').text(eew_time);

    $(document).on('input', '#settings_getCnt_eew_bar', function () {
        eew_time = $('#settings_getCnt_eew_bar').val();
        localStorage.setItem('settings-getCnt_eew', String(eew_time));
        $('#settings_getCnt_eew_put').text(eew_time);
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
        eewGetType = "yahoo-kmoni";
        dmdata_access_token = null;
        $(`input[value=${eewGetType}]`).prop('checked', true);
        $('#settings_yahoo_kmoni').show();
        $('#settings_dmdata').hide();
        $('#settings_dmdata_init').show();
        $('#settings_dmdata_main').hide();

        eew_time = 1;
        $('#settings_getCnt_eew_bar').val(eew_time);
        $('#settings_getCnt_eew_put').text(eew_time);

        p2p_time = 8;
        $('#settings_getCnt_eqinfo_bar').val(p2p_time);
        $('#settings_getCnt_eqinfo_put').text(p2p_time);

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
};


// ---------- Info ---------- //
function licence_init() {
    $(document).on('click', '#license>.closeBtn', function () {
        $('#license').removeClass('active');
        $('#menu').addClass('active')
    })
}


// dmdata initialize //
function connectDmdata() {
    const dmdataOAuthBaseUrl = 'https://manager.dmdata.jp/account/oauth2/v1/auth';
    const state = "Ze4VX8";
    const dmdataOAuthConfig = '?client_id=CId.M7sB113X43c8dDZ6SgEWXOa0gMm4S7tlh0fCM-IEJ5VV'+
                              '&response_type=code'+
                              '&redirect_uri=https:%2F%2Fwebapp.ydits.net%2F'+
                              '&scope=socket.start%20socket.list%20socket.close%20eew.get.warning%20eew.get.forecast'+
                              `&state=${state}`
    window.open(dmdataOAuthBaseUrl + dmdataOAuthConfig, '_self');
}


// dmdata redirect checking //
function initDmdata() {
    console.log(eewGetType);
    if (eewGetType === 'dmdata') {
        if (dmdata_access_token !== null) {
            $('#settings_dmdata_init').hide();
            $('#settings_dmdata_main').show();
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
                    console.log(dmdataFormBody);

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
                        console.log(data['error']);
                        if (data['error'] === undefined) {
                            dmdata_access_token = data['access_token'];
                            localStorage.setItem('settings-dmdata-access-token', dmdata_access_token);
                            $('#settings_dmdata_init').hide();
                            $('#settings_dmdata_main').show();
                        } else if (data['error'] === 'invalid_grant') {
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
                            eew_bgc = "#c0c0c0";
                            eew_fntc = "#010101";
                            break;
                        case '2':
                            eew_bgc = "#2020c0";
                            eew_fntc = "#ffffff";
                            break;
                        case '3':
                            eew_bgc = "#20c020";
                            eew_fntc = "#010101";
                            break;
                        case '4':
                            eew_bgc = "#c0c020";
                            eew_fntc = "#010101";
                            break;
                        case '5-':
                            eew_bgc = "#c0a020";
                            eew_fntc = "#010101";
                            break;
                        case '5+':
                            eew_bgc = "#c07f20";
                            eew_fntc = "#010101";
                            break;
                        case '6-':
                            eew_bgc = "#e02020";
                            eew_fntc = "#ffffff";
                            break;
                        case '6+':
                            eew_bgc = "#a02020";
                            eew_fntc = "#ffffff";
                            break;
                        case '7':
                            eew_bgc = "#7f207f";
                            eew_fntc = "#ffffff";
                            break;

                        default:
                            eew_bgc = "#7f7fc0";
                            eew_fntc = "#010101";
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

                    $('#eewField').css({
                        'background-color': eew_bgc,
                        'color': eew_fntc
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

                $('#eewTitle').text("緊急地震速報は発表されていません");

                $('#eew .calcintensity_para').text('');
                $('#eew .region').text('');
                $('#eew .origin_time').text('');
                $('#eew .magnitude').text('');
                $('#eew .depth').text('');

                $('#eewField').css({
                    'background-color': eew_bgc,
                    'color': eew_fntc
                })
            }
        })

        .catch(error => {
            if (error == 'TypeError: Failed to fetch') {
                $('#eewTitle').text(`取得エラー; インターネット接続なし`);
            } else {
                $('#eewTitle').text(`取得エラー`);
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


function dmdata() {
    if (dmdata_access_token !== null) {
        $('#eewTitle').text("接続なし; dmdataとの接続はまだ対応しておりません。");
    } else {
        $('#eewTitle').text("接続エラー; dmdataの接続設定を確認してください。");
    }
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
        eew_waves = eew_data['psWave']['items'][0];

        if (eew_waves !== null) {
            eew_lat = eew_waves['latitude'].replace("N", "");
            eew_lng = eew_waves['longitude'].replace("E", "");
            eew_hypo_LatLng = new L.LatLng(eew_lat, eew_lng);

            eew_wave_p = eew_waves['pRadius'];
            eew_wave_s = eew_waves['sRadius'];
            eew_wave_p *= 1000;
            eew_wave_s *= 1000;
        }

        if (eew_wave_s != eew_wave_s_last) {
            eew_wave_s_Interval = (eew_wave_s - eew_wave_s_last) / (60 * ((dateNow - loopCnt_moni) / 1000));
            eew_wave_s_last = eew_wave_s;
            eew_wave_s_put = eew_wave_s;
        } else if (eew_wave_s == eew_wave_s_last) {
            eew_wave_s_put += eew_wave_s_Interval;
        }

        if (eew_wave_p != eew_wave_p_last) {
            eew_wave_p_Interval = (eew_wave_p - eew_wave_p_last) / (60 * ((dateNow - loopCnt_moni) / 1000));
            eew_wave_p_last = eew_wave_p;
            eew_wave_p_put = eew_wave_p;
            loopCnt_moni = dateNow;
        } else if (eew_wave_p == eew_wave_p_last) {
            eew_wave_p_put += eew_wave_p_Interval;
        }

        if (dateNow - cnt_mapMove >= 1000 * 3) {
            if (eew_wave_p_put >= 560000) {
                map.setZoom(5);
            } else if (eew_wave_p_put >= 280000) {
                map.setZoom(6);
            } else if (eew_wave_p_put > 0) {
                map.setZoom(7);
            }
            map.setView([eew_lat, eew_lng]);

            cnt_mapMove = dateNow
        }

        hypo.setLatLng(new L.LatLng(eew_lat, eew_lng));

        wave_s.setLatLng(new L.LatLng(eew_lat, eew_lng));
        wave_s.setRadius(eew_wave_s_put);
        wave_p.setLatLng(new L.LatLng(eew_lat, eew_lng));
        wave_p.setRadius(eew_wave_p_put);

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
    if (p2p_id != p2p_id_last) {
        if (p2p_id_last == -1) {
            for (let i = 0; i < 40; i++) {
                p2p_type = p2p_data[i]['issue']['type'];

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
                        'None': '津波の心配はありません。',
                        'Unknown': '津波の影響は不明です。',
                        'Checking': '津波の影響を現在調査中です。',
                        'NonEffective': '若干の海面変動が予想されますが、被害の心配はありません。',
                        'Watch': '津波注意報が発表されています。',
                        'Warning': '津波警報等（大津波警報・津波警報あるいは津波注意報）が発表されています。'
                    };

                    p2p_tsunami = tsunamiLevels[p2p_tsunami];

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
        } else {
            p2p_type = p2p_data[0]['issue']['type'];

            p2p_types = {
                'ScalePrompt': '震度速報',
                'Destination': '震源情報',
                'ScaleAndDestination': '震源・震度情報',
                'DetailScale': '各地の震度情報',
                'Foreign': '遠地地震情報',
                'Other': '地震情報'
            };

            p2p_type_put = p2p_types[p2p_type];

            p2p_latest_time = p2p_data[0]['earthquake']['time'];
            p2p_latest_timeYear = p2p_latest_time.substring(0, 4);
            p2p_latest_timeMonth = p2p_latest_time.substring(5, 7);
            p2p_latest_timeDay = p2p_latest_time.substring(8, 10);
            p2p_latest_timeHour = p2p_latest_time.substring(11, 13);
            p2p_latest_timeMinute = p2p_latest_time.substring(14, 16);

            p2p_hypocenter = p2p_data[0]['earthquake']['hypocenter']['name'];

            if (p2p_hypocenter == '') { p2p_hypocenter = '調査中'; }

            p2p_maxScale = p2p_data[0]['earthquake']['maxScale'];

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

            p2p_magnitude = p2p_data[0]['earthquake']['hypocenter']['magnitude'];

            if (p2p_magnitude == -1) {
                p2p_magnitude = '-';
            } else {
                p2p_magnitude = 'M' + String(p2p_magnitude);
            }

            p2p_depth = p2p_data[0]['earthquake']['hypocenter']['depth'];

            if (p2p_depth == -1) {
                p2p_depth = '-';
            } else if (p2p_depth == 0) {
                p2p_depth = 'ごく浅い';
            } else {
                p2p_depth = '約' + String(p2p_depth) + 'km';
            }

            p2p_tsunami = p2p_data[0]['earthquake']['domesticTsunami'];

            tsunamiLevels = {
                'None': '津波の心配はありません。',
                'Unknown': '津波の影響は不明です。',
                'Checking': '津波の影響を現在調査中です。',
                'NonEffective': '若干の海面変動が予想されますが、被害の心配はありません。',
                'Watch': '津波注意報が発表されています。',
                'Warning': '津波警報等（大津波警報・津波警報あるいは津波注意報）が発表されています。'
            };

            p2p_tsunami = tsunamiLevels[p2p_tsunami];

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

            $('#eqHistoryField').prepend(`
                <li class="list list-${p2p_his_cnt}">
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

            $(`#eqHistoryField>.list-${p2p_his_cnt}>.maxScale`).css({
                'background-color': p2p_his_bgc,
                'color': p2p_his_fntc
            })

            p2p_his_cnt++;

            eqinfo_pushNotify();
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


// ---------- Error ---------- //
function error(errCode, errContent) {
    console.error(
        `Code: ${errCode}\n` +
        `${errContent}`
    )
}
