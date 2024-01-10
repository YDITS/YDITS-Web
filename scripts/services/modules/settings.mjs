/*
 *
 * settings.mjs | YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

import { Service } from "../../service.mjs";

/**
 * 設定を扱うサービスです。
 */
export class Settings extends Service {
    connect = {
        eew: null,
        eqinfo: null,
        tsunami: null
    }


    map = {
        autoMove: null
    }


    sound = {
        eewAny: null,
        eewCancel: null,
        eqinfo: null
    }


    constructor(app) {
        super(app, {
            name: "settigns",
            description: "設定を扱うサービスです。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

        let dmdata = app.services.dmdata;
        let debugLogs = app.services.debugLogs;
        let notify = app.services.notify;
        let sounds = app.services.sounds;

        // ----- Events ----- //
        $(document).on('click', '#settings .closeBtn', () => {
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
            this.sound.eewAny = true;
            $('#settings_playSound_eew_any .toggle-switch').addClass('on');
        } else if (localStorage.getItem("settings-playSound-eew-any") == 'false') {
            this.sound.eewAny = false;
            $('#settings_playSound_eew_any .toggle-switch').removeClass('on');
        } else {
            this.sound.eewAny = true;
            $('#settings_playSound_eew_any .toggle-switch').addClass('on');
        }

        $(document).on('click', '#settings_playSound_eew_any .toggle-switch', function () {
            if (this.sound.eewAny == false) {
                this.sound.eewAny = true;
                localStorage.setItem('settings-playSound-eew-any', 'true');
                $('#settings_playSound_eew_any .toggle-switch').addClass('on');
            } else if (this.sound.eewAny == true) {
                this.sound.eewAny = false;
                localStorage.setItem('settings-playSound-eew-any', 'false');
                $('#settings_playSound_eew_any .toggle-switch').removeClass('on');
            }
        })

        if (localStorage.getItem("settings-playSound-eew-cancel") == 'true') {
            this.sound.eewCancel = true;
            $('#settings_playSound_eew_cancel .toggle-switch').addClass('on');
        } else if (localStorage.getItem("settings-playSound-eew-cancel") == 'false') {
            this.sound.eewCancel = false;
            $('#settings_playSound_eew_cancel .toggle-switch').removeClass('on');
        } else {
            this.sound.eewCancel = true;
            $('#settings_playSound_eew_cancel .toggle-switch').addClass('on');
        }

        $(document).on('click', '#settings_playSound_eew_cancel .toggle-switch', function () {
            if (this.sound.eewCancel == false) {
                this.sound.eewCancel = true;
                localStorage.setItem('settings-playSound-eew-cancel', 'true');
                $('#settings_playSound_eew_cancel .toggle-switch').addClass('on');
            } else if (this.sound.eewCancel == true) {
                this.sound.eewCancel = false;
                localStorage.setItem('settings-playSound-eew-cancel', 'false');
                $('#settings_playSound_eew_cancel .toggle-switch').removeClass('on');
            }
        })

        if (localStorage.getItem("settings-playSound-info") == 'true') {
            this.sound.eqinfo = true;
            $('#settings_playSound_eqinfo .toggle-switch').addClass('on');
        } else if (localStorage.getItem("settings-playSound-info") == 'false') {
            this.sound.eqinfo = false;
            $('#settings_playSound_eqinfo .toggle-switch').removeClass('on');
        } else {
            this.sound.eqinfo = true;
            $('#settings_playSound_eqinfo .toggle-switch').addClass('on');
        }

        $(document).on('click', '#settings_playSound_eqinfo .toggle-switch', function () {
            if (this.sound.eqinfo == false) {
                this.sound.eqinfo = true;
                localStorage.setItem('settings-playSound-info', 'true');
                $('#settings_playSound_eqinfo .toggle-switch').addClass('on');
            } else if (this.sound.eqinfo == true) {
                this.sound.eqinfo = false;
                localStorage.setItem('settings-playSound-info', 'false');
                $('#settings_playSound_eqinfo .toggle-switch').removeClass('on');
            }
        })


        // ----- Map ----- //
        if (localStorage.getItem("settings-map-auto-move") == 'true') {
            this.map.autoMove = true;
            $('#settings_map_auto_move .toggle-switch').addClass('on');
        } else if (localStorage.getItem("settings-map-auto-move") == 'false') {
            this.map.autoMove = false;
            $('#settings_map_auto_move .toggle-switch').removeClass('on');
        } else {
            this.map.autoMove = true;
            $('#settings_map_auto_move .toggle-switch').addClass('on');
        }

        $(document).on('click', '#settings_map_auto_move .toggle-switch', function () {
            if (this.map.autoMove == false) {
                this.map.autoMove = true;
                localStorage.setItem('settings-map-auto-move', 'true');
                $('#settings_map_auto_move .toggle-switch').addClass('on');
            } else if (map.autoMove == true) {
                this.map.autoMove = false;
                localStorage.setItem('settings-map-auto-move', 'false');
                $('#settings_map_auto_move .toggle-switch').removeClass('on');
            }
        })


        // ----- Get Type -----//
        if (localStorage.getItem("settings-getType-eew") != null) {
            this.connect.eew = localStorage.getItem("settings-getType-eew");
        } else {
            this.connect.eew = "yahoo-kmoni";
        }

        $(`select[name="settings-getType-eew"]`).val(`${this.connect.eew}`);

        if (this.connect.eew === 'yahoo-kmoni') {
            $('#settings_dmdata').hide();
        } else if (this.connect.eew === 'dmdata') {
            $('#settings_dmdata').show();

        }

        dmdata.accessToken = localStorage.getItem('settings-dmdata-access-token');
        if (dmdata.accessToken === null) {
            $('#settings_dmdata_init').show();
            $('#settings_dmdata_main').hide();
        } else {
            $('#settings_dmdata_init').hide();
            $('#settings_dmdata_main').show();
        }

        $(document).on('change', 'select[name="settings-getType-eew"]', function () {
            this.connect.eew = $('option:selected').val();
            if (this.connect.eew === 'yahoo-kmoni') {
                $('#settings_dmdata').hide();
                if (dmdata.accessToken !== null) {
                    dmdataSocket.close();
                }
            } else if (connect.eew === 'dmdata') {
                $('#settings_dmdata').show();
                if (dmdata.accessToken !== null) {
                    dmdataSocketStart();
                }
            }
            localStorage.setItem('settings-getType-eew', connect.eew);
        });

        if (localStorage.getItem("settings-getType-eqinfo") != null) {
            this.connect.eqinfo = localStorage.getItem("settings-getType-eqinfo");
        } else {
            this.connect.eqinfo = "p2pquake";
        }

        $(`select[name="settings-getType-eqinfo"]`).val(`${this.connect.eqinfo}`);

        $(document).on('change', 'select[name="settings-getType-eqinfo"]', function () {
            this.connect.eqinfo = $('option:selected').val();
            if (this.connect.eqinfo === 'p2pquake') {
            } else if (this.connect.eqinfo === 'dmdata') {
            }
            localStorage.setItem('settings-getType-eqinfo', this.connect.eqinfo);
        });

        if (localStorage.getItem("settings-getType-tsunami") != null) {
            this.connect.tsunami = localStorage.getItem("settings-getType-tsunami");
        } else {
            this.connect.tsunami = "p2pquake";
        }

        $(`select[name="settings-getType-tsunami"]`).val(`${this.connect.tsunami}`);

        $(document).on('change', 'select[name="settings-getType-tsunami"]', function () {
            this.connect.tsunami = $('option:selected').val();
            if (this.connect.tsunami === 'p2pquake') {
            } else if (this.connect.tsunami === 'dmdata') {
            }
            localStorage.setItem('settings-getType-tsunami', this.connect.tsunami);
        });


        // ----- dmdata -----//
        $(document).on('click', '#settings_dmdata_init_btn', () => dmdata.connect(debugLogs));


        // ----- Reset -----//
        $(document).on('click', '#settings_resetSettingsBtn', (e) => {
            this.connect.eew = "yahoo-kmoni";
            this.connect.eqinfo = "p2pquake";
            this.connect.tsunami = "p2pquake";
            $(`select[name="settings-getType-eew"]`).val(`${this.connect.eew}`);
            $(`select[name="settings-getType-eqinfo"]`).val(`${this.onnect.eqinfo}`);
            $(`select[name="settings-getType-tsunami"]`).val(`${this.connect.tsunami}`);

            this.map.autoMove = true;
            $('#settings_map_auto_move .toggle-switch').addClass('on');

            dmdata.accessToken = null;
            $('#settings_dmdata').hide();
            $('#settings_dmdata_init').show();
            $('#settings_dmdata_main').hide();

            this.sound.eewAny = true;
            $('#settings_playSound_eew_any .toggle-switch').addClass('on');

            this.sound.eewCancel = true;
            $('#settings_playSound_eew_cancel .toggle-switch').addClass('on');

            this.sound.eqinfo = true;
            $('#settings_playSound_eqinfo .toggle-switch').addClass('on');

            localStorage.clear()
            localStorage.setItem("debugLogs", JSON.stringify(debugLogs));

            sounds.notify.play();
            notify.show("message", "設定のリセット", "設定をリセットしました。");
            debugLogs.add("INFO", `[INFO]`, "Settings were reset.");
        });


        // ----- Test Play Sounds -----//
        $(document).on('click', '#btn_eew_chk_sound', function () {
            sounds.eew.play();
            sounds.eewVoice7.play();
        });
        $(document).on('click', '#btn_earthquake_info_chk_sound', function () {
            sounds.eqinfo.play();
            sounds.eqinfoVoice7.play();
        });
        $(document).on('click', '#btn_eew_cancel_chk_sound', function () {
            sounds.eewVoiceCancel.play();
        });
        $(document).on('click', '#btn_push_chk', function () {
            sounds.notify.play();
            notify.show("message", "プッシュ通知のテスト", "これはページ内通知です。プッシュ通知とは別に表示されます。");

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
        $(document).on('click', '#deleteDebugLogsButton', function (e) {
            debugLogs.delete();
            debugLogs.add("START", "[START]", "- Start log -");

            sounds.notify.play();
            notify.show("message", "デバッグログの削除", "デバッグログを削除しました。");
        });
    }
}