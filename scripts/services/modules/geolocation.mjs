/*
 *
 * geolocation.mjs | YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

import { Service } from "../../service.mjs";


/**
 * 位置情報を管理するサービスです。
 */
export class GeoLocation extends Service {
    isSupport = null;
    isGot = false;
    area = null;


    constructor(app) {
        super(app, {
            name: "geoLocation",
            description: "位置情報を管理するサービスです。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        })

        if ("geolocation" in navigator) {
            this.isSupport = true;
        } else {
            this.isSupport = false;
            this.isGot = true;
            document.dispatchEvent(this._app.buildEvent);
        }

        this.getLocation();

    }


    /**
     * 現在位置を取得します。
    */
    async getLocation() {
        if (!this.isSupport) { return }

        // this.area = "石川県";
        // document.dispatchEvent(this._app.buildEvent);
        // return;

        navigator.geolocation.getCurrentPosition(
            async (position) => await this.onGet(position),
            (error) => this.onError(error),
            this.options
        );
    }


    /**
     * 取得した現在位置情報から市区町村または都道府県を取得します。
     */
    async onGet(position) {
        const url = "https://nominatim.openstreetmap.org/reverse?"
            + "format=json"
            + "&lat=" + position.coords.latitude
            + "&lon=" + position.coords.longitude
            + "&zoom=8"
            // + "&zoom=12"
            + "&addressdetails=1";

        await fetch(url)
            .then((response) => response.json())
            .then((data) => {
                if (data === null || data.address === null) { return }
                if (data.address.country_code !== "jp") { return }

                if (data.address.city) {
                    // 市町村
                    this.area = data.address.city;
                } else if (data.address.suburb) {
                    // 区
                    this.area = data.address.suburb;
                } else if (data.address.province) {
                    // 都道府県
                    this.area = data.address.province;
                }

            })
            .then(() => {
                if (!(this.isGot)) {
                    this.isGot = true;
                    document.dispatchEvent(this._app.buildEvent);
                }
            });
    }


    /**
     * 位置情報を取得できない際の処理を行います。
     */
    onError(error) {
        console.error(error);
    }
}