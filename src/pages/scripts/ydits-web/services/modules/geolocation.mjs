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
 * 位置情報を管理する。
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


        this.$locationStatus = $("#locationStatus");
        this.$locationArea = $("#locationArea");
        this.$locationAccuracy = $("#locationAccuracy");

        if ("geolocation" in navigator) {
            this.isSupport = true;
            this.$locationStatus.text("有効");
        } else {
            this.isSupport = false;
            this.latitude = -1;
            this.longitude = -1;
            this.$locationStatus.text("無効");
        }

        this.getLocation();
    }


    /**
     * 現在位置を取得する。
    */
    async getLocation() {
        if (!this.isSupport) { return }

        navigator.geolocation.getCurrentPosition(
            async (position) => await this.onGet(position),
            (error) => this.onError(error),
            this.options
        );
    }


    /**
     * 取得した現在位置情報から市区町村または都道府県を取得する。
     */
    async onGet(position) {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;

        if ([undefined, null, NaN].includes(position.coords.accuracy)) {
            this.accuracy = -1;
            this.$locationAccuracy.text(`不明`);
        } else {
            this.accuracy = Math.round(position.coords.accuracy);
            this.$locationAccuracy.text(`半経距離 ${this.accuracy}m 程度`);
        }

        const urlPref = "https://nominatim.openstreetmap.org/reverse?"
            + "format=json"
            + "&lat=" + position.coords.latitude
            + "&lon=" + position.coords.longitude
            + "&zoom=8"
            + "&addressdetails=1";

        const urlCity = "https://nominatim.openstreetmap.org/reverse?"
            + "format=json"
            + "&lat=" + position.coords.latitude
            + "&lon=" + position.coords.longitude
            + "&zoom=12"
            + "&addressdetails=1";

        await fetch(
            urlCity,
            {
                headers: {
                    "Accept-Language": "ja-JP"
                }
            }
        )
            .then((response) => response.json())
            .then(async (data) => {
                if (data === null || data.address === undefined) { return }
                if (data.address.country_code !== "jp") { return }


                if (data.address.city) {
                    this.city = data.address.city;
                    this.suburb = data.address.suburb;

                    // 〇区
                    if (typeof this.suburb === "string") {
                        if (this.suburb.indexOf("区") !== -1) {
                            this.city = this.app.services.eew.removeCity(this.city) + this.suburb;
                        }
                    }

                    // 同じ市名
                    if (["府中市", "伊達市"].includes(this.city)) {
                        await fetch(urlPref)
                            .then((response) => response.json())
                            .then((data) => {
                                this.pref = data.address.province;

                                switch (this.pref) {
                                    case "東京都":
                                        this.city = "東京府中市";
                                        break;

                                    case "広島県":
                                        this.city = "広島府中市";
                                        break;

                                    case "北海道":
                                        this.city = "胆振伊達市";
                                        break;

                                    case "福島県":
                                        this.city = "福島伊達市";
                                        break;
                                }
                            });
                    }
                } else if (data.address.suburb) {
                    // 区
                    this.city = data.address.suburb;

                    if (["北区", "南区", "西区"].includes(this.city)) {
                        this.province = data.address.province;
                        this.area = this.app.services.eew.removePref(this.province) + this.city;
                    }
                } else if (data.address.town) {
                    // 町村
                    this.city = data.address.town;
                }
            })
            .then(() => {
                this.getJmaForecastArea(this.city);
            })
            .then(() => {
                if (!(this.isGot)) {
                    this.isGot = true;
                    document.dispatchEvent(this.app.buildEvent);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }


    /**
     * 位置情報を取得できない際の処理を行う。
     */
    onError(error) {
        this.app.services.debugLogs.add(
            "error",
            `[${this.name}]`,
            "Geo Location is supported, but Cannot get current global position."
        )

        this.$locationStatus.text("無効");
        this.latitude = -1;
        this.longitude = -1;
        this.accuracy = -1;

        if (!(this.isGot)) {
            this.isGot = true;
            document.dispatchEvent(this.app.buildEvent);
        }
    }


    /**
    * 取得した市区町村から、気象庁 緊急地震速報/地方予報区 を取得する。
    */
    getJmaForecastArea(city) {
        fetch("./data/jma_area_forecast_local_e.json")
            .then((response) => response.json())
            .then((data) => {
                if (data === null) { return }

                if (city in data) {
                    this.area = data[city];
                }

                this.$locationArea.text(this.area);
            });
    }
}