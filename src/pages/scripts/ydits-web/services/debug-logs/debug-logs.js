/**!
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

/**
 * デバッグログを管理する。
 */
export class DebugLogs extends Service {
    debugLogs = [];


    constructor(app) {
        super(app, {
            name: "debugLogs",
            description: "デバッグログを管理するサービス。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

        this.debugLogListsElement = document.getElementById("debugLogLists");

        const DEBUG_LOGS_DATA = localStorage.getItem("debugLogs");

        if (DEBUG_LOGS_DATA === null) {
            this.add("start", `[${this.name}]`, "- Start log -");
        } else {
            this.debugLogs = JSON.parse(DEBUG_LOGS_DATA);
            this.debugLogs = this.limitter(this.debugLogs, 200);
            this.saveLogsToLocalStorage();
            this.debugLogs.forEach(log => {
                this.addDebugLogsHtml({
                    type: log.type,
                    time: log.time,
                    title: log.title,
                    text: log.text
                });
            });
        }

        if (this.app.isDebugLogsMode) {
            this.lastDebugLogs = [];

            setInterval(
                () => {
                    const DEBUG_LOGS_DATA = localStorage.getItem("debugLogs");

                    if (DEBUG_LOGS_DATA === null) {
                        this.add("start", `[${this.name}]`, "- Start log -");
                    } else {
                        this.debugLogs = JSON.parse(DEBUG_LOGS_DATA);
                        this.debugLogListsElement.innerHTML = "";

                        this.debugLogs.forEach(log => {
                            this.addDebugLogsHtml({
                                type: log.type,
                                time: log.time,
                                title: log.title,
                                text: log.text
                            });
                        });
                    }
                },
                1000
            )
        }
    }


    /**
     * ログを追加する。
     */
    async add(type, title, text) {
        const time = this.formatDatetime(this.app.services.datetime);

        const logEntry = {
            type: type,
            time: time,
            title: title,
            text: text
        };

        this.debugLogs.push(logEntry);
        this.debugLogs = this.limitter(this.debugLogs, 200);
        this.saveLogsToLocalStorage();
        this.addDebugLogsHtml(logEntry);
    }

    /**
     * 日付と時刻を指定のフォーマットで整形する。
     * @param {Datetime} datetime - 整形対象の Datetime オブジェクト
     * @returns {string} - 整形された日付と時刻の文字列
     */
    formatDatetime(datetime) {
        return (
            `${datetime.fullYear}/` +
            `${this.zeroPadding(datetime.month)}/` +
            `${this.zeroPadding(datetime.date)} ` +
            `${this.zeroPadding(datetime.hours)}:` +
            `${this.zeroPadding(datetime.minutes)}:` +
            `${this.zeroPadding(datetime.seconds)}`
        );
    }

    /**
     * ゼロ埋めを行う。
     * @param {number} num - ゼロ埋めする数値
     * @returns {string} - ゼロ埋めされた文字列
     */
    zeroPadding(num) {
        return num.toString().padStart(2, '0');
    }


    /**
     * ログをlocalStorageに保存する。
     */
    saveLogsToLocalStorage() {
        localStorage.setItem("debugLogs", JSON.stringify(this.debugLogs));
    }


    /**
     * ログをページに追加する。
     */
    async addDebugLogsHtml(log) {
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

        this.debugLogListsElement.innerHTML = `
            <li>
                <h3 class="title" style="color: ${color};">${log.title} ${log.time}</h3>
                <p class="text">${log.text}</p>
            </li>
        ` + this.debugLogListsElement.innerHTML;
    }


    /**
     * ログをすべて削除する。
     */
    async delete() {
        this.debugLogs = [];
        this.debugLogListsElement.innerHTML = "";
        localStorage.removeItem("debugLogs");
    }


    /**
     * 指定の数値までのログを残す。
     */
    limitter(array, limit) {
        if (array.length > limit) {
            return array.slice(array.length - limit);
        } else {
            return array;
        }
    }
}
