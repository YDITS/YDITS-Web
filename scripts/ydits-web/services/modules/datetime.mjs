/*
 *
 * YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

'use strict';

import { Service } from "../../service.mjs";

/**
 * 現在時刻を管理するサービスです。
 */
export class Datetime extends Service {
    get fullYear() { return this.gmt.getFullYear(); }
    get month() { return this.gmt.getMonth() + 1; }
    get date() { return this.gmt.getDate(); }
    get hours() { return this.gmt.getHours(); }
    get minutes() { return this.gmt.getMinutes(); }
    get seconds() { return this.gmt.getSeconds(); }


    gmtFetchError(error) {
        return new Error(`Failed to get the GMT time: ${error}`);
    }


    constructor(app) {
        super(app, {
            name: "datetime",
            description: "現在時刻を管理するサービスです。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });
    }


    /**
     * 現在時刻を取得します。
     */
    update() {
        try {
            if (navigator.onLine) {
                this.getGmt();
            } else {
                this.gmt = new Date();
            }
        } catch (error) {
            console.error(error);
        }
    }


    /**
     * サーバーヘッダーから現在時刻を取得します。
     */
    getGmt() {
        axios.head(
            window.location.href,
            {
                headers: { 'Cache-Control': 'no-cache' }
            }
        )
            .then((response) => {
                this.gmt = new Date(response.headers.date);
            })
            .catch((error) => {
                throw this.gmtFetchError(error);
            });
    }
}
