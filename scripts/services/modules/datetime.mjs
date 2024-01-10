/*
 *
 * datetime.mjs | YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

import { Service } from "../../service.mjs";


/**
 * 現在時刻を管理するサービスです。
 */
export class Datetime extends Service {
    gmt = null;
    year = null;
    month = null;
    day = null;
    hour = null;
    minute = null;
    second = null;


    constructor(app) {
        super(app, {
            name: "datetime",
            description: "現在時刻を管理するサービスです。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

        document.addEventListener("build", () => console.log("a"))
    }


    /**
     * 現在時刻を取得します。
     */
    async update() {
        try {
            if (navigator.onLine) {
                this.gmt = this.getGmt();
            } else {
                this.gmt = new Date();
            }

            this.year = this.gmt.getFullYear();
            this.month = this.gmt.getMonth() + 1;
            this.day = this.gmt.getDate();
            this.hour = this.gmt.getHours();
            this.minute = this.gmt.getMinutes();
            this.second = this.gmt.getSeconds();
        } catch (error) {
            console.error(error);
        }
    }


    /**
     * サーバーヘッダーから現在時刻を取得します。
     */
    async getGmt() {
        await axios.head(
            window.location.href,
            {
                headers: { 'Cache-Control': 'no-cache' }
            }
        )
            .then((response) => {
                return new Date(response.headers.date);
            })
            .catch((error) => { });
    }
}
