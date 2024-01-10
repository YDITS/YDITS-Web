/*
 *
 * sounds.mjs | YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

import { Service } from "../../service.mjs"


/**
 * サウンドを扱うサービスです。
 */
export class Sounds extends Service {
    notify = new Audio("https://webapp.ydits.net/sounds/notify-sound.m4a");
    eew = new Audio("https://webapp.ydits.net/sounds/eew.wav");
    eqinfo = new Audio("https://webapp.ydits.net/sounds/info.wav");
    eewVoice1 = new Audio("https://webapp.ydits.net/sounds/eew_1_v.mp3");
    eewVoice2 = new Audio("https://webapp.ydits.net/sounds/eew_2_v.mp3");
    eewVoice3 = new Audio("https://webapp.ydits.net/sounds/eew_3_v.mp3");
    eewVoice4 = new Audio("https://webapp.ydits.net/sounds/eew_4_v.mp3");
    eewVoice5 = new Audio("https://webapp.ydits.net/sounds/eew_5_v.mp3");
    eewVoice6 = new Audio("https://webapp.ydits.net/sounds/eew_6_v.mp3");
    eewVoice7 = new Audio("https://webapp.ydits.net/sounds/eew_7_v.mp3");
    eewVoice8 = new Audio("https://webapp.ydits.net/sounds/eew_8_v.mp3");
    eewVoice9 = new Audio("https://webapp.ydits.net/sounds/eew_9_v.mp3");
    eewVoiceCancel = new Audio("https://webapp.ydits.net/sounds/eew_cancel_v.mp3");
    eqinfoVoice1 = new Audio("https://webapp.ydits.net/sounds/info_1_v.mp3");
    eqinfoVoice2 = new Audio("https://webapp.ydits.net/sounds/info_2_v.mp3");
    eqinfoVoice3 = new Audio("https://webapp.ydits.net/sounds/info_3_v.mp3");
    eqinfoVoice4 = new Audio("https://webapp.ydits.net/sounds/info_4_v.mp3");
    eqinfoVoice5 = new Audio("https://webapp.ydits.net/sounds/info_5_v.mp3");
    eqinfoVoice6 = new Audio("https://webapp.ydits.net/sounds/info_6_v.mp3");
    eqinfoVoice7 = new Audio("https://webapp.ydits.net/sounds/info_7_v.mp3");
    eqinfoVoice8 = new Audio("https://webapp.ydits.net/sounds/info_8_v.mp3");
    eqinfoVoice9 = new Audio("https://webapp.ydits.net/sounds/info_9_v.mp3");


    constructor(app) {
        super(app, {
            id: "sounds",
            name: "Sound Service",
            description: "サウンドを扱うサービスです。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });
    }
}