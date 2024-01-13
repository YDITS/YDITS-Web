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
 * 気象庁防災情報電文を扱うサービスです。
 */
export class JmaDataFeed extends Service {
    url = "https://www.data.jma.go.jp/developer/xml/feed/eqvol.xml";


    constructor(app) {
        super(app, {
            name: "jmaDataFeed",
            description: "気象庁防災情報電文を扱うサービスです。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

        $(document).on('click', '#jmaDataFeed .closeBtn', function () {
            $('#jmaDataFeed').removeClass('active');
        });

        $(document).on('click', '#openJmaDataFeedEqvol', function () {
            $('#jmaDataFeedEqvol').addClass('active');
        });
        $(document).on('click', '#jmaDataFeedEqvol .closeBtn', function () {
            $('#jmaDataFeedEqvol').removeClass('active');
        });

        $(document).on('click', '#openJmaDataFeedEqvolLong', function () {
            $('#jmaDataFeedEqvolLong').addClass('active');
        })
        $(document).on('click', '#jmaDataFeedEqvolLong .closeBtn', function () {
            $('#jmaDataFeedEqvolLong').removeClass('active');
        })

        this.eqvolList = $("#jmaDataFeedEqvolList");
        this.eqvolLongList = $("#jmaDataFeedEqvolLongList");
    }


    /**
     * 気象庁防災情報電文を更新します。
     */
    update() {
        /*
        fetch(this.url)
            .then((response) => {
                const parser = new DOMParser();
                const data = parser.parseFromString(response, "application/xml");
                // const data = parser.parseFromString(response, "text/html");
                return data;
            })
            .then((data) => {
                const body = data.body
                const entries = body.getElementsByTagName("entry");

                entries.forEach(element => { });
            })
            .catch((error) => {
                console.error(error);
            });

        // Do this 2023-12-22 02:03
        // Do this 2023-12-24 22:54
        this.eqvolList.prepend(`
            <li>
                <h3 class="title" style="color: #ffffffff;">title</h3>
                <p class="text">text</p>
            </li>
        `);
        */
    }
}
