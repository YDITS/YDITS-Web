/*!
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 * Licensed under the Apache License 2.0.
 *
 * https://github.com/YDITS/YDITS-Web
 *
 */

import { Service } from "../../../packages/app-creator/src/service.js";
import { YditsWeb } from "../../ydits-web.js";

/**
 * サウンドを扱う。
 */
export class Sounds extends Service {
    /**
     * @param {YditsWeb} app
     */
    constructor(app) {
        super(app, {
            name: "sounds",
            description: "サウンドを扱うサービス。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

        this.app = app;
    }

    /**
     * アプリケーションインスタンス
     * @type {YditsWeb}
     * @override
     */
    app;

    /**
     * 通知音
     */
    notify = new Audio("./sounds/notify-sound.m4a");

    /**
     * 緊急地震速報 - 効果音
     */
    eew = new Audio("./sounds/eew.wav");

    /**
     * 緊急地震速報(警報) - 音声
     */
    eewWarnVoice = new Audio("./sounds/eew_warn_v.mp3");

    /**
     * 地震情報 - 効果音
     */
    eqinfo = new Audio("./sounds/info.wav");

    /**
     * 緊急地震速報(予報) 震度1 - 音声
     */
    eewVoice1 = new Audio("./sounds/eew_1_v.mp3");

    /**
     * 緊急地震速報(予報) 震度2 - 音声
     */
    eewVoice2 = new Audio("./sounds/eew_2_v.mp3");

    /**
     * 緊急地震速報(予報) 震度3 - 音声
     */
    eewVoice3 = new Audio("./sounds/eew_3_v.mp3");

    /**
     * 緊急地震速報(予報) 震度4 - 音声
     */
    eewVoice4 = new Audio("./sounds/eew_4_v.mp3");

    /**
     * 緊急地震速報(予報) 震度5弱 - 音声
     */
    eewVoice5 = new Audio("./sounds/eew_5_v.mp3");

    /**
     * 緊急地震速報(予報) 震度5強 - 音声
     */
    eewVoice6 = new Audio("./sounds/eew_6_v.mp3");

    /**
     * 緊急地震速報(予報) 震度6弱 - 音声
     */
    eewVoice7 = new Audio("./sounds/eew_7_v.mp3");

    /**
     * 緊急地震速報(予報) 震度6強 - 音声
     */
    eewVoice8 = new Audio("./sounds/eew_8_v.mp3");

    /**
     * 緊急地震速報(予報) 震度7 - 音声
     */
    eewVoice9 = new Audio("./sounds/eew_9_v.mp3");

    /**
     * 緊急地震速報(予報) 震度1 - 音声
     */
    eewVoiceCancel = new Audio("./sounds/eew_cancel_v.mp3");

    /**
     * 地震情報 震度1 - 音声
     */
    eqinfoVoice1 = new Audio("./sounds/info_1_v.mp3");

    /**
     * 地震情報 震度2 - 音声
     */
    eqinfoVoice2 = new Audio("./sounds/info_2_v.mp3");

    /**
     * 地震情報 震度3 - 音声
     */
    eqinfoVoice3 = new Audio("./sounds/info_3_v.mp3");

    /**
     * 地震情報 震度4 - 音声
     */
    eqinfoVoice4 = new Audio("./sounds/info_4_v.mp3");

    /**
     * 地震情報 震度5弱 - 音声
     */
    eqinfoVoice5 = new Audio("./sounds/info_5_v.mp3");

    /**
     * 地震情報 震度5強 - 音声
     */
    eqinfoVoice6 = new Audio("./sounds/info_6_v.mp3");

    /**
     * 地震情報 震度6弱 - 音声
     */
    eqinfoVoice7 = new Audio("./sounds/info_7_v.mp3");

    /**
     * 地震情報 震度6強 - 音声
     */
    eqinfoVoice8 = new Audio("./sounds/info_8_v.mp3");

    /**
     * 地震情報 震度7 - 音声
     */
    eqinfoVoice9 = new Audio("./sounds/info_9_v.mp3");
}
