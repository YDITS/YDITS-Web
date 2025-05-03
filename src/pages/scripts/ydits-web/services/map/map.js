/**!
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the Apache License 2.0.
 *
 */

import { Service } from "../../../packages/app-creator/src/service.js";

/**
 * マップを扱う。
 */
export class Map extends Service {
    /**
     * @param {App} app
     */
    constructor(app) {
        super(app, {
            name: "map",
            description: "マップを扱うサービス。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone",
        });
    }


    static DEFAULT_CENTER = [137.5930000, 36.0047000];
    static DEFAULT_ZOOM = 4;
    static HRPNS_TIMES_URI = "https://www.jma.go.jp/bosai/himawari/data/satimg/targetTimes_jp.json";
    static TROPICAL_CYCLONE_TARGET_URI = "https://www.jma.go.jp/bosai/typhoon/data/targetTc.json";
    static DEFAULT_CIRCLE_OPTIONS = { steps: 64, units: "meters", propreties: { foo: "bar" } };


    /**
     * Element: 雨雲レーダー時刻
     * @type {HTMLElement}
     */
    get $hrpnsTime() {
        if (!(this.#_$hrpnsTime instanceof HTMLElement)) {
            this.#_$hrpnsTime = document.querySelector("#hrpnsTime");
        }

        return this.#_$hrpnsTime;
    }


    /**
     * Element: 雨雲レーダー時刻テキスト
     * @type {HTMLElement}
     */
    get $hrpnsTimeText() {
        if (!(this.#_$hrpnsTimeText instanceof HTMLElement)) {
            this.#_$hrpnsTimeText = document.querySelector("#hrpnsTime>.text");
        }

        return this.#_$hrpnsTimeText;
    }


    /**
     * 位置情報サービスがサポートされているかどうか
     * @type {boolean}
     */
    get isGeolocationSupported() {
        if (this.#_$isGeolocationSupported === undefined) {
            this.#_$isGeolocationSupported = "geolocation" in navigator;
        }

        return this.#_$isGeolocationSupported;
    }


    /**
     * 雨雲レーダー（高解像度降水ナウキャスト/HRPNS）の画像URLを取得する
     * @param {string} baseTime 
     * @param {string} validTime 
     * @returns {string}
     */    
    hrpnsImageUri(baseTime, validTime) {
        return `https://www.jma.go.jp/bosai/jmatile/data/nowc/${baseTime}/none/${validTime}/surf/hrpns/{z}/{x}/{y}.png`;
    }


    /**
     * 台風予想進路図のURLを取得する
     * @param {*} tropicalCycloneNumber 
     * @returns {string}
     */
    tropicalCycloneForecastUrl(tropicalCycloneNumber) {
        return `https://www.jma.go.jp/bosai/typhoon/data/${tropicalCycloneNumber}/forecast.json`;
    }


    /**
     * 初期化する
     * @returns {Promise<void>}
     */
    async initialize() {
        this.app.services.notify.show("message", "", `${this.name}をイニシャライズしています…`);

        await this.#initializeMaps();

        this.map.once("load", async () => {
            this.userPointImage = await this.map.loadImage('/images/user_point.png');
            this.regionImage = await this.map.loadImage('/images/hypocenter.png');

            await this.map.addImage(`userPointImage`, this.userPointImage.data);
            await this.map.addImage(`eewRedionImage`, this.regionImage.data);

            await this.showHrpns();
            await this.showTyphoon();
        });

        if (!this.isGeolocationSupported) { return }

        document.addEventListener("getLocation", async () => await this.updateUserPoint());

        this.app.services.notify.show("message", `${this.app.name} Ver ${this.app.version.string}`, "");
    }


    /**
     * ユーザーポイントの表示を更新する
     * @returns {Promise<void>}
     */
    async updateUserPoint() {
        try {
            const isGeolocationSupported = this.app?.services?.geoLocation?.isSupported;

            if (!isGeolocationSupported) return;

            const isDisplayUserPoint = this.app?.services?.settings?.map?.displayUserPoint;
            const userPointSource = await this.map.getSource("userPointSource");

            if (!isDisplayUserPoint) {
                await this.#removeUserPoint(userPointSource);
                return;
            }

            const userLngLat = [this.app.services.geoLocation.longitude, this.app.services.geoLocation.latitude];

            if (!userPointSource) {
                await this.#createUserPoint(userLngLat);
                return;
            }

            await userPointSource.setData({
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: userLngLat,
                        },
                    },
                ],
            });
        } catch (error) {
            throw new Error(`Unhandled error at updateUserPoint: ${error.message}`, { error: error.stack });
        }
    }


    /**
     * ユーザーポイントのソースとレイヤーを作成する
     * @param {*} lngLat - ユーザーポイントの緯度経度
     * @returns {Promise<void>}
     */
    async #createUserPoint(lngLat) {
        await this.map.addSource(`userPointSource`, {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: lngLat,
                        },
                    },
                ],
            },
        });

        await this.map.addLayer({
            id: `userPoint`,
            type: "symbol",
            source: `userPointSource`,
            layout: {
                "icon-image": `userPointImage`,
                "icon-size": 0.25,
            },
        });
    }


    /**
     * ユーザーポイントのソースとレイヤーを削除する
     * @param {any} userPointSource - ユーザーポイントのソース
     * @returns {Promise<void>}
     */
    async #removeUserPoint(userPointSource) {
        if (!userPointSource) return;
        await this.map.removeLayer("userPoint");
        await this.map.removeSource("userPointSource");
    }


    /**
     * 日時文字列をフォーマットする
     * @param {string} datetime - 'yyyyMMDDHHmm' 形式の日時文字列
     * @returns {string} - 'HH:mm' 形式の日時文字列
     */
    #formatDatetime(datetime) {
        const year = datetime.slice(0, 4);
        const month = datetime.slice(4, 6) - 1;
        const day = datetime.slice(6, 8);
        const hour = datetime.slice(8, 10);
        const minute = datetime.slice(10, 12);
        const date = new Date(Date.UTC(year, month, day, hour, minute));
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }


    /**
     * 雨雲レーダー（高解像度降水ナウキャスト/HRPNS）を更新する
     * @returns {Promise<void>}
     */
    async updateHrpns() {
        if (!this.isDisplayHrpns) {
            return;
        }

        this.showHrpns();
    }


    /**
     * 雨雲レーダー（高解像度降水ナウキャスト/HRPNS）を表示する
     * @returns {Promise<void>}
     */
    async showHrpns() {
        this.isDisplayHrpns = true;

        this.hrpnsLatestTargetTime = await this.getHrpnsTargetTime();
        const url = this.hrpnsImageUri(this.hrpnsLatestTargetTime.basetime, this.hrpnsLatestTargetTime.validtime);

        if (this.map.getSource("hrpns-source")) {
            this.map.removeLayer("hrpns");
            this.map.removeSource("hrpns-source");
        }

        await this.map.addSource('hrpns-source', {
            'type': 'raster',
            'tiles': [url],
            'tileSize': 256,
        });

        await this.map.addLayer({
            id: "hrpns",
            source: "hrpns-source",
            type: "raster",
            paint: {
                "raster-opacity": 0.7,
            },
        });

        this.$hrpnsTimeText.textContent = this.#formatDatetime(this.hrpnsLatestTargetTime.validtime);
        this.$hrpnsTime.classList.add("show");
    }


    /**
     * 雨雲レーダー（高解像度降水ナウキャスト/HRPNS）を非表示する
     * @returns {Promise<void>}
     */
    async hideHrpns() {
        this.isDisplayHrpns = false;
        this.map.removeLayer("hrpns");
        this.$hrpnsTime.classList.remove("show");
        this.$hrpnsTimeText.textContent = "";
    }


    /**
     * 雨雲レーダー（高解像度降水ナウキャスト/HRPNS）の最新URLを返す
     * @returns {Promise<any>}
     */
    async getHrpnsTargetTime() {
        const time = await this.fetchHrpnsTargetTime();
        const latestData = time[time.length - 1];
        return latestData;
    }


    /**
     * 雨雲レーダー（高解像度降水ナウキャスト/HRPNS）のターゲットURLを取得する
     * @returns {Promise<any>}
     */
    async fetchHrpnsTargetTime() {
        try {
            const response = await fetch(Map.HRPNS_TIMES_URI);
            if (!response.ok) {
                throw new Error(`Error fetching rain map data: Status ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching rain map data: ${error}`);
        }
    }


    /**
     * 台風情報（予想進路図）を更新する
     * @returns {Promise<void>}
     */
    async updateTyphoon() {
        if (!this.typhoon) {
            this.hideTyphoon();
        }
        await this.showTyphoon();
    }


    /**
     * 台風情報（予想進路図）を表示する
     * @returns {Promise<void>}
     */
    async showTyphoon() {
        this.tropicalCycloneLatestTarget = await this.getTropicalCycloneTarget();
        if (!this.tropicalCycloneLatestTarget) return;

        this.tropicalCycloneLatestTarget.forEach(async target => {
            const url = this.tropicalCycloneForecastUrl(target);

            let data = await fetch(url);
            data = await data.json();

            if (Array.isArray(data)) {
                let titleData = data.find(item => item.part && item.part === "title");
                let analysisData = data.find(item => item.part && item.part.en === "Analysis");
                let forecast12h = data.find(item => item.part && item.part.en === "Forecast for 12 hours ahead");
                let forecast24h = data.find(item => item.part && item.part.en === "Forecast for 24 hours ahead");
                let forecast45h = data.find(item => item.part && item.part.en === "Forecast for 45 hours ahead");
                let forecast48h = data.find(item => item.part && item.part.en === "Forecast for 48 hours ahead");
                let forecast72h = data.find(item => item.part && item.part.en === "Forecast for 72 hours ahead");
                let forecast96h = data.find(item => item.part && item.part.en === "Forecast for 96 hours ahead");
                let forecast120h = data.find(item => item.part && item.part.en === "Forecast for 120 hours ahead");

                if (analysisData && analysisData.track && analysisData.track.typhoon) {
                    // 台風進路の座標を抽出
                    const typhoonTrack = analysisData.track.typhoon.map(point => [point[0], point[1]]);

                    // 進路ポリラインを追加
                    const polyline = L.polyline(typhoonTrack, { color: '#ffffff', weight: 1 }).addTo(this.typhoon);

                    // 台風の中心位置にマーカーを追加
                    if (analysisData.center) {
                        L.marker([analysisData.center[0], analysisData.center[1]], {
                            icon: L.icon({
                                iconUrl: "./images/close_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.svg",
                                iconSize: [24, 24]
                            })
                        })
                            .bindPopup(`台風中心: [${analysisData.center[0]}, ${analysisData.center[1]}]`)
                            .addTo(this.typhoon);
                    }
                }

                // 予報円と強風域を追加
                this.addForecastCircle(forecast12h);
                this.addForecastCircle(forecast24h);
                this.addForecastCircle(forecast45h);
                this.addForecastCircle(forecast48h);
                this.addForecastCircle(forecast72h);
                this.addForecastCircle(forecast96h);
                this.addForecastCircle(forecast120h);

                // 強風域を表示
                if (analysisData && analysisData.galeWarningArea) {
                    this.addGaleWarningArea(analysisData.galeWarningArea, titleData.typhoonNumber.slice(-2).replace(/^0+/, ''));
                }
            } else {
                console.error('Error: Data is not an array.');
            }

            this.$hrpnsTime.text(this.#formatDatetime(this.hrpnsLatestTargetTime["validtime"]));
        });
    }


    /**
     * 予報円を追加する
     * @param {Object} forecast - 予報円の情報
     * @param {Array} forecast.center - 予報円の中心座標
     * @param {Object} forecast.probabilityCircle - 予報円の情報
     * @param {number} forecast.probabilityCircle.radius - 予報円の半径
     * @param {Array} forecast.probabilityCircle.tangent - 予報円の接線座標
     * @param {string} forecast.validtime - 予報の時刻
     * @return {Promise<void>}
     */
    async addForecastCircle(forecast) {
        if (forecast && forecast.center && forecast.probabilityCircle) {
            const center = forecast.center;
            const radius = forecast.probabilityCircle.radius;
            const validtime = new Date(forecast.validtime["JST"]); // 予報の時刻

            const circleJSON = turf.circle([center[1], center[0]], (radius * 2), Map.DEFAULT_CIRCLE_OPTIONS);

            this.map.addSource("typhoonForecastCircleSource", {
                type: "geojson",
                data: circleJSON,
            });

            this.map.addLayer({
                id: "typhoonForecastCirle",
                type: "circle",
                source: "typhoonForecastCircleSource",
                "source-layer": "typhoonForecastCircleSource",
                paint: {
                    "circle-color": "#ffffff",
                    "circle-opacity": 0.2,
                    "circle-stroke-width": 1,
                    "circle-stroke-color": "#ffffff"
                }
            });

            // 予報円の接線をラインで表示
            forecast.probabilityCircle.tangent.forEach(tangent => {
                const line = tangent.map(point => [point[0], point[1]]);
                this.map.addLayer({
                    id: "typhoonForecastLine",
                    type: "line",
                    paint: {
                        "line-color": "#ffffff",
                        "line-translate": line,
                        "line-dasharray": [5, 5],
                        "line-width": 1,
                    },
                })
            });

            this.map.addLayer({
                id: "typhoonForecastTime",
                type: "symbol",
                minzoom: 5,
                paint: {
                    "text-field": `${validtime.getDate()}日${validtime.getHours()}時`,
                    "text-size": 16,
                    "text-color": "#ffffff",
                },
            });
        }
    }


    /**
     * 強風域を追加する
     * @param {Object} galeWarningArea - 強風域の情報
     * @param {string} typhoonNumber - 台風番号
     * @return {Promise<void>}
     */
    async addGaleWarningArea(galeWarningArea, typhoonNumber) {
        const center = galeWarningArea.center;
        const radius = galeWarningArea.radius;
        L.circle([center[0], center[1]], {
            color: '#ffee00',
            fillColor: '#ffee00',
            fillOpacity: 0.3,
            radius: radius,
            weight: 1
        }).addTo(this.typhoon);

        L.marker([center[0], center[1]], {
            icon: L.divIcon({
                className: 'warning-icon',
                html: `<div class="warning-time">${typhoonNumber}号</div>`,
                iconSize: [100, 40],
                minZoom: 6
            })
        }).addTo(this.typhoon);
    }


    /**
     * 台風情報（予想進路図）を非表示する
     * @returns {Promise<void>}
     */
    async hideTyphoon() {
        this.map.removeLayer(this.typhoon);
        this.typhoon = null;
        // this.updateLayers();
    }


    /**
     * 台風情報（予想進路図）の最新URLを返す
     * @returns {Promise<any>}
     */
    async getTropicalCycloneTarget() {
        try {
            const tcs = await this.fetchTropicalCycloneTarget();
            if (!tcs || tcs.length <= 0) return null;

            const datas = tcs.map(item => item.tropicalCyclone);

            if (datas) { return datas; }
            else { return null; }
        } catch (error) {
            console.error("An error occurred when parsing tropical cyclone JSON data: ", error);
        }
    }


    /**
     * 台風情報（予想進路図）のターゲットURLを取得する
     * @returns {Promise<any>}
     */
    async fetchTropicalCycloneTarget() {
        try {
            const response = await fetch(Map.TROPICAL_CYCLONE_TARGET_URI);
            if (!response.ok) {
                throw new Error(`Error fetching rain map data: Status ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching rain map data: ${error}`);
            return null;
        }
    }


    /**
     * マップの描画を更新する
     * @param {*} dateNow
     * @returns {void}
     */
    update(dateNow) {
        try {
            if (!this.app.services.api.yahooKmoni.isEew) {
                if (!this.isDisplayHrpns) this.showHrpns();
                this.#clearEewLayers();
                return;
            }

            Object.keys(this.app.services.eew.reports).forEach((id) => {
                if (id === "undefined" || this.app.services.eew.reports[id].isWarning) return;

                if (this.app.services.eew.currentId === id) {
                    if (!this.app.services.eew.reports[id].isMapInitialized) {
                        this.#addEewLayers(id);
                    }

                    this.app.services.eew.reports[id].latitude = this.app.services.eew.reports[id].latitude.replace("N", "");
                    this.app.services.eew.reports[id].longitude = this.app.services.eew.reports[id].longitude.replace("E", "");

                    this.app.services.eew.reports[id].sRadius = this.app.services.eew.reports[id].psWave.sRadius * 1000;
                    this.app.services.eew.reports[id].pRadius = this.app.services.eew.reports[id].psWave.pRadius * 1000;

                    if (this.app.services.eew.reports[id].sRadius != this.app.services.eew.reports[id].lastSWave) {
                        this.app.services.eew.reports[id].sWaveInterval = (this.app.services.eew.reports[id].sRadius - this.app.services.eew.reports[id].lastSWave) / (60 * ((dateNow - this.#loopCount) / 1000));
                        this.app.services.eew.reports[id].lastSWave = this.app.services.eew.reports[id].sRadius;
                        this.app.services.eew.reports[id].sWavePut = this.app.services.eew.reports[id].sRadius;
                    } else if (this.app.services.eew.reports[id].sRadius == this.app.services.eew.reports[id].lastSWave) {
                        this.app.services.eew.reports[id].sWavePut += this.app.services.eew.reports[id].sWaveInterval;
                    }

                    if (this.app.services.eew.reports[id].pRadius != this.app.services.eew.reports[id].lastPWave) {
                        this.app.services.eew.reports[id].pWaveInterval = (this.app.services.eew.reports[id].pRadius - this.app.services.eew.reports[id].lastPWave) / (60 * ((dateNow - this.#loopCount) / 1000));
                        this.app.services.eew.reports[id].lastPWave = this.app.services.eew.reports[id].pRadius;
                        this.app.services.eew.reports[id].pWavePut = this.app.services.eew.reports[id].pRadius;
                        this.#loopCount = dateNow;
                    } else if (this.app.services.eew.reports[id].pRadius == this.app.services.eew.reports[id].lastPWave) {
                        this.app.services.eew.reports[id].pWavePut += this.app.services.eew.reports[id].pWaveInterval;
                    }
                } else {
                    this.app.services.eew.reports[id].sWavePut += this.app.services.eew.reports[id].sWaveInterval;
                    this.app.services.eew.reports[id].pWavePut += this.app.services.eew.reports[id].pWaveInterval;
                }

                const REGION_LNGLAT = [this.app.services.eew.reports[id].longitude, this.app.services.eew.reports[id].latitude];
                const sWaveCircleJSON = turf.circle(REGION_LNGLAT, this.app.services.eew.reports[id].sWavePut, Map.DEFAULT_CIRCLE_OPTIONS);
                const pWaveCircleJSON = turf.circle(REGION_LNGLAT, this.app.services.eew.reports[id].pWavePut, Map.DEFAULT_CIRCLE_OPTIONS);

                this.map.getSource(`eewRedionSource_${id}`).setData({
                    type: 'FeatureCollection',
                    features: [
                        {
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: REGION_LNGLAT,
                            },
                        },
                    ],
                });
                this.map.getSource(`eewSWaveSource_${id}`).setData(sWaveCircleJSON);
                this.map.getSource(`eewPWaveSource_${id}`).setData(pWaveCircleJSON);
            });

            if (this.app.services.settings.map.autoMove) {
                this.#autoMoveMap(dateNow);
            }
        } catch (error) {
            console.error(error);
            this.app.services.debugLogs.add("error", `[${this.name}]`, `EEW Map update error: ${error.stack}`);
        }
    }


    /**
     * マップを自動で移動する
     * @param {number} dateNow - 現在の日時
     * @return {void}
     */
    #autoMoveMap(dateNow) {
        if (dateNow - this.#autoMoveCount >= 3000) {
            const report = this.app.services.eew.reports[this.app.services.eew.currentId];
            if (report.pWavePut >= 560000) {
                this.setView([report.longitude, report.latitude], 5);
            } else if (report.pWavePut >= 280000) {
                this.setView([report.longitude, report.latitude], 6);
            } else if (report.pWavePut > 0) {
                this.setView([report.longitude, report.latitude], 7);
            }
            this.#autoMoveCount = dateNow;
        }
    }


    /**
     * 緊急地震速報（EEW）のレイヤーを追加する
     * @param {string} id - EEWのID
     * @returns {void}
     */
    #addEewLayers(id) {
        this.hideHrpns();

        const sWaveCircleJSON = turf.circle([0, 0], 0, Map.DEFAULT_CIRCLE_OPTIONS);
        const pWaveCircleJSON = turf.circle([0, 0], 0, Map.DEFAULT_CIRCLE_OPTIONS);

        this.map.addSource(`eewRedionSource_${id}`, {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [0, 0],
                        },
                    },
                ],
            },
        });

        this.map.addLayer({
            id: `eewRedion_${id}`,
            type: "symbol",
            source: `eewRedionSource_${id}`,
            layout: {
                "icon-image": `eewRedionImage`,
                "icon-size": 0.25,
            },
        });

        this.map.addSource(`eewSWaveSource_${id}`, {
            type: "geojson",
            data: sWaveCircleJSON,
        });

        this.map.addLayer({
            id: `eewSWave_${id}`,
            type: "line",
            source: `eewSWaveSource_${id}`,
            paint: {
                "line-width": 1,
                "line-color": "#ff4020",
            },
        });

        this.map.addSource(`eewPWaveSource_${id}`, {
            type: "geojson",
            data: pWaveCircleJSON,
        });

        this.map.addLayer({
            id: `eewPWave_${id}`,
            type: "line",
            source: `eewPWaveSource_${id}`,
            paint: {
                "line-width": 1,
                "line-color": "#4080ff",
            },
        });

        this.app.services.eew.reports[id].isMapInitialized = true;
    }


    /**
     * 緊急地震速報（EEW）のレイヤーをクリアする
     * @returns {void}
     */
    #clearEewLayers() {
        Object.keys(this.app.services.eew.reports).forEach(id => {
            if (id !== "undefined" && !this.app.services.eew.reports[id].isWarning) {
                this.map.removeLayer(`eewRedion_${id}`);
                this.map.removeLayer(`eewSWave_${id}`);
                this.map.removeLayer(`eewPWave_${id}`);
                this.map.removeSource(`eewRedionSource_${id}`);
                this.map.removeSource(`eewSWaveSource_${id}`);
                this.map.removeSource(`eewPWaveSource_${id}`);
                delete this.app.services.eew.reports[id];
            }
        });
    }


    /**
     * マップを移動する
     * @param {L.LatLng} latLng - 移動先の緯度経度
     * @param {number} zoom - ズームレベル
     * @returns {Promise<void>}
     */
    async setView(lngLat, zoom) {
        await this.map.flyTo({
            center: lngLat,
            zoom: zoom,
            speed: 2.0,
            curve: 1.0,
            bearing: 0,
            pitch: 0,
        });
    }


    /**
     * マップを初期位置に移動する
     * @returns {Promise<void>}
     */
    async setViewHome() {
        await this.setView(Map.DEFAULT_CENTER, Map.DEFAULT_ZOOM);
    }


    /**
     * マップインスタンスを初期化する
     * @returns {Promise<void>}
     */
    async #initializeMaps() {
        try {
            this.map = await new maplibregl.Map({
                container: "map",
                style: `https://api.maptiler.com/maps/ba979b60-0cf8-4087-8cdc-5bb919540c08/style.json?key=${Map.#MAPTILER_API_KEY}`,
                center: Map.DEFAULT_CENTER,
                zoom: Map.DEFAULT_ZOOM,
                maxZoom: 9,
                minZoom: 3,
                attributionControl: {
                    compact: true,
                    customAttribution: "© 気象庁",
                },
            });
        } catch (error) {
            throw new Error(`Could not initialize map: ${error.message}`, { error: error.stack });
        }
    }


    /**
     * MapTiler APIキー
     * @type {string}
     */
    static #MAPTILER_API_KEY = "3ft2uVdfAwtgfKQGIT8U";


    /**
     * マップのループカウント
     * @type {number}
     */
    #loopCount = -1;


    /**
     * マップ自動移動のカウント
     * @type {number | null}
     */
    #autoMoveCount = null;


    /**
     * Element: 雨雲レーダー時刻
     * @type {HTMLElement}
     */
    #_$hrpnsTime;

    
    /**
     * Element: 雨雲レーダー時刻テキスト
     * @type {HTMLElement}
     */
    #_$hrpnsTimeText;


    /**
     * 位置情報サービスがサポートされているかどうか
     * @type {boolean}
     */
    #_$isGeolocationSupported;
}
