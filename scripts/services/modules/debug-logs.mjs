/*
 *
 * debug-logs.mjs | YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

import { Service } from "../../service.mjs";


/**
 * デバッグログを管理するサービスです。
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

        this.datetime = this._app._services.datetime;

        const DEBUG_LOGS_DATA = localStorage.getItem("debugLogs");

        if (DEBUG_LOGS_DATA === null) {
            this.add("START", "[START]", "- Start log -");
        } else {
            this.debugLogs = JSON.parse(DEBUG_LOGS_DATA);
            this.debugLogs.forEach(log => {
                this.addDebugLogsHtml({
                    time: log.time,
                    type: log.type,
                    title: log.title,
                    text: log.text
                });
            });
        }
    }


    /**
     * ログを追加します。
     */
    add(type, title, text) {
        let time = `${this.datetime.year}/${('0' + this.datetime.month).slice(-2)}/${('0' + this.datetime.day).slice(-2)} ${('0' + this.datetime.hour).slice(-2)}:${('0' + this.datetime.minute).slice(-2)}:${('0' + this.datetime.second).slice(-2)}`;

        this.debugLogs.push({
            "time": time,
            "type": type,
            "title": title,
            "text": text
        });

        localStorage.setItem("debugLogs", JSON.stringify(this.debugLogs));

        this.addDebugLogsHtml(time, type, title, text);
    }


    /**
     * ログをページに追加します。
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
     * ログをすべて削除します。
     */
    delete() {
        this.debugLogs = [];
        $('#debugLogLists').html("");
        localStorage.removeItem("debugLogs");
    }
}