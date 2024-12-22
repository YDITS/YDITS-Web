/*
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the Apache License 2.0.
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
        displayUserPoint: null,
        layers: {
            hrpns: null
        }
    }


    sound = {
        eewAny: null,
        eewCancel: null,
        eqinfo: null
    }


    display = {
        showWarn: null
    }


    debug = {
        rayout: null,
        fpsMs: 1000,
        output: false,
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
        this.app.services.notify.show("message", "", `${this.name}をイニシャライズしています…`);

        let dmdata = this.app.services.api.dmdata;
        let debugLogs = this.app.services.debugLogs;
        let notify = this.app.services.notify;
        let sounds = this.app.services.sounds;

        // ----- Events ----- //
        document.querySelector("#settings .closeBtn").addEventListener("click", () => {
            document.getElementById("settings").classList.remove("active");
            document.getElementById("menu").classList.add("active");
        });

        document.getElementById("settings_list_sound").addEventListener("click", () => {
            document.getElementById("settings_sounds").classList.add("active");
        });

        document.querySelector("#settings_sounds .closeBtn").addEventListener("click", () => {
            document.getElementById("settings_sounds").classList.remove("active");
        });

        document.getElementById("settings_list_display").addEventListener("click", () => {
            document.getElementById("settings_display").classList.add("active");
        });

        document.querySelector("#settings_display .closeBtn").addEventListener("click", () => {
            document.getElementById("settings_display").classList.remove("active");
        });

        document.getElementById("settings_list_map").addEventListener("click", () => {
            document.getElementById("settings_map").classList.add("active");
        });

        document.querySelector("#settings_map .closeBtn").addEventListener("click", () => {
            document.getElementById("settings_map").classList.remove("active");
        });

        document.getElementById("settings_list_location").addEventListener("click", () => {
            document.getElementById("settings_location").classList.add("active");
        });

        document.querySelector("#settings_location .closeBtn").addEventListener("click", () => {
            document.getElementById("settings_location").classList.remove("active");
        });

        document.getElementById("settings_list_notify").addEventListener("click", () => {
            document.getElementById("settings_notify").classList.add("active");
        });

        document.querySelector("#settings_notify .closeBtn").addEventListener("click", () => {
            document.getElementById("settings_notify").classList.remove("active");
        });

        document.getElementById("settings_list_other").addEventListener("click", () => {
            document.getElementById("settings_other").classList.add("active");
        });

        document.querySelector("#settings_other .closeBtn").addEventListener("click", () => {
            document.getElementById("settings_other").classList.remove("active");
        });


        // ----- Sounds -----//
        if (localStorage.getItem("settings-playSound-eew-any") == 'true') {
            this.sound.eewAny = true;
            document.querySelector("#settings_playSound_eew_any .toggle-switch").classList.add("on");
        } else if (localStorage.getItem("settings-playSound-eew-any") == 'false') {
            this.sound.eewAny = false;
            document.querySelector("#settings_playSound_eew_any .toggle-switch").classList.remove("on");
        } else {
            this.sound.eewAny = true;
            document.querySelector("#settings_playSound_eew_any .toggle-switch").classList.add("on");
        }

        document.querySelector("#settings_playSound_eew_any .toggle-switch").addEventListener("click", () => {
            if (this.sound.eewAny == false) {
                this.sound.eewAny = true;
                localStorage.setItem('settings-playSound-eew-any', 'true');
                document.querySelector("#settings_playSound_eew_any .toggle-switch").classList.add("on");
            } else if (this.sound.eewAny == true) {
                this.sound.eewAny = false;
                localStorage.setItem('settings-playSound-eew-any', 'false');
                document.querySelector("#settings_playSound_eew_any .toggle-switch").classList.remove("on");
            }
        })

        if (localStorage.getItem("settings-playSound-eew-cancel") == 'true') {
            this.sound.eewCancel = true;
            document.querySelector("#settings_playSound_eew_cancel .toggle-switch").classList.add("on");
        } else if (localStorage.getItem("settings-playSound-eew-cancel") == 'false') {
            this.sound.eewCancel = false;
            document.querySelector("#settings_playSound_eew_cancel .toggle-switch").classList.remove("on");
        } else {
            this.sound.eewCancel = true;
            document.querySelector("#settings_playSound_eew_cancel .toggle-switch").classList.add("on");
        }

        document.querySelector("#settings_playSound_eew_cancel .toggle-switch").addEventListener("click", () => {
            if (this.sound.eewCancel == false) {
                this.sound.eewCancel = true;
                localStorage.setItem('settings-playSound-eew-cancel', 'true');
                document.querySelector("#settings_playSound_eew_cancel .toggle-switch").classList.add("on");
            } else if (this.sound.eewCancel == true) {
                this.sound.eewCancel = false;
                localStorage.setItem('settings-playSound-eew-cancel', 'false');
                document.querySelector("#settings_playSound_eew_cancel .toggle-switch").classList.remove("on");
            }
        })

        if (localStorage.getItem("settings-playSound-info") == 'true') {
            this.sound.eqinfo = true;
            document.querySelector("#settings_playSound_eqinfo .toggle-switch").classList.add("on");
        } else if (localStorage.getItem("settings-playSound-info") == 'false') {
            this.sound.eqinfo = false;
            document.querySelector("#settings_playSound_eqinfo .toggle-switch").classList.remove("on");
        } else {
            this.sound.eqinfo = true;
            document.querySelector("#settings_playSound_eqinfo .toggle-switch").classList.add("on");
        }

        document.querySelector("#settings_playSound_eqinfo .toggle-switch").addEventListener("click", () => {
            if (this.sound.eqinfo == false) {
                this.sound.eqinfo = true;
                localStorage.setItem('settings-playSound-info', 'true');
                document.querySelector("#settings_playSound_eqinfo .toggle-switch").classList.add("on");
            } else if (this.sound.eqinfo == true) {
                this.sound.eqinfo = false;
                localStorage.setItem('settings-playSound-info', 'false');
                document.querySelector("#settings_playSound_eqinfo .toggle-switch").classList.remove("on");
            }
        })

        // ----- Display ----- //
        if (localStorage.getItem("settings-display-warn") == 'true') {
            this.display.showWarn = true;
            document.querySelector("#settings_display .toggle-switch").classList.add("on");
        } else if (localStorage.getItem("settings-display-warn") == 'false') {
            this.display.showWarn = false;
            document.querySelector("#settings_display .toggle-switch").classList.remove("on");
        } else {
            this.display.showWarn = true;
            document.querySelector("#settings_display .toggle-switch").classList.add("on");
        }

        document.querySelector("#settings_display .toggle-switch").addEventListener("click", () => {
            if (this.display.showWarn == false) {
                this.display.showWarn = true;
                localStorage.setItem('settings-display-warn', 'true');
                document.querySelector("#settings_display .toggle-switch").classList.add("on");
            } else if (this.display.showWarn == true) {
                this.display.showWarn = false;
                localStorage.setItem('settings-display-warn', 'false');
                document.querySelector("#settings_display .toggle-switch").classList.remove("on");
            }
        });

        // ----- Map ----- //
        if (localStorage.getItem("settings-map-auto-move") == 'true') {
            this.map.autoMove = true;
            document.querySelector("#settings_map_auto_move .toggle-switch").classList.add("on");
        } else if (localStorage.getItem("settings-map-auto-move") == 'false') {
            this.map.autoMove = false;
            document.querySelector("#settings_map_auto_move .toggle-switch").classList.remove("on");
        } else {
            this.map.autoMove = true;
            document.querySelector("#settings_map_auto_move .toggle-switch").classList.add("on");
        }

        document.querySelector("#settings_map_auto_move .toggle-switch").addEventListener("click", () => {
            if (this.map.autoMove == false) {
                this.map.autoMove = true;
                localStorage.setItem('settings-map-auto-move', 'true');
                document.querySelector("#settings_map_auto_move .toggle-switch").classList.add("on");
            } else if (this.map.autoMove == true) {
                this.map.autoMove = false;
                localStorage.setItem('settings-map-auto-move', 'false');
                document.querySelector("#settings_map_auto_move .toggle-switch").classList.remove("on");
            }
        });

        if (localStorage.getItem("settings-map-display-userpoint") == 'true') {
            this.map.displayUserPoint = true;
            document.querySelector("#settings_map_user_point .toggle-switch").classList.add("on");
        } else if (localStorage.getItem("settings-map-display-userpoint") == 'false') {
            this.map.displayUserPoint = false;
            document.querySelector("#settings_map_user_point .toggle-switch").classList.remove("on");
        } else {
            this.map.displayUserPoint = true;
            document.querySelector("#settings_map_user_point .toggle-switch").classList.add("on");
        }

        document.querySelector("#settings_map_user_point .toggle-switch").addEventListener("click", () => {
            if (this.map.displayUserPoint == false) {
                this.map.displayUserPoint = true;
                localStorage.setItem('settings-map-display-userpoint', 'true');
                document.querySelector("#settings_map_user_point .toggle-switch").classList.add("on");
                this.app.services.map.updateUserPoint();
            } else if (this.map.displayUserPoint == true) {
                this.map.displayUserPoint = false;
                localStorage.setItem('settings-map-display-userpoint', 'false');
                document.querySelector("#settings_map_user_point .toggle-switch").classList.remove("on");
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
        document.getElementById("settings_resetSettingsBtn").addEventListener("click", () => {
            this.connect.eew = "yahoo-kmoni";
            this.connect.eqinfo = "p2pquake";
            this.connect.tsunami = "dmdata";
            this.connect.volcanicEruption = "dmdata";
            this.connect.civilProtection = "dmdata";
            this.display.showWarn = true;
            this.map.autoMove = true;
            this.map.displayUserPoint = true;
            this.sound.eewAny = true;
            this.sound.eewCancel = true;
            this.sound.eqinfo = true;
            this.debug.fpsMs = 1000;
            this.debug.rayout = false;

            document.querySelector("#settings_display_warn .toggle-switch").classList.add("on");
            document.querySelector("#settings_map_auto_move .toggle-switch").classList.add("on");
            document.querySelector("#settings_map_user_point .toggle-switch").classList.add("on");
            document.querySelector("#settings_playSound_eew_any .toggle-switch").classList.add("on");
            document.querySelector("#settings_playSound_eew_cancel .toggle-switch").classList.add("on");
            document.querySelector("#settings_playSound_eqinfo .toggle-switch").classList.add("on");
            document.getElementById('settingsFpsMsSelect').value = '1000';
            document.querySelector("#settingsDebugRayout .toggle-switch").classList.remove("on");

            this.hideDebugRayout();

            localStorage.clear();
            localStorage.setItem("debugLogs", JSON.stringify(debugLogs.debugLogs));

            sounds.notify.play();
            notify.show("message", "設定のリセット", "設定をリセットしました。");
        });


        // ----- Test Play Sounds -----//
        document.getElementById("btn_eew_chk_sound").addEventListener("click", () => {
            sounds.eew.play();
            sounds.eewVoice7.play();
        });

        document.getElementById("btn_earthquake_info_chk_sound").addEventListener("click", () => {
            sounds.eqinfo.play();
            sounds.eqinfoVoice7.play();
        });

        document.getElementById("btn_eew_cancel_chk_sound").addEventListener("click", () => {
            sounds.eewVoiceCancel.play();
        });

        document.getElementById("btn_push_chk").addEventListener("click", () => {
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
        document.getElementById("openDebugLogsButton").addEventListener("click", () => {
            document.getElementById("debugLogsWindow").classList.add("active");
        });

        document.querySelector("#debugLogsWindow .closeBtn").addEventListener("click", () => {
            document.getElementById("debugLogsWindow").classList.remove("active");
        });

        // ----- Debug Logs Window -----//
        document.getElementById("openDebugLogs").addEventListener("click", () => {
            window.open(
                '/debug-logs/',
                'popupWindow',
                'width=960,height=540,top=128,left=128,scrollbars=yes,resizable=yes'
            );
        });

        // ----- Delete Debug Logs -----//
        document.getElementById("deleteDebugLogsButton").addEventListener("click", () => {
            debugLogs.delete();
            debugLogs.add("start", "[START]", "- Start log -");

            sounds.notify.play();
            notify.show("message", "デバッグログの削除", "デバッグログを削除しました。");
        });

        // ----- Debug Mode -----//
        document.getElementById("openDebugOptionButton").addEventListener("click", () => {
            document.getElementById("debugOptionWindow").classList.add("active");
        });

        document.querySelector("#debugOptionWindow .closeBtn").addEventListener("click", () => {
            document.getElementById("debugOptionWindow").classList.remove("active");
        });

        // ----- Debug Output ----- //
        if (localStorage.getItem("settings-debug-output") == 'true') {
            this.debug.output = true;
            document.querySelector("#settingsDebugOutput .toggle-switch").classList.add("on");
            this.showDebugOutput();
        } else if (localStorage.getItem("settings-debug-output") == 'false') {
            this.debug.output = false;
            document.querySelector("#settingsDebugOutput .toggle-switch").classList.remove("on");
        } else {
            this.debug.output = false;
            document.querySelector("#settingsDebugOutput .toggle-switch").classList.remove("on");
        }

        document.querySelector("#settingsDebugOutput .toggle-switch").addEventListener("click", () => {
            if (this.debug.output == false) {
                this.debug.output = true;
                localStorage.setItem('settings-debug-output', 'true');
                document.querySelector("#settingsDebugOutput .toggle-switch").classList.add("on");
                this.showDebugOutput();
            } else if (this.debug.output == true) {
                this.debug.output = false;
                localStorage.setItem('settings-debug-output', 'false');
                document.querySelector("#settingsDebugOutput .toggle-switch").classList.remove("on");
                this.hideDebugOutput();
            }
        });

        // ----- Debug Rayout ----- //
        if (localStorage.getItem("settings-debug-rayout") == 'true') {
            this.debug.rayout = true;
            document.querySelector("#settingsDebugRayout .toggle-switch").classList.add("on");
            this.showDebugRayout();
        } else if (localStorage.getItem("settings-debug-rayout") == 'false') {
            this.debug.rayout = false;
            document.querySelector("#settingsDebugRayout .toggle-switch").classList.remove("on");
        } else {
            this.debug.rayout = false;
            document.querySelector("#settingsDebugRayout .toggle-switch").classList.remove("on");
        }

        document.querySelector("#settingsDebugRayout .toggle-switch").addEventListener("click", () => {
            if (this.debug.rayout == false) {
                this.debug.rayout = true;
                localStorage.setItem('settings-debug-rayout', 'true');
                document.querySelector("#settingsDebugRayout .toggle-switch").classList.add("on");
                this.showDebugRayout();
            } else if (this.debug.rayout == true) {
                this.debug.rayout = false;
                localStorage.setItem('settings-debug-rayout', 'false');
                document.querySelector("#settingsDebugRayout .toggle-switch").classList.remove("on");
                this.hideDebugRayout();
            }
        });

        // ----- FPS ----- //
        if (localStorage.getItem("settings-fps-ms") == '100') {
            this.debug.fpsMs = 100;
            document.getElementById('settingsFpsMsSelect').value = '100';
        } else if (localStorage.getItem("settings-fps-ms") == '500') {
            this.debug.fpsMs = 500;
            document.getElementById('settingsFpsMsSelect').value = '500';
        } else if (localStorage.getItem("settings-fps-ms") == '1000') {
            this.debug.fpsMs = 1000;
            document.getElementById('settingsFpsMsSelect').value = '1000';
        } else {
            this.debug.fpsMs = 1000;
            document.getElementById('settingsFpsMsSelect').value = '1000';
        }

        document.getElementById("settingsFpsMsSelect").addEventListener("change", () => {
            if (document.getElementById('settingsFpsMsSelect').value == '100') {
                this.debug.fpsMs = 100;
                localStorage.setItem('settings-fps-ms', '100');
            } else if (document.getElementById('settingsFpsMsSelect').value == '500') {
                this.debug.fpsMs = 500;
                localStorage.setItem('settings-fps-ms', '500');
            } else if (document.getElementById('settingsFpsMsSelect').value == '1000') {
                this.debug.fpsMs = 1000;
                localStorage.setItem('settings-fps-ms', '1000');
            }
        });

        // ----- Write Debug Logs to Clipboard ----- //
        document.getElementById("writeDebugLogsToClipboardButton").addEventListener(
            "click",
            () => {
                this.writeDebugLogsToClipboard(
                    () => {
                        document.getElementById("writeDebugLogsToClipboardButton").textContent = "✅ クリップボードにコピーされました";
                        setTimeout(
                            () => {
                                document.getElementById("writeDebugLogsToClipboardButton").textContent = "ログをクリップボードにコピー";
                            },
                            3000
                        );
                    },
                    () => {
                        document.getElementById("writeDebugLogsToClipboardButton").textContent = "❌ クリップボードにコピーできませんでした";
                        setTimeout(
                            () => {
                                document.getElementById("writeDebugLogsToClipboardButton").textContent = "ログをクリップボードにコピー";
                            },
                            3000
                        );
                    }
                );
            }
        );
    }


    showDebugOutput() {
        document.getElementById("debugOutput").classList.add("active");
    }


    hideDebugOutput() {
        document.getElementById("debugOutput").classList.remove("active");
    }


    showDebugRayout() {
        document.querySelectorAll('*').forEach(function (element) {
            element.style.outline = '1px solid #00ff00ff';
        });
    }


    hideDebugRayout() {
        document.querySelectorAll('*').forEach(function (element) {
            element.style.outline = 'unset';
        });
    }


    writeDebugLogsToClipboard(onCompleted, onError) {
        if (!navigator.clipboard) {
            onError();
            return;
        }

        try {
            navigator.clipboard.writeText(JSON.stringify(this.app.services.debugLogs.debugLogs));
        } catch (error) {
            onError();
            return;
        }

        if (onCompleted) {
            onCompleted();
        }
    }
}
