/**!
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

        this.typhoonLayerIds = [];
        this.typhoonSourceIds = [];
        this.typhoonMarkers = [];
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
            this.typhoonCenterImage = await this.map.loadImage('/images/typhoon_center.png');

            await this.map.addImage(`userPointImage`, this.userPointImage.data);
            await this.map.addImage(`eewRedionImage`, this.regionImage.data);
            await this.map.addImage(`typhoonCenterImage`, this.typhoonCenterImage.data);

            await this.showHrpns();
            await this.displayTyphoon();
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
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: lngLat,
                },
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
        await this.hideHrpns();

        if (this.app.services.api.yahooKmoni.isEew) return;

        this.isDisplayHrpns = true;

        this.hrpnsLatestTargetTime = await this.getHrpnsTargetTime();
        const url = this.hrpnsImageUri(this.hrpnsLatestTargetTime.basetime, this.hrpnsLatestTargetTime.validtime);

        const zoomPairs = [2, 4, 6, 8, 10];

        for (const z of zoomPairs) {
            const sIdOdd = `hrpns-source-${z}-o`;
            const lIdOdd = `hrpns-${z}-o`;
            const sIdEven = `hrpns-source-${z}-e`;
            const lIdEven = `hrpns-${z}-e`;

            await this.map.addSource(sIdOdd, {
                'type': 'raster',
                'tiles': [url],
                'tileSize': 64, // Display tiles map zoom level +2 (×4)
                'minzoom': z,
                'maxzoom': z
            });

            await this.map.addLayer({
                id: lIdOdd,
                source: sIdOdd,
                type: "raster",
                minzoom: z - 2,
                maxzoom: z - 1,
                paint: {
                    "raster-opacity": 0.7,
                    "raster-resampling": "nearest",
                    "raster-fade-duration": 0
                },
            });

            await this.map.addSource(sIdEven, {
                'type': 'raster',
                'tiles': [url],
                'tileSize': 128, // Display tiles map zoom level +1 (×2)
                'minzoom': z,
                'maxzoom': z
            });

            await this.map.addLayer({
                id: lIdEven,
                source: sIdEven,
                type: "raster",
                minzoom: z - 1,
                maxzoom: z,
                paint: {
                    "raster-opacity": 0.7,
                    "raster-resampling": "nearest",
                    "raster-fade-duration": 0
                },
            });
        }

        this.$hrpnsTimeText.textContent = this.#formatDatetime(this.hrpnsLatestTargetTime.validtime);
        this.$hrpnsTime.classList.add("show");
    }

    /**
     * 雨雲レーダー（高解像度降水ナウキャスト/HRPNS）を非表示する
     * @returns {Promise<void>}
     */
    async hideHrpns() {
        this.isDisplayHrpns = false;

        const zoomPairs = [2, 4, 6, 8, 10];
        for (const z of zoomPairs) {
            const suffixes = ['o', 'e'];
            for (const s of suffixes) {
                const layerId = `hrpns-${z}-${s}`;
                const sourceId = `hrpns-source-${z}-${s}`;
                if (this.map.getLayer(layerId)) this.map.removeLayer(layerId);
                if (this.map.getSource(sourceId)) this.map.removeSource(sourceId);
            }
        }

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
        await this.removeTyphoon();
        await this.displayTyphoon();
    }

    /**
     * 台風情報（予想進路図）を表示する
     * @returns {Promise<void>}
     */
    async displayTyphoon() {
        this.removeTyphoon();

        if (this.app.services.api.yahooKmoni.isEew) return;

        this.isDisplayTyphoon = true;
        this.tropicalCycloneLatestTarget = await this.getTropicalCycloneTarget();
        if (!this.tropicalCycloneLatestTarget) return;


        this.tropicalCycloneLatestTarget.forEach(async (target) => {
            const url = this.tropicalCycloneForecastUrl(target);
            const typhoonId = target;

            let data = await fetch(url);
            data = await data.json();

            if (Array.isArray(data)) {
                const titleData = data.find(item => item.part && item.part === "title");
                const analysisData = data.find(item => item.part && item.part.en === "Analysis");
                const forecasts = data.filter(item => item.part && item.part.en && item.part.en.startsWith("Forecast for"));

                if (analysisData && analysisData.galeWarningArea) {
                    const typhoonNumber = titleData.typhoonNumber.slice(-2).replace(/^0+/, '');
                    this.addWarningAreas(analysisData.stormWarningArea, analysisData.galeWarningArea, typhoonId);
                    this.addTyphoonNumber(
                        typhoonId,
                        [analysisData.galeWarningArea.center?.[1], analysisData.galeWarningArea.center?.[0]],
                        analysisData.center,
                        typhoonNumber
                    );
                }

                forecasts.forEach((forecast, index) => this.addForecastCircles(forecast, `${typhoonId}_${index}`));

                if (analysisData && analysisData.track && analysisData.track.typhoon) {
                    if (analysisData.center) {
                        const centerSourceId = `typhoonCenterSource_${typhoonId}`;
                        this.map.addSource(centerSourceId, {
                            type: "geojson",
                            data: {
                                type: 'Feature',
                                geometry: {
                                    type: 'Point',
                                    coordinates: [analysisData.center[1], analysisData.center[0]],
                                },
                            },
                        });
                        this.typhoonSourceIds.push(centerSourceId);

                        const centerLayerId = `typhoonCenterLayer_${typhoonId}`;
                        this.map.addLayer({
                            id: centerLayerId,
                            type: 'symbol',
                            source: centerSourceId,
                            layout: {
                                "symbol-sort-key": 1,
                                "icon-image": `typhoonCenterImage`,
                                "icon-size": 1,
                            },
                        });
                        this.typhoonLayerIds.push(centerLayerId);
                    }

                    const preTyphoonTrackCoords = analysisData.track.preTyphoon.map(point => [point[1], point[0]]);
                    const typhoonTrackCoords = analysisData.track.typhoon.map(point => [point[1], point[0]]);

                    const trackPreSourceId = `preTyphoonTrackSource_${typhoonId}`;
                    this.map.addSource(trackPreSourceId, {
                        type: 'geojson',
                        data: {
                            type: 'Feature',
                            geometry: {
                                type: 'LineString',
                                coordinates: preTyphoonTrackCoords,
                            },
                        },
                    });
                    const trackPreLayerId = `preTyphoonTrackLayer_${typhoonId}`;
                    this.map.addLayer({
                        id: trackPreLayerId,
                        type: 'line',
                        source: trackPreSourceId,
                        paint: {
                            'line-color': '#ffffff',
                            'line-width': 0.5,
                            'line-dasharray': [5, 5],
                            'line-opacity': 0.5,
                        },
                    });
                    this.typhoonSourceIds.push(trackPreSourceId);
                    this.typhoonLayerIds.push(trackPreLayerId);

                    const trackSourceId = `typhoonTrackSource_${typhoonId}`;
                    this.map.addSource(trackSourceId, {
                        type: 'geojson',
                        data: {
                            type: 'Feature',
                            geometry: {
                                type: 'LineString',
                                coordinates: typhoonTrackCoords,
                            },
                        },
                    });
                    const trackLayerId = `typhoonTrackLayer_${typhoonId}`;
                    this.map.addLayer({
                        id: trackLayerId,
                        type: 'line',
                        source: trackSourceId,
                        paint: {
                            'line-color': '#ffffff',
                            'line-width': 0.5,
                            'line-opacity': 0.5,
                        },
                    });
                    this.typhoonSourceIds.push(trackSourceId);
                    this.typhoonLayerIds.push(trackLayerId);
                }
            } else {
                console.error('Error: Data is not an array.');
            }
        });
    }

    /**
     * 予報円を追加する
     * @param {Object} forecast - 予報円の情報
     * @param {string} forecastId - 予報のユニークID
     * @return {Promise<void>}
     */
    async addForecastCircles(forecast, forecastId) {
        if (forecast && forecast.center && forecast.probabilityCircle) {
            const center = [forecast.center[1], forecast.center[0]];
            const radius = forecast.probabilityCircle.radius;
            const validtime = new Date(forecast.validtime["JST"]);

            const circleJSON = turf.circle(center, radius, Map.DEFAULT_CIRCLE_OPTIONS);

            const circleSourceId = `typhoonForecastCircleSource_${forecastId}`;
            this.map.addSource(circleSourceId, {
                type: "geojson",
                data: circleJSON,
            });
            this.typhoonSourceIds.push(circleSourceId);

            const circleLayerId = `typhoonForecastCircleLayer_${forecastId}`;
            this.map.addLayer({
                id: circleLayerId,
                type: "fill",
                source: circleSourceId,
                paint: {
                    "fill-color": "#ffffff",
                    "fill-opacity": 0.2,
                }
            });
            this.typhoonLayerIds.push(circleLayerId);

            const circleStrokeLayerId = `typhoonForecastCircleStrokeLayer_${forecastId}`;
            this.map.addLayer({
                id: circleStrokeLayerId,
                type: "line",
                source: circleSourceId,
                paint: {
                    "line-color": "#ffffff",
                    "line-width": 0.5,
                }
            });
            this.typhoonLayerIds.push(circleStrokeLayerId);

            if (forecast.probabilityCircle.tangent) {
                forecast.probabilityCircle.tangent.forEach((tangent, index) => {
                    const lineCoords = tangent.map(point => [point[1], point[0]]);
                    const tangentId = `${forecastId}_${index}`;
                    const tangentSourceId = `typhoonTangentSource_${tangentId}`;
                    this.map.addSource(tangentSourceId, {
                        type: 'geojson',
                        data: {
                            type: 'Feature',
                            geometry: {
                                type: 'LineString',
                                coordinates: lineCoords,
                            },
                        },
                    });
                    const tangentLayerId = `typhoonTangentLayer_${tangentId}`;
                    this.map.addLayer({
                        id: tangentLayerId,
                        type: 'line',
                        source: tangentSourceId,
                        paint: {
                            'line-color': '#ffffff',
                            'line-dasharray': [5, 5],
                            'line-width': 0.5,
                        },
                    });
                    this.typhoonSourceIds.push(tangentSourceId);
                    this.typhoonLayerIds.push(tangentLayerId);
                });
            }

            const timeSourceId = `typhoonForecastTimeSource_${forecastId}`;
            this.map.addSource(timeSourceId, {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: center,
                    },
                },
            });
            const timeLayerId = `typhoonForecastTimeLayer_${forecastId}`;
            this.map.addLayer({
                id: timeLayerId,
                type: "symbol",
                source: timeSourceId,
                layout: {
                    "symbol-sort-key": 0,
                    "text-field": `${validtime.getDate()}日${validtime.getHours()}時`,
                    "text-size": 14,
                    "text-font": ["Noto Sans JP Regular"],
                    "text-allow-overlap": true,
                    "text-anchor": "top",
                    "text-offset": [0, 0.5],
                },
                paint: {
                    "text-color": "#ffffff",
                    "text-halo-width": 2,
                    "text-halo-color": "rgba(0, 0, 0, 0.4)",
                },
            });
            this.typhoonSourceIds.push(timeSourceId);
            this.typhoonLayerIds.push(timeLayerId);
        }
    }

    /**
     * 台風番号を追加する
     * @param {string} typhoonId - 台風のユニークID
     * @param {*} galeWarningAreaCenter
     * @param {*} typhoonCenter
     * @param {number} typhoonNumber
     */
    async addTyphoonNumber(typhoonId, galeWarningAreaCenter, typhoonCenter, typhoonNumber) {
        const center = galeWarningAreaCenter ?? typhoonCenter;

        const numberSourceId = `typhoonNumberSource_${typhoonId}`;
        this.map.addSource(numberSourceId, {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: center,
                },
            },
        });
        const numberLayerId = `typhoonNumberLayer_${typhoonId}`;
        this.map.addLayer({
            id: numberLayerId,
            type: "symbol",
            source: numberSourceId,
            layout: {
                "symbol-sort-key": 0,
                "text-field": `${typhoonNumber}号`,
                "text-size": 14,
                "text-font": ["Noto Sans JP Regular"],
                "text-allow-overlap": true,
                "text-anchor": "top",
                "text-offset": [0, 0.5]
            },
            paint: {
                "text-color": "#ffffff",
                "text-halo-width": 2,
                "text-halo-color": "rgba(0, 0, 0, 0.4)",
            },
        });
        this.typhoonSourceIds.push(numberSourceId);
        this.typhoonLayerIds.push(numberLayerId);
    }

    /**
     * 暴風域と強風域を追加する
     * @param {Object} galeWarningArea - 強風域の情報
     * @param {string} typhoonId - 台風のユニークID
     * @return {Promise<void>}
     */
    async addWarningAreas(stormWarningArea, galeWarningArea, typhoonId) {
        if (galeWarningArea) {
            const galeWarningAreaCenter = [galeWarningArea.center?.[1], galeWarningArea.center?.[0]];
            const galeWarningAreaRadius = galeWarningArea.radius;
            const galeWarningAreaCircleJSON = turf.circle(galeWarningAreaCenter, galeWarningAreaRadius, Map.DEFAULT_CIRCLE_OPTIONS);

            const galeSourceId = `typhoonGaleSource_${typhoonId}`;
            this.map.addSource(galeSourceId, {
                type: "geojson",
                data: galeWarningAreaCircleJSON,
            });
            this.typhoonSourceIds.push(galeSourceId);

            const galeLayerId = `typhoonGaleLayer_${typhoonId}`;
            this.map.addLayer({
                id: galeLayerId,
                type: "fill",
                source: galeSourceId,
                paint: {
                    "fill-color": '#e0e000',
                    "fill-opacity": 0.3,
                }
            });
            this.typhoonLayerIds.push(galeLayerId);

            const galeStrokeLayerId = `typhoonGaleStrokeLayer_${typhoonId}`;
            this.map.addLayer({
                id: galeStrokeLayerId,
                type: "line",
                source: galeSourceId,
                paint: {
                    "line-color": '#e0e000',
                    "line-width": 0.5,
                }
            });
            this.typhoonLayerIds.push(galeStrokeLayerId);
        }

        if (stormWarningArea) {
            const stormWarningAreaCenter = [stormWarningArea.arc?.[0]?.[0]?.[1], stormWarningArea.arc?.[0]?.[0]?.[0]];
            const stormWarningAreaRadius = stormWarningArea.arc?.[0]?.[1];
            const stormWarningAreaCircleJSON = turf.circle(stormWarningAreaCenter, stormWarningAreaRadius, Map.DEFAULT_CIRCLE_OPTIONS);

            const stormSourceId = `typhoonStormSouce_${typhoonId}`;
            this.map.addSource(stormSourceId, {
                type: "geojson",
                data: stormWarningAreaCircleJSON,
            });
            this.typhoonSourceIds.push(stormSourceId);

            const stormLayerId = `typhoonStormLayer_${typhoonId}`;
            this.map.addLayer({
                id: stormLayerId,
                type: "fill",
                source: stormSourceId,
                paint: {
                    "fill-color": '#e04000',
                    "fill-opacity": 0.5,
                }
            });
            this.typhoonLayerIds.push(stormLayerId);

            const stormStrokeLayerId = `typhoonStormStrokeLayer_${typhoonId}`;
            this.map.addLayer({
                id: stormStrokeLayerId,
                type: "line",
                source: stormSourceId,
                paint: {
                    "line-color": '#e04000',
                    "line-width": 1 ^ 0.5,
                }
            });
            this.typhoonLayerIds.push(stormStrokeLayerId);
        }
    }

    /**
     * 台風情報（予想進路図）を非表示する
     * @returns {Promise<void>}
     */
    async removeTyphoon() {
        this.typhoonLayerIds.forEach(id => {
            if (this.map.getLayer(id)) {
                this.map.removeLayer(id);
            }
        });
        this.typhoonSourceIds.forEach(id => {
            if (this.map.getSource(id)) {
                this.map.removeSource(id);
            }
        });
        this.typhoonMarkers.forEach(marker => marker.remove());

        this.typhoonLayerIds = [];
        this.typhoonSourceIds = [];
        this.typhoonMarkers = [];
        this.isDisplayTyphoon = false;
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
    update(dateNow, fps) {
        const isEewOnYahooKmoni = this.app.services.api.yahooKmoni.isEew;
        const eewReports = this.app.services.eew.reports;
        const currentEewId = this.app.services.eew.currentId

        if (!isEewOnYahooKmoni) {
            if (!this.isDisplayHrpns) {
                this.showHrpns();
            }

            if (!this.isDisplayTyphoon) {
                this.displayTyphoon();
            }

            this.#clearEewLayers();
            return;
        }

        try {
            this.hideHrpns();
            this.removeTyphoon();

            Object.keys(eewReports).forEach((id) => {
                const report = this.app.services.eew.reports[id];

                if (
                    typeof id !== "string" ||
                    report.isWarning ||
                    !report.latitude ||
                    !report.longitude ||
                    !report.psWave
                ) {
                    return;
                }

                if (currentEewId === id) {
                    if (!report.isMapInitialized) {
                        if (!this.map.hasImage('eewRedionImage')) {
                            return;
                        }
                        this.#addEewLayers(id);
                    }

                    this.app.services.eew.reports[id].latitude = this.app.services.eew.reports[id].latitude.replace("N", "");
                    this.app.services.eew.reports[id].longitude = this.app.services.eew.reports[id].longitude.replace("E", "");

                    this.app.services.eew.reports[id].sRadius = this.app.services.eew.reports[id].psWave.sRadius * 1000;
                    this.app.services.eew.reports[id].pRadius = this.app.services.eew.reports[id].psWave.pRadius * 1000;

                    if (this.app.services.eew.reports[id].sRadius != this.app.services.eew.reports[id].lastSWave) {
                        this.app.services.eew.reports[id].sWaveInterval = (this.app.services.eew.reports[id].sRadius - this.app.services.eew.reports[id].lastSWave) / fps;
                        this.app.services.eew.reports[id].lastSWave = this.app.services.eew.reports[id].sRadius;
                        this.app.services.eew.reports[id].sWavePut = this.app.services.eew.reports[id].sRadius;
                    } else if (this.app.services.eew.reports[id].sRadius == this.app.services.eew.reports[id].lastSWave) {
                        if (this.app.services.eew.reports[id].sWaveInterval < 150 && this.app.services.eew.reports[id].sWaveInterval > 0) {
                            this.app.services.eew.reports[id].sWavePut += this.app.services.eew.reports[id].sWaveInterval;
                        }
                    }

                    if (this.app.services.eew.reports[id].pRadius != this.app.services.eew.reports[id].lastPWave) {
                        this.app.services.eew.reports[id].pWaveInterval = (this.app.services.eew.reports[id].pRadius - this.app.services.eew.reports[id].lastPWave) / fps;
                        this.app.services.eew.reports[id].lastPWave = this.app.services.eew.reports[id].pRadius;
                        this.app.services.eew.reports[id].pWavePut = this.app.services.eew.reports[id].pRadius;
                        this.#loopCount = dateNow;
                    } else if (this.app.services.eew.reports[id].pRadius == this.app.services.eew.reports[id].lastPWave) {
                        if (this.app.services.eew.reports[id].pWaveInterval < 300 && this.app.services.eew.reports[id].pWaveInterval > 0) {
                            this.app.services.eew.reports[id].pWavePut += this.app.services.eew.reports[id].pWaveInterval;
                        }
                    }
                } else {
                    if (this.app.services.eew.reports[id].sWaveInterval < 150 && this.app.services.eew.reports[id].sWaveInterval > 0) {
                        this.app.services.eew.reports[id].sWavePut += this.app.services.eew.reports[id].sWaveInterval;
                    }

                    if (this.app.services.eew.reports[id].pWaveInterval < 300 && this.app.services.eew.reports[id].pWaveInterval > 0) {
                        this.app.services.eew.reports[id].pWavePut += this.app.services.eew.reports[id].pWaveInterval;
                    }
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
            // this.app.services.debugLogs.add("error", `[${this.name}]`, `EEW Map update error: ${error.stack}`);
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
            if (report.pWavePut >= 300000) {
                this.setView([report.longitude, report.latitude], 4);
            } else if (report.pWavePut > 0) {
                this.setView([report.longitude, report.latitude], 5);
            }
            this.#autoMoveCount = dateNow;
        }
    }

    /**
     * 緊急地震速報（EEW）のレイヤーを追加する
     * @param {string} id - EEWのID
     * @returns {void}
     */
    async #addEewLayers(id) {
        await this.hideHrpns();
        await this.removeTyphoon();

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
                "icon-allow-overlap": true,
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
