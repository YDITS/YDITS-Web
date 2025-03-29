/*
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the Apache License 2.0.
 *
 */

import { Service } from "../../../service.mjs";
import { LocalStorage } from "./local-storage.mjs";

/**
 * 位置情報を管理する。
 */
export class GeoLocation extends Service {
    constructor(app) {
        super(app, {
            name: "geoLocation",
            description: "位置情報を管理するサービスです。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        })

        this.app.services.notify.show("message", "", `${this.name}をイニシャライズしています…`);
        
        this.__getLocationEvent = null;
        this.__localStorage = null;

        this._area = null;
        this._cacheLocationArea = null;
        this._isGot = null;
        this._isSupported = null;
        this._latitude = null;
        this._longitude = null;
        this._$locationAccuracy = null;
        this._$locationArea = null;
        this._$locationStatus = null;

        this.updateDisplay();
        document.dispatchEvent(this.app.buildEvent);

        this.getLocation();
    }


    updateDisplay() {
        this.$locationStatus.textContent = this.locationStatusText;
        this.$locationAccuracy.textContent = this.isGot ? `半経距離 ${this.accuracy}m 程度` : "";
        this.$locationArea.textContent = this.isGot ? this.area : `${this.area} (キャッシュ)`;
    }


    /**
     * 現在位置を取得する。
    */
    async getLocation() {
        if (!this.isSupported) { return }

        this.app.services.notify.show("message", "", `位置情報を取得しています…`);

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
        this.app.services.notify.show("message", "", `現在地を処理しています…`);

        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;

        if ([undefined, null, NaN].includes(position.coords.accuracy)) {
            this.accuracy = -1;
            this.$locationAccuracy.textContent = `不明`;
        } else {
            this.accuracy = Math.round(position.coords.accuracy);
            this.updateDisplay();
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
                    this.app.services.map.updateUserPoint();
                    // document.dispatchEvent(this.app.buildEvent);
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
            `Geo location is supported, but could not get current user position: ${error}`
        );

        this.updateDisplay();
    }


    /**
    * 取得した市区町村から、気象庁 緊急地震速報/地方予報区 を取得する。
    */
    getJmaForecastArea(city) {
        this.app.services.notify.show("message", "", `現在地の地区予報区を取得しています…`);

        fetch("./data/jma_area_forecast_local_e.json")
            .then((response) => response.json())
            .then((data) => {
                if (data === null) { return }

                if (city in data) {
                    this.area = data[city];
                    this.isGot = true;
                }

                this._localStorage.cacheLocationArea = this.area;
                this.updateDisplay();

                document.dispatchEvent(this._getLocationEvent);

                this.app.services.notify.show("message", `${this.app.name} Ver ${this.app.version.string}`, "");
            });
    }


    /**
     * @returns {string} 現在地の地区予報区
     */
    get area() {
        /* 位置情報を取得できない場合はキャッシュを代入し、キャッシュがない場合は仮値を代入する。 */
        if (!this.isGot) {
            this._area = typeof this.cacheLocationArea === "string" ? this.cacheLocationArea : "東京都23区";
        }

        return this._area;
    }


    set area(value) {
        this._area = value;
    }


    /**
     * @returns {string} キャッシュされた地区予報区
     */
    get cacheLocationArea() {
        if (this._cacheLocationArea === null) {
            this._cacheLocationArea = this._localStorage.cacheLocationArea;
        }

        return this._cacheLocationArea;
    }


    get locationStatusText() {
        return this.isGot ? "有効" : "無効";
    }


    /**
     * 位置情報に対応しているかどうか。
     * @returns {boolean} 位置情報に対応している場合は true を返す。
     */
    get isSupported() {
        if (this._isSupported === null) {
            this._isSupported = "geolocation" in window.navigator;
        }

        return this._isSupported;
    }


    /**
     * 位置情報を取得したかどうか。
     * @returns {boolean} 位置情報を取得済みの場合は true を返す。
     */
    get isGot() {
        return this._isGot;
    }


    set isGot(value) {
        this._isGot = value;
    }


    /**
     * 現在地の緯度
     */
    get latitude() {
        return this.isSupported ? this._latitude : null;
    }


    set latitude(value) {
        this._latitude = value;
    }


    /**
     * 現在地の経度
     */
    get longitude() {
        return this.isSupported ? this._longitude : null;
    }


    set longitude(value) {
        this._longitude = value;
    }


    get _getLocationEvent() {
        if (this.__getLocationEvent === null) {
            this.__getLocationEvent = new Event("getLocation");
        }

        return this.__getLocationEvent;
    }


    get _localStorage() {
        if (this.__localStorage === null) {
            this.__localStorage = new LocalStorage(this.app);
        }

        return this.__localStorage;
    }


    /* Elements */

    get $locationStatus() {
        if (this._$locationStatus === null) {
            this._$locationStatus = document.getElementById("locationStatus");
        }

        return this._$locationStatus;
    }

    get $locationArea() {
        if (this._$locationArea === null) {
            this._$locationArea = document.getElementById("locationArea");
        }

        return this._$locationArea;
    }

    get $locationAccuracy() {
        if (this._$locationAccuracy === null) {
            this._$locationAccuracy = document.getElementById("locationAccuracy");
        }

        return this._$locationAccuracy;
    }
}
