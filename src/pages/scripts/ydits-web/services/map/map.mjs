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

/**
 * マップを扱う。
 */
export class Map extends Service {
    constructor(app) {
        super(app, {
            name: "map",
            description: "マップを扱うサービスです。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

        this.app.services.notify.show("message", "", `${this.name}をコンストラクトしています…`);

        this.loopCount = -1;
        this.autoMoveCount = null;

        this.initializeMaps();
    }


    static DEFAULT_CENTER = [137.5930000, 36.0047000];
    static DEFAULT_ZOOM = 4;
    static HRPNS_TIMES_URI = "https://www.jma.go.jp/bosai/himawari/data/satimg/targetTimes_jp.json";
    static TROPICAL_CYCLONE_TARGET_URI = "https://www.jma.go.jp/bosai/typhoon/data/targetTc.json";
    static DEFAULT_CIRCLE_OPTIONS = { steps: 32, units: "meters", propreties: { foo: "bar" } };


    get $layersControl() {
        if (!(this._$layersControl instanceof HTMLElement)) {
            this._$layersControl = document.getElementById("layersControl");
        }

        return this._$layersControl;
    }


    get $hrpnsTime() {
        if (!(this._$hrpnsTime instanceof HTMLElement)) {
            this._$hrpnsTime = document.querySelector("#hrpnsTime>.text");
        }

        return this._$hrpnsTime;
    }


    get isGeolocationSupported() {
        if (this._isGeolocationSupported === undefined) {
            this._isGeolocationSupported = "geolocation" in navigator;
        }

        return this._isGeolocationSupported;
    }


    hrpnsImageUri(baseTime, validTime) {
        return `https://www.jma.go.jp/bosai/jmatile/data/nowc/${baseTime}/none/${validTime}/surf/hrpns/{z}/{x}/{y}.png`;
    }


    tropicalCycloneForecastUrl(tropicalCycloneNumber) {
        return `https://www.jma.go.jp/bosai/typhoon/data/${tropicalCycloneNumber}/forecast.json`;
    }


    /**
     * 初期化する。
     * @returns {void}
     */
    async initialize() {
        this.app.services.notify.show("message", "", `${this.name}をイニシャライズしています…`);

        this.regionImage = await this.map.loadImage('./images/hypocenter.png');

        this.map.on("load", async (event) => {
            await this.showHrpns();
            await this.showTyphoon();
        });

        if (!this.isGeolocationSupported) { return }

        document.addEventListener("getLocation", () => this.updateUserPoint());


        this.app.services.notify.show("message", `${this.app.name} Ver ${this.app.version.string}`, "");
    }


    /**
     * マップインスタンスを初期化する。
     * @returns {void}
     */
    initializeMaps() {
        maptilersdk.config.apiKey = "3ft2uVdfAwtgfKQGIT8U";

        this.map = new maplibregl.Map({
            container: "map",
            style: "https://api.maptiler.com/maps/ba979b60-0cf8-4087-8cdc-5bb919540c08/style.json?key=3ft2uVdfAwtgfKQGIT8U",
            center: Map.DEFAULT_CENTER,
            zoom: Map.DEFAULT_ZOOM,
            maxZoom: 9,
            minZoom: 3,
        });
    }


    /**
     * ユーザーポイントの表示を更新する。
     */
    updateUserPoint() {
        if (!this.app.services.geoLocation.isSupported) return;

        if (this.app.services.settings.map.displayUserPoint) {
            const userLatLng = [this.app.services.geoLocation.latitude, this.app.services.geoLocation.longitude];

            const userIcon = L.icon({
                iconUrl: "./images/user_point.png",
                iconSize: [24, 24]
            });

            if (this.userPoint) {
                this.userPoint.setLatLng(userLatLng);
                this.userPointCircle.setLatLng(userLatLng).setRadius(this.app.services.geoLocation.accuracy);
            } else {
                this.userPoint = L.marker(userLatLng, { icon: userIcon }).addTo(this.map);
                this.userPointCircle = L.circle(userLatLng, {
                    radius: this.app.services.geoLocation.accuracy,
                    weight: 1,
                    color: '#00000000',
                    fillColor: '#4080ff80',
                    fillOpacity: 0.25,
                }).addTo(this.map);
            }
        } else {
            if (this.userPoint) {
                this.map.removeLayer(this.userPoint);
                this.map.removeLayer(this.userPointCircle);
                this.userPoint = null;
                this.userPointCircle = null;
            }
        }
    }


    /**
     * 日時文字列をフォーマットする。
     * @param {string} datetime - 'yyyyMMDDHHmm' 形式の日時文字列
     * @returns {string} - 'HH:mm' 形式の日時文字列
     */
    formatDatetime(datetime) {
        const year = datetime.slice(0, 4);
        const month = datetime.slice(4, 6) - 1;
        const day = datetime.slice(6, 8);
        const hour = datetime.slice(8, 10);
        const minute = datetime.slice(10, 12);
        const date = new Date(Date.UTC(year, month, day, hour, minute));
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }


    /**
     * レイヤーコントロールを更新する。
     */
    updateLayers() {
        if (this.layerControl) {
            this.map.removeControl(this.layerControl);
        }


        if (this.hrpns || this.typhoon) {
            this.layerControl = new CustomLayerControl({
                layers: {
                    "雨雲レーダー（高解像度降水ナウキャスト）": this.hrpns,
                    "台風情報（予想進路図）": this.typhoon,
                },
                map: this.map
            });

            this.$layersControl.appendChild(this.layerControl.onAdd(this.map));
        }


    }


    /**
     * 雨雲レーダー（高解像度降水ナウキャスト/HRPNS）を更新する。
     */
    async updateHrpns() {
        if (!this.hrpns) return;

        this.hrpnsLatestTargetTime = await this.getHrpnsTargetTime();
        const url = this.hrpnsImageUri(this.hrpnsLatestTargetTime.basetime, this.hrpnsLatestTargetTime.validtime);
        this.hrpns.setUrl(url);
        this.$hrpnsTime.textContent = this.formatDatetime(this.hrpnsLatestTargetTime.validtime);
    }


    /**
     * 雨雲レーダー（高解像度降水ナウキャスト/HRPNS）を表示する。
     */
    async showHrpns() {
        this.hrpnsLatestTargetTime = await this.getHrpnsTargetTime();
        const url = this.hrpnsImageUri(this.hrpnsLatestTargetTime.basetime, this.hrpnsLatestTargetTime.validtime);

        this.map.addSource('hrpns-source', {
            'type': 'raster',
            'tiles': [url],
            'tileSize': 256,
        });

        this.map.addLayer({
            id: "hrpns",
            source: "hrpns-source",
            type: "raster",
            paint: {
                "raster-opacity": 0.7,
            },
        });

        this.$hrpnsTime.textContent = this.formatDatetime(this.hrpnsLatestTargetTime.validtime);
        // this.updateLayers();
    }


    /**
     * 雨雲レーダー（高解像度降水ナウキャスト/HRPNS）を非表示する。
     */
    hideHrpns() {
        this.map.removeLayer("hrpns");
    }


    /**
     * 雨雲レーダー（高解像度降水ナウキャスト/HRPNS）の最新URLを返す。
     */
    async getHrpnsTargetTime() {
        const time = await this.fetchHrpnsTargetTime();
        const latestData = time[time.length - 1];
        return latestData;
    }


    /**
     * 雨雲レーダー（高解像度降水ナウキャスト/HRPNS）のターゲットURLを取得する。
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
     * 台風情報（予想進路図）を更新する。
     */
    async updateTyphoon() {
        if (!this.typhoon) {
            this.hideTyphoon();
        }
        await this.showTyphoon();
    }


    /**
     * 台風情報（予想進路図）を表示する。
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

            this.$hrpnsTime.text(this.formatDatetime(this.hrpnsLatestTargetTime["validtime"]));
        });
    }


    /**
     * 予報円を追加する。
     */
    addForecastCircle(forecast) {
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
     * 強風域を追加する。
     */
    addGaleWarningArea(galeWarningArea, typhoonNumber) {
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
     * 台風情報（予想進路図）を非表示する。
     */
    hideTyphoon() {
        this.map.removeLayer(this.typhoon);
        this.typhoon = null;
        // this.updateLayers();
    }


    /**
     * 台風情報（予想進路図）の最新URLを返す。
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
     * 台風情報（予想進路図）のターゲットURLを取得する。
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
     * マップの描画を更新する。
     * @param {*} dateNow 
     */
    update(dateNow) {
        try {
            if (this.app.services.api.yahooKmoni.isEew) {
                Object.keys(this.app.services.eew.reports).forEach((id) => {
                    if (id === "undefined" || this.app.services.eew.reports[id].isWarning) { return }

                    if (this.app.services.eew.currentId === id) {
                        if (!this.app.services.eew.reports[id].region) {
                            const sWaveCircleJSON = turf.circle([0, 0], 0, Map.DEFAULT_CIRCLE_OPTIONS);
                            const pWaveCircleJSON = turf.circle([0, 0], 0, Map.DEFAULT_CIRCLE_OPTIONS);

                            this.map.addImage(`eewRedionImage_${id}`, this.regionImage.data);

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
                                      properties: {},
                                    },
                                  ],
                                },
                            });

                            this.map.addLayer({
                                id: `eewRedion_${id}`,
                                type: "symbol",
                                source: `eewRedionSource_${id}`,
                                // "source-layer": `eewRedionSource_${id}`,
                                layout: {
                                    // "icon-"
                                    "icon-image": `eewRedionImage_${id}`,
                                    "icon-size": 24,
                                },
                            });

                            this.map.addSource(`eewSWaveSource_${id}`, {
                                type: "geojson",
                                data: sWaveCircleJSON,
                            });

                            this.map.addLayer({
                                id: `eewSWave_${id}`,
                                type: "circle",
                                source: `eewSWaveSource_${id}`,
                                // "source-layer": `eewSWaveSource_${id}`,
                                paint: {
                                    "circle-color": "#ff402080",
                                    "circle-opacity": 0.25,
                                    "circle-stroke-width": 1,
                                    "circle-stroke-color": "#ff4020",
                                },
                            });

                            this.map.addSource(`eewPWaveSource_${id}`, {
                                    type: "geojson",
                                    data: pWaveCircleJSON,
                                });
                                
                            this.map.addLayer({
                                    id: `eewPWave_${id}`,
                                    type: "circle",
                                    source: `eewPWaveSource_${id}`,
                                    // "source-layer": `eewPWaveSource_${id}`,
                                    paint: {
                                        "circle-color": "#00000000",
                                        "circle-opacity": 0,
                                        "circle-stroke-width": 1,
                                        "circle-stroke-color": "#4080ff",
                                    },
                                });
                        }

                        this.app.services.eew.reports[id].latitude = this.app.services.eew.reports[id].latitude.replace("N", "");
                        this.app.services.eew.reports[id].longitude = this.app.services.eew.reports[id].longitude.replace("E", "");

                        this.app.services.eew.reports[id].sRadius = this.app.services.eew.reports[id].psWave.sRadius * 1000;
                        this.app.services.eew.reports[id].pRadius = this.app.services.eew.reports[id].psWave.pRadius * 1000;

                        if (this.app.services.eew.reports[id].sRadius != this.app.services.eew.reports[id].lastSWave) {
                            this.app.services.eew.reports[id].sWaveInterval = (this.app.services.eew.reports[id].sRadius - this.app.services.eew.reports[id].lastSWave) / (60 * ((dateNow - this.loopCount) / 1000));
                            this.app.services.eew.reports[id].lastSWave = this.app.services.eew.reports[id].sRadius;
                            this.app.services.eew.reports[id].sWavePut = this.app.services.eew.reports[id].sRadius;
                        } else if (this.app.services.eew.reports[id].sRadius == this.app.services.eew.reports[id].lastSWave) {
                            this.app.services.eew.reports[id].sWavePut += this.app.services.eew.reports[id].sWaveInterval;
                        }

                        if (this.app.services.eew.reports[id].pRadius != this.app.services.eew.reports[id].lastPWave) {
                            this.app.services.eew.reports[id].pWaveInterval = (this.app.services.eew.reports[id].pRadius - this.app.services.eew.reports[id].lastPWave) / (60 * ((dateNow - this.loopCount) / 1000));
                            this.app.services.eew.reports[id].lastPWave = this.app.services.eew.reports[id].pRadius;
                            this.app.services.eew.reports[id].pWavePut = this.app.services.eew.reports[id].pRadius;
                            this.loopCount = dateNow;
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
                    this.map.getSource(`eewRedionSource_${id}`)._data.features[0].geometry.coordinates = REGION_LNGLAT;
                    this.map.getSource(`eewSWaveSource_${id}`).setData(sWaveCircleJSON);
                    this.map.getSource(`eewPWaveSource_${id}`).setData(pWaveCircleJSON);

                    console.debug(this.app.services.eew.reports[id].sWave);
                });

                if (this.app.services.settings.map.autoMove) {
                    this.autoMoveMap(dateNow);
                }
            } else {
                this.clearEewLayers();
            }
        } catch (error) {
            console.error(error);
            this.app.services.debugLogs.add("error", `[${this.name}]`, `EEW Map update error: ${error.stack}`);
        }
    }


    /**
     * マップを自動で移動する。
     * @param {number} dateNow - 現在の日時
     */
    autoMoveMap(dateNow) {
        if (dateNow - this.autoMoveCount >= 3000) {
            const report = this.app.services.eew.reports[this.app.services.eew.currentId];
            if (report.pWavePut >= 560000) {
                this.map.setView([report.latitude, report.longitude], 5);
            } else if (report.pWavePut >= 280000) {
                this.map.setView([report.latitude, report.longitude], 6);
            } else if (report.pWavePut > 0) {
                this.map.setView([report.latitude, report.longitude], 7);
            }
            this.autoMoveCount = dateNow;
        }
    }


    /**
     * 緊急地震速報（EEW）のレイヤーをクリアする。
     */
    clearEewLayers() {
        Object.keys(this.app.services.eew.reports).forEach(id => {
            if (id !== "undefined" && !this.app.services.eew.reports[id].isWarning) {
                this.map.removeLayer(this.app.services.eew.reports[id].region);
                this.map.removeLayer(this.app.services.eew.reports[id].sWave);
                this.map.removeLayer(this.app.services.eew.reports[id].pWave);
                delete this.app.services.eew.reports[id];
            }
        });
    }


    /**
     * マップを移動する。
     * @param {L.LatLng} latLng - 移動先の緯度経度
     * @param {number} zoom - ズームレベル
     */
    setView(lngLat, zoom) {
        this.map.flyTo({
            center: lngLat,
            zoom: zoom,
        });
    }


    /**
     * マップを初期位置に移動する。
     */
    setViewHome() {
        this.setView(Map.DEFAULT_CENTER, Map.DEFAULT_ZOOM);
    }
}


/**
 * 独自レイヤーコントロールクラス
 */
class CustomLayerControl extends L.Control {
    constructor(options) {
        super(options);
        this.options = options;
        this.isEewActive = false;
    }

    get $hrpnsTime() {
        if (!(this._$hrpnsTime instanceof HTMLElement)) {
            this._$hrpnsTime = document.getElementById("hrpnsTime");
        }

        return this._$hrpnsTime;
    }

    onAdd(map) {
        this.map = map;
        this._container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        this._container.style.backgroundColor = 'white';
        this._container.style.padding = '10px';
        this._layerControl = L.DomUtil.create('div', 'layer-control', this._container);
        this.updateLayerControl();
        return this._container;
    }

    updateLayerControl() {
        this._layerControl.innerHTML = '';
        const savedLayers = JSON.parse(localStorage.getItem('selectedLayers')) || {};

        if (this.options.layers) {
            for (const [name, layer] of Object.entries(this.options.layers)) {
                const controlItem = L.DomUtil.create('div', '', this._layerControl);
                const checkbox = L.DomUtil.create('input', '', controlItem);
                checkbox.type = 'checkbox';
                checkbox.id = name;
                checkbox.checked = savedLayers[name] || false;

                if (checkbox.checked && !this.isEewActive) {
                    this.map.addLayer(layer);
                    this.$hrpnsTime.classList.add("show");
                } else {
                    if (layer && this.map.hasLayer(layer)) {
                        this.map.removeLayer(layer);
                    }
                    this.$hrpnsTime.classList.remove("show");
                }

                L.DomEvent.on(checkbox, 'change', () => {
                    if (checkbox.checked) {
                        savedLayers[name] = true;
                        if (!this.isEewActive) {
                            this.map.addLayer(layer);
                            this.$hrpnsTime.classList.add("show");
                        }
                    } else {
                        savedLayers[name] = false;
                        this.map.removeLayer(layer);
                        this.$hrpnsTime.classList.remove("show");
                    }
                    localStorage.setItem('selectedLayers', JSON.stringify(savedLayers));
                });

                const label = L.DomUtil.create('label', '', controlItem);
                label.htmlFor = name;
                label.innerHTML = name;
            }
        }
    }

    startEew() {
        this.isEewActive = true;
        this.updateLayerControlVisibility();
    }

    stopEew() {
        this.isEewActive = false;
        this.updateLayerControlVisibility();
    }

    updateLayerControlVisibility() {
        const savedLayers = JSON.parse(localStorage.getItem('selectedLayers')) || {};

        for (const [name, layer] of Object.entries(this.options.layers)) {
            if (savedLayers[name]) {
                if (this.isEewActive) {
                    this.map.removeLayer(layer);
                    this.$hrpnsTime.classList.remove("show");
                } else {
                    this.map.addLayer(layer);
                    this.$hrpnsTime.classList.add("show");
                }
            }
        }
    }
}
