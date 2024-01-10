/*
 *
 * eqinfo.mjs | YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

import { Service } from "../../service.mjs";


/**
 * 地震情報を扱うサービスです。
 */
export class Eqinfo extends Service {
    eqinfoNum = 0;


    constructor(app) {
        super(app, {
            name: "eqinfo",
            description: "地震情報を扱うサービスです。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

        document.addEventListener("build", () => initialize());
    }


    /**
     * 初期化を行います。
     */
    initialize() {
        this.settings = this._app.services.settings;
        this.p2pquake = this._app.services.p2pquake;

        switch (this.settings.connect.eqinfo) {
            case "p2pquake":
                break;
        }
    }


    /**
     * 地震情報に関連するすべての通信を再接続します。
     */
    reconnect() {
        this.p2pquake.startSocket();
    }


    /**
     * 地震情報に関連するすべての接続を切断します。
     */
    disconnect() {
        this.p2pquake.socket.close();
    }


    /**
     * 地震履歴に地震情報を追加します。
     */
    addToList(data) {
        let html = `
            <li class="list list-${data["num"]}">
                <div class="maxScale">
                    <p>${data["maxInt"]}</p>
                </div>

                <div class="right">
                    <p class="hypocenter">${data["hypocenter"]}</p>
                    <p>${data["datetime"]}</p>
                    <div class="hypoInfo">
                        <p>${data["depth"]}</p>
                        <p>${data["magnitude"]}</p>
                    </div>
                    <p>${data["tsunami"]}</p>
                </div>
            </li>
        `;

        if (data["isFirst"]) {
            $('#eqHistoryField').append(html);
        } else {
            $('#eqHistoryField').prepend(html);
        }

        $(`#eqHistoryField>.list-${data["num"]}>.maxScale`).css({
            'background-color': data["bgcolor"],
            'color': data["color"]
        });
    }
}