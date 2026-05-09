/*!
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
import { YditsWeb } from "../../ydits-web.js";
import { LocalStorage } from "../local-storage/local-storage.js";
import { Notify } from "../notify/notify.js";

/**
 * 位置情報を管理する。
 */
export class GeoLocation extends Service {
    /**
     * デバイスにキャッシュされた位置情報を受け入れる時間[ms]
     */
    static #getLocationMaximumAgeMs = 1000 * 10;

    /**
     * 位置情報の測位タイムアウト[ms]
     */
    static #getLocationTimeoutMs = 1000 * 180;

    /**
     * 正確な位置情報を要求するかどうか
     */
    static #getLocationEnableHighAccuracy = false;

    /**
     * Nominatim Reverse API (緯度経度->地域名) のベースURL
     */
    static #nominatimReverseUrl = new URL("https://nominatim.openstreetmap.org/reverse");

    /**
     * @param {YditsWeb} app
     */
    constructor(app) {
        super(app, {
            name: "geoLocation",
            description: "位置情報を管理するサービス。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        })

        this.app = app;

        this.app.services.notify.showNotify({
            type: Notify.types.message,
            title: "",
            body: `${this.name}をイニシャライズしています…`
        });

        this.#getLocationEvent = new Event("getLocation");
        this.#cacheLocationArea = this.#localStorage.cacheLocationArea;
        this._area = null;

        // this.#render();
        document.dispatchEvent(this.app.buildEvent);

        this.#getLocation();
    }

    /**
     * アプリケーションインスタンス
     * @type {YditsWeb}
     * @override
     */
    app;

    /**
     * @returns {string} 現在地の地方予報区
     */
    get area() {
        /* 位置情報を取得できない場合はキャッシュを代入し、キャッシュがない場合は仮値を代入する。 */
        if (!this.isGot) {
            this._area = this.#cacheLocationArea ? this.#cacheLocationArea : "東京都23区";
        }

        return this._area;
    }

    set area(value) {
        this._area = value;
        this.#render();
    }

    /**
     * レンダリングキューフラグ
     */
    #renderQueued = false;

    /**
     * @returns {string | null} キャッシュされた地区予報区
     */
    #cacheLocationArea;

    /**
     * 位置情報に対応しているかどうか。
     * @returns {boolean} 位置情報に対応している場合は true を返す。
     */
    get isSupported() {
        return "geolocation" in window.navigator;
    }

    /**
     * 位置情報を取得したかどうか。
     * @returns {boolean} 位置情報を取得済みの場合は true を返す。
     */
    #_isGot = false;

    get isGot() {
        return this.#_isGot;
    }

    set isGot(value) {
        this.#_isGot = value;
        this.#render();
    }

    /**
     * 現在地の緯度
     * @type {number | null}
     */
    latitude = null;

    /**
     * 現在地の経度
     * @type {number | null}
     */
    longitude = null;

    /**
     * 位置情報の精度
     * @type {number | null}
     */
    #_accuracy = null;

    get accuracy() {
        return this.#_accuracy;
    }

    set accuracy(value) {
        this.#_accuracy = value;
        this.#render();
    }

    /**
     * 現在地の市区町村
     * @type {string | null}
     */
    city = null;

    /**
     * Nominatim Reverse API の都道府県を返すURLを生成する
     * @param {{
     *     latitude: number,
     *     longitude: number,
     * }} coords
     * @returns {URL}
     */
    generateNominatimUrlGetPref({
        latitude,
        longitude,
    }) {
        const urlOfGetPref = new URL(GeoLocation.#nominatimReverseUrl);
        urlOfGetPref.searchParams.set("format", "json");
        urlOfGetPref.searchParams.set("lat", String(latitude));
        urlOfGetPref.searchParams.set("lon", String(longitude));
        urlOfGetPref.searchParams.set("zoom", "8");
        urlOfGetPref.searchParams.set("addressdetails", "1");
        return urlOfGetPref;
    }

    /**
     * Nominatim Reverse API の市区町村を返すURLを生成する
     * @param {{
     *     latitude: number,
     *     longitude: number,
     * }} coords
     * @returns {URL}
     */
    generateNominatimUrlGetCity({
        latitude,
        longitude,
    }) {
        const urlOfGetCity = new URL(GeoLocation.#nominatimReverseUrl);
        urlOfGetCity.searchParams.set("format", "json");
        urlOfGetCity.searchParams.set("lat", String(latitude));
        urlOfGetCity.searchParams.set("lon", String(longitude));
        urlOfGetCity.searchParams.set("zoom", "12");
        urlOfGetCity.searchParams.set("addressdetails", "1");
        return urlOfGetCity;
    }

    /**
     * 位置情報を取得したときのイベントのインスタンス
     * @type {Event}
     */
    #getLocationEvent;

    /**
     * ローカルストレージサービスのインスタンス
     */
    #localStorage = new LocalStorage(this.app);

    get #locationAreaText() {
        return this.isGot ? this.area : `${this.area} (キャッシュ)`;
    }

    get #locationStatusText() {
        return this.isGot ? "有効" : "無効";
    }

    get #locationAccuracyText() {
        if (!this.isGot) {
            return "";
        }

        if (Number.isFinite(this.accuracy)) {
            return `半経距離 ${this.accuracy}m 程度`;
        } else {
            return "不明";
        }
    }

    /**
     * レンダリングする
     * @returns {void}
     */
    #render() {
        if (!this.#renderQueued) {
            this.#renderQueued = true;
            requestAnimationFrame(() => {
                const $locationStatus = this.app.services.elementsManager.getElementById("locationStatus");
                const $locationArea = this.app.services.elementsManager.getElementById("locationArea");
                const $locationAccuracy = this.app.services.elementsManager.getElementById("locationAccuracy");
                $locationStatus.textContent = this.#locationStatusText;
                $locationArea.textContent = this.#locationAreaText;
                $locationAccuracy.textContent = this.#locationAccuracyText;
                this.#renderQueued = false;
            });
        }
    }

    /**
     * 現在位置を取得する。
    */
    async #getLocation() {
        if (!this.isSupported) {
            return;
        }

        this.app.services.notify.showNotify({
            type: Notify.types.message,
            title: "",
            body: "位置情報を取得しています…",
        });

        navigator.geolocation.getCurrentPosition(
            (position) => this.#onGet(position),
            (error) => this.#onError(error),
            {
                maximumAge: GeoLocation.#getLocationMaximumAgeMs,
                timeout: GeoLocation.#getLocationTimeoutMs,
                enableHighAccuracy: GeoLocation.#getLocationEnableHighAccuracy,
            }
        );
    }

    /**
     * 位置情報を取得したとき  現在位置情報から市区町村または都道府県を取得する。
     * @param {GeolocationPosition} position
     */
    async #onGet(position) {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.accuracy = Math.round(position.coords.accuracy);

        const urlOfGetCity = this.generateNominatimUrlGetCity({
            latitude: this.latitude,
            longitude: this.longitude,
        })

        const response = await fetch(
            urlOfGetCity,
            {
                headers: {
                    "Accept-Language": "ja-JP",
                },
            }
        )

        const data = await response.json();

        if (data === null || data?.["address"] == null) {
            this.app.services.debugLogs.add(
                "error",
                `[${this.name}]`,
                `Could not find current location area: the response is invaild.`
            );
            return;
        }

        const countryCode = data?.["address"]?.["country_code"];

        if (countryCode !== "jp") {
            this.app.services.debugLogs.add(
                "info",
                `[${this.name}]`,
                `Current location is outside of Japan.`
            );
            return;
        }

        const city = data?.["address"]?.["city"];

        if (city) {
            this.city = city;
            this.suburb = data?.["address"]?.["suburb"];

            // 〇区
            if (
                typeof this.suburb === "string" &&
                this.suburb.includes("区")
            ) {
                this.city = this.app.services.eew.removeCity(this.city) + this.suburb;
            }

            if (typeof this.city !== "string") {
                return;
            }

            // 同じ市名
            if (["府中市", "伊達市"].includes(this.city)) {
                const urlOfGetPref = this.generateNominatimUrlGetPref({
                    latitude: this.latitude,
                    longitude: this.longitude,
                })

                const response = await fetch(urlOfGetPref);
                const data = await response.json();
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
            }
        } else if (data?.["address"]?.["suburb"]) {
            // 区
            this.city = data?.["address"]?.["suburb"];

            if (typeof this.city !== "string") {
                return;
            }

            if (["北区", "南区", "西区"].includes(this.city)) {
                this.province = data?.["address"]?.["province"];
                this.area = this.app.services.eew.removePref(this.province) + this.city;
            }
        } else if (data.address.town) {
            // 町村
            this.city = data.address.town;
        }

        if (typeof this.city !== "string") {
            return;
        }

        await this.#getJmaForecastArea(this.city);

        this.isGot = true;
        await this.app.services.map.updateUserPoint();
        // document.dispatchEvent(this.app.buildEvent);
    }

    /**
     * 位置情報の取得に失敗したとき
     * @param {GeolocationPositionError} error 
     */
    #onError(error) {
        let errorMessage = `Could not get the current user location: ${error.message}`;

        this.app.services.debugLogs.add(
            "error",
            `[${this.name}]`,
            errorMessage
        );

        this.isGot = false;
    }

    /**
    * 取得した市区町村から、気象庁 緊急地震速報/地方予報区 を取得する。
    * @param {string} city
    */
    async #getJmaForecastArea(city) {
        try {
            const response = await fetch("./data/jma_area_forecast_local_e.json");
            const data = await response.json();

            if (!data || !(city in data)) {
                return;
            };

            this.isGot = true;
            this.area = data[city];

            this.#localStorage.cacheLocationArea = this.area;
            // this.#render();

            document.dispatchEvent(this.#getLocationEvent);

            this.app.services.notify.showNotify({
                type: Notify.types.message,
                title: `${this.app.name} Ver ${this.app.version.string}`,
                body: "",
            });
        } catch (error) {
            console.error(error);

            this.app.services.debugLogs.add(
                "error",
                `[${this.name}]`,
                `Could not get jma forecast area of the current user location: ${error.stack}`
            );
        }
    }
}
