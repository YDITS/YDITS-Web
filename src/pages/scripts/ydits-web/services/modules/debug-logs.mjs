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
 * デバッグログを管理する。
 */
export class DebugLogs extends Service {
    debugLogs = [];


    constructor(app) {
        super(app, {
            name: "debugLogs",
            description: "デバッグログを管理するサービスです。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        })

        const DEBUG_LOGS_DATA = localStorage.getItem("debugLogs");

        if (DEBUG_LOGS_DATA === null) {
            this.add("start", "[START]", "- Start log -");
        } else {
            this.debugLogs = JSON.parse(DEBUG_LOGS_DATA);
            this.debugLogs.forEach(log => {
                this.addDebugLogsHtml({
                    type: log.type,
                    time: log.time,
                    title: log.title,
                    text: log.text
                });
            });
        }
    }


    /**
     * ログを追加する。
     */
    add(type, title, text) {
        let time =
            `${this.app.services.datetime.fullYear}/` +
            `${('0' + this.app.services.datetime.month).slice(-2)}/` +
            `${('0' + this.app.services.datetime.date).slice(-2)} ` +
            `${('0' + this.app.services.datetime.hours).slice(-2)}:` +
            `${('0' + this.app.services.datetime.minutes).slice(-2)}:` +
            `${('0' + this.app.services.datetime.seconds).slice(-2)}`;

        this.debugLogs.push({
            type: type,
            time: time,
            title: title,
            text: text
        });

        localStorage.setItem("debugLogs", JSON.stringify(this.debugLogs));

        this.addDebugLogsHtml({
            type: type,
            time: time,
            title: title,
            text: text
        });
    }


    /**
     * ログをページに追加する。
     */
    addDebugLogsHtml(log) {
        let color = null;

        switch (log.type) {
            case "info":
                color = "#6060ffff";
                break;

            case "start":
                color = "#6060ffff";
                break;

            case "error":
                color = "#ff6060ff";
                break;

            case "network":
                color = "#60ff60ff";
                break;

            default:
                color = "#ffffffff";
                break;
        }

        $('#debugLogLists').prepend(`
            <li>
                <h3 class="title" style="color: ${color};">${log.title} ${log.time}</h3>
                <p class="text">${log.text}</p>
            </li>
        `);
    }


    /**
     * ログをすべて削除する。
     */
    delete() {
        this.debugLogs = [];
        $('#debugLogLists').html("");
        localStorage.removeItem("debugLogs");
    }
}