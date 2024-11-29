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
 * 現在時刻を管理する。
 */
export class Datetime extends Service {
    constructor(app) {
        super(app, {
            name: "datetime",
            description: "現在時刻を管理するサービスです。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

        this.gmt = new Date();
    }


    get gmt() {
        if (!this._gmt) {
            return new Date();
        }

        return this._gmt;
    }


    set gmt(value) {
        this._gmt = value;
    }


    get fullYear() { return this.gmt.getFullYear(); }
    get month() { return this.gmt.getMonth() + 1; }
    get date() { return this.gmt.getDate(); }
    get hours() { return this.gmt.getHours(); }
    get minutes() { return this.gmt.getMinutes(); }
    get seconds() { return this.gmt.getSeconds(); }


    /**
     * 現在時刻を更新する。
     */
    update() {
        try {
            if (navigator.onLine) {
                this.gmt = this.fetchGmt();
            } else {
                this.gmt = new Date();
            }
        } catch (error) {
            this.app.services.debugLogs.add(
                "error",
                `[${this.name}]`,
                `Failed to update datetime: ${error}`,
            );
        }
    }


    /**
     * サーバーヘッダーから現在時刻を取得する。
     */
    fetchGmt() {
        let time = null;

        axios.head(
            window.location.href,
            {
                headers: { 'Cache-Control': 'no-cache' }
            }
        )
            .then((response) => {
                time = new Date(response.headers.date);
            })
            .catch((error) => {
                this.app.services.debugLogs.add(
                    "error",
                    `[${this.name}]`,
                    `Failed to fetch gmt: ${error}`,
                );

                time = new Date();
            });

        return time;
    }
}
