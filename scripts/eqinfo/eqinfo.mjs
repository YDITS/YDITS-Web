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

import { P2pquake } from "./p2pquake.mjs";


export class Eqinfo {
    constructor(debugLogs, notify, settings, sounds) {
        this.eqinfoNum = 0;
        this.p2pquake = new P2pquake(debugLogs, notify, settings, sounds, this.addToList);
    }


    init(settings) {
        this.settings = settings;
        switch (this.settings.connect.eqinfo) {
            case "p2pquake":
                break;
        }
    }


    reconnect() {
        this.p2pquake.startSocket();
    }


    disconnect() {
        this.p2pquake.socket.close();
    }


    addToList(data) {
        console.debug("Added");

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