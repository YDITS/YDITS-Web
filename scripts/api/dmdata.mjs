/*
 *
 * dmdata.mjs | YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

export class Dmdata {
    accessToken = null;


    constructor() { }


    async init(settings) {
        /* 
         * 
         * Dmdata Redirect Checking
         * 
         */

        if (settings.connect.eew === 'dmdata') {
            if (this.accessToken !== null) {
                debugLogs.add("NETWORK", "[NETWORK]", "The access token for dmdata.jp is correct.")
                $('#settings_dmdata_init').hide();
                $('#settings_dmdata_main').show();
                dmdataSocketStart()
            } else {
                const state = "Ze4VX8";
                const resCode = this.getParam('code');
                const resState = this.getParam('state');

                if (resState === state) {
                    let resError = this.getParam('error');
                    let resError_description = this.getParam('error_description');

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
                                    this.accessToken = data['access_token'];
                                    localStorage.setItem('settings-dmdata-access-token', this.accessToken);
                                    $('#settings_dmdata_init').hide();
                                    $('#settings_dmdata_main').show();
                                    dmdataSocketStart()
                                } else if (data['error'] === 'invalid_grant') {
                                    debugLogs.add("ERROR", "[NETWORK]", "DM-D.S.S Account authentication failed.")

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
                                    debugLogs.add("ERROR", "[NETWORK]", "DM-D.S.S Account authentication failed.")

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
                                debugLogs.add("ERROR", "[NETWORK]", "DM-D.S.S Account authentication failed.")

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
                        debugLogs.add("ERROR", "[NETWORK]", "DM-D.S.S Account authentication failed.")

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


    connect(debugLogs) {
        const dmdataOAuthBaseUrl = 'https://manager.dmdata.jp/account/oauth2/v1/auth';
        const state = "Ze4VX8";
        const dmdataOAuthConfig = '?client_id=CId.M7sB113X43c8dDZ6SgEWXOa0gMm4S7tlh0fCM-IEJ5VV' +
            '&response_type=code' +
            '&redirect_uri=https:%2F%2Fwebapp.ydits.net%2F' +
            '&scope=socket.start%20socket.list%20socket.close%20eew.get.warning%20eew.get.forecast' +
            `&state=${state}`

        debugLogs.add("NETWORK", "[NETWORK]", "OAuth authentication to dmdata.jp.")
        window.open(dmdataOAuthBaseUrl + dmdataOAuthConfig, '_blank');
    }


    getParam(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
}
