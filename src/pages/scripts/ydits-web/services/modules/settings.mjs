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

import { Service } from "../../../service.mjs";

/**
 * 設定を扱う。
 */
export class Settings extends Service {
    connect = {
        eew: null,
        eqinfo: null,
        tsunami: null,
        volcanicEruption: null,
        civilProtection: null
    }


    map = {
        autoMove: null,
        displayUserPoint: null
    }


    sound = {
        eewAny: null,
        eewCancel: null,
        eqinfo: null
    }


    debug = {
        rayout: null
    }


    constructor(app) {
        super(app, {
            name: "settings",
            description: "設定を扱うサービスです。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });
    }


    initialize() {
        let dmdata = this.app.services.api.dmdata;
        let debugLogs = this.app.services.debugLogs;
        let notify = this.app.services.notify;
        let sounds = this.app.services.sounds;

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
        $(document).on('click', '#settings_list_location', () => {
            $('#settings_location').addClass('active');
        });
        $(document).on('click', '#settings_location .closeBtn', () => {
            $('#settings_location').removeClass('active');
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

        $(document).on('click', '#settings_playSound_eew_any .toggle-switch', () => {
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

        $(document).on('click', '#settings_playSound_eew_cancel .toggle-switch', () => {
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

        $(document).on('click', '#settings_playSound_eqinfo .toggle-switch', () => {
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

        $(document).on('click', '#settings_map_auto_move .toggle-switch', () => {
            if (this.map.autoMove == false) {
                this.map.autoMove = true;
                localStorage.setItem('settings-map-auto-move', 'true');
                $('#settings_map_auto_move .toggle-switch').addClass('on');
            } else if (this.map.autoMove == true) {
                this.map.autoMove = false;
                localStorage.setItem('settings-map-auto-move', 'false');
                $('#settings_map_auto_move .toggle-switch').removeClass('on');
            }
        });

        if (localStorage.getItem("settings-map-display-userpoint") == 'true') {
            this.map.displayUserPoint = true;
            $('#settings_map_user_point .toggle-switch').addClass('on');
        } else if (localStorage.getItem("settings-map-display-userpoint") == 'false') {
            this.map.displayUserPoint = false;
            $('#settings_map_user_point .toggle-switch').removeClass('on');
        } else {
            this.map.displayUserPoint = true;
            $('#settings_map_user_point .toggle-switch').addClass('on');
        }

        $(document).on('click', '#settings_map_user_point .toggle-switch', () => {
            if (this.map.displayUserPoint == false) {
                this.map.displayUserPoint = true;
                localStorage.setItem('settings-map-display-userpoint', 'true');
                $('#settings_map_user_point .toggle-switch').addClass('on');
                this.app.services.map.updateUserPoint();
            } else if (this.map.displayUserPoint == true) {
                this.map.displayUserPoint = false;
                localStorage.setItem('settings-map-display-userpoint', 'false');
                $('#settings_map_user_point .toggle-switch').removeClass('on');
                this.app.services.map.updateUserPoint();
            }
        });

        // ----- Connection ----- //
        this.connect.eew = "yahoo-kmoni";
        this.connect.eqinfo = "p2pquake";
        this.connect.tsunami = "dmdata";
        this.connect.volcanicEruption = "dmdata";
        this.connect.civilProtection = "dmdata";


        // ----- Reset -----//
        $(document).on('click', '#settings_resetSettingsBtn', (e) => {
            this.connect.eew = "yahoo-kmoni";
            this.connect.eqinfo = "p2pquake";
            this.connect.tsunami = "dmdata";
            this.connect.volcanicEruption = "dmdata";
            this.connect.civilProtection = "dmdata";
            this.map.autoMove = true;
            this.map.displayUserPoint = true;
            this.sound.eewAny = true;
            this.sound.eewCancel = true;
            this.sound.eqinfo = true;

            $('#settings_map_auto_move .toggle-switch').addClass('on');
            $('#settings_map_user_point .toggle-switch').addClass('on');
            $('#settings_playSound_eew_any .toggle-switch').addClass('on');
            $('#settings_playSound_eew_cancel .toggle-switch').addClass('on');
            $('#settings_playSound_eqinfo .toggle-switch').addClass('on');

            localStorage.clear();
            localStorage.setItem("debugLogs", JSON.stringify(debugLogs.debugLogs));

            sounds.notify.play();
            notify.show("message", "設定のリセット", "設定をリセットしました。");
            this.app.services.debugLogs.add("info", `[${this.name}]`, "Settings were reset.");
        });


        // ----- Test Play Sounds -----//
        $(document).on('click', '#btn_eew_chk_sound', () => {
            sounds.eew.play();
            sounds.eewVoice7.play();
        });
        $(document).on('click', '#btn_earthquake_info_chk_sound', () => {
            sounds.eqinfo.play();
            sounds.eqinfoVoice7.play();
        });
        $(document).on('click', '#btn_eew_cancel_chk_sound', () => {
            sounds.eewVoiceCancel.play();
        });
        $(document).on('click', '#btn_push_chk', () => {
            sounds.notify.play();
            notify.show("message", "プッシュ通知のテスト", "これはページ内通知です。プッシュ通知とは別に表示されます。");

            this.app.services.pushNotify.notify(
                "プッシュ通知のテスト",
                {
                    body: "これはプッシュ通知のテストです。"
                }
            );

            // Push.create(`YDITS for Web`, {
            //     body: `これはプッシュ通知のテストです。`,
            //     timeout: 10000,
            //     onClick: function () {
            //         window.focus();
            //         this.close();
            //     }
            // })
        });


        // ----- Debug Logs -----//
        $(document).on("click", "#openDebugLogsButton", () => {
            $("#debugLogsWindow").addClass("active");
        });
        $(document).on("click", "#debugLogsWindow .closeBtn", () => {
            $("#debugLogsWindow").removeClass("active");
        });


        // ----- Delete Debug Logs -----//
        $(document).on('click', '#deleteDebugLogsButton', () => {
            debugLogs.delete();
            debugLogs.add("start", "[START]", "- Start log -");

            sounds.notify.play();
            notify.show("message", "デバッグログの削除", "デバッグログを削除しました。");
        });

        // ----- Debug Mode -----//
        $(document).on("click", "#openDebugModeButton", () => {
            $("#debugModeWindow").addClass("active");
        });
        $(document).on("click", "#debugModeWindow .closeBtn", () => {
            $("#debugModeWindow").removeClass("active");
        });

        // ----- Debug Rayout ----- //
        if (localStorage.getItem("settings-debug-rayout") == 'true') {
            this.debug.rayout = true;
            $('#settingsDebugRayout .toggle-switch').addClass('on');
            this.showDebugRayout();
        } else if (localStorage.getItem("settings-debug-rayout") == 'false') {
            this.debug.rayout = false;
            $('#settingsDebugRayout .toggle-switch').removeClass('on');
            this.hideDebugRayout();
        } else {
            this.debug.rayout = false;
            $('#settingsDebugRayout .toggle-switch').removeClass('on');
            this.hideDebugRayout();
        }

        $(document).on('click', '#settingsDebugRayout .toggle-switch', () => {
            if (this.debug.rayout == false) {
                this.debug.rayout = true;
                localStorage.setItem('settings-debug-rayout', 'true');
                $('#settingsDebugRayout .toggle-switch').addClass('on');
                this.showDebugRayout();
            } else if (this.debug.rayout == true) {
                this.debug.rayout = false;
                localStorage.setItem('settings-debug-rayout', 'false');
                $('#settingsDebugRayout .toggle-switch').removeClass('on');
                this.hideDebugRayout();
            }
        });
    }


    showDebugRayout() {
        $("*").css({
            "outline": "1px solid #00ff00ff"
        });
    }


    hideDebugRayout() {
        $("*").css({
            "outline": "unset"
        });
    }
}