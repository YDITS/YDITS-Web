/*
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the Apache License 2.0.
 *
 */

'use strict';

import { Service } from "../../../service.mjs";

/**
 * マップを扱う。
 */
export class Map extends Service {
    map = null;
    loopCount = -1;
    autoMoveCount = null;

    get defaultCenter() {
        return ([36.0047000, 137.5930000]);
    }

    get defaultZoom() {
        return (5);
    }


    get hrpnsTimesUrl() {
        return ("https://www.jma.go.jp/bosai/himawari/data/satimg/targetTimes_jp.json");
    }


    get tropicalCycloneTargetUrl() {
        return ("https://www.jma.go.jp/bosai/typhoon/data/targetTc.json");
    }


    get layersControlElement() {
        return (document.getElementById("layersControl"));
    }


    get $hrpnsTime() {
        return ($("#hrpnsTime>.text"));
    }


    hrpnsImgUrl(baseTime, validTime) {
        return (`https://www.jma.go.jp/bosai/jmatile/data/nowc/${baseTime}/none/${validTime}/surf/hrpns/{z}/{x}/{y}.png`);
    }


    tropicalCycloneForecastUrl(tropicalCycloneNumber) {
        return (`https://www.jma.go.jp/bosai/typhoon/data/${tropicalCycloneNumber}/forecast.json`);
    }


    constructor(app) {
        super(app, {
            name: "map",
            description: "マップを扱うサービスです。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

        $("#eewTitle").text(`${this.name}をコンストラクトしています…`);

        this.map = L.map('map', {
            center: this.defaultCenter,
            zoom: this.defaultZoom,
            maxZoom: 10,
            minZoom: 4,
            zoomSnap: 0,
            zoomDelta: 0,
            zoomControl: false
        });

        this.maptilerLayer = L.maptilerLayer({
            apiKey: "3ft2uVdfAwtgfKQGIT8U",
            style: "ba979b60-0cf8-4087-8cdc-5bb919540c08",
        }).addTo(this.map);
    }


    /**
     * 初期化する。
     * @returns 
     */
    async initialize() {
        $("#eewTitle").text(`${this.name}をイニシャライズしています…`);

        if (!this.app.services.geoLocation.isSupport) { return }

        this.userPoint = L.marker([this.app.services.geoLocation.latitude, this.app.services.geoLocation.longitude], {
            icon: L.icon({
                iconUrl: "./images/user_point.png",
                iconSize: [24, 24]
            })
        }).addTo(this.map);

        this.userPointCircle = L.circle([this.app.services.geoLocation.latitude, this.app.services.geoLocation.longitude], {
            radius: this.app.services.geoLocation.accuracy,
            weight: 1,
            color: '#00000000',
            fillColor: '#4080ff80',
            fillOpacity: 0.25,
        }).addTo(this.map);

        $("#eewTitle").text(`hrpnsをイニシャライズしています…`);
        await this.showHrpns();
        $("#eewTitle").text(`typhoonをイニシャライズしています…`);
        await this.showTyphoon();
        $("#eewTitle").text(`読み込み中…`);
    }


    /**
     * ユーザーポイントの表示を更新する。
     * @returns 
     */
    updateUserPoint() {
        if (!this.app.services.geoLocation.isSupport) { return }

        if (this.app.services.settings.map.displayUserPoint) {
            this.userPoint = L.marker([this.app.services.geoLocation.latitude, this.app.services.geoLocation.longitude], {
                icon: L.icon({
                    iconUrl: "./images/user_point.png",
                    iconSize: [24, 24]
                })
            }).addTo(this.map);

            this.userPointCircle = L.circle([this.app.services.geoLocation.latitude, this.app.services.geoLocation.longitude], {
                radius: this.app.services.geoLocation.accuracy,
                weight: 1,
                color: '#00000000',
                fillColor: '#4080ff80',
                fillOpacity: 0.25,
            }).addTo(this.map);
        } else {
            this.map.removeLayer(this.userPoint);
            this.map.removeLayer(this.userPointCircle);
            this.userPoint = null;
            this.userPointCircle = null;
        }
    }


    /**
     * 引数に渡されたString `yyyyMMDDHHmm` を `yyyy年MM月DD日 HH時mm分` に変換する
     */
    formatDatetime(datetime) {
        const year = datetime.slice(0, 4);
        const month = datetime.slice(4, 6) - 1;
        const day = datetime.slice(6, 8);
        const hour = datetime.slice(8, 10);
        const minute = datetime.slice(10, 12);
        const date = new Date(Date.UTC(year, month, day, hour, minute));
        // return `${jstDate.getFullYear()}年${String(jstDate.getMonth() + 1).padStart(2, '0')}月${String(jstDate.getDate()).padStart(2, '0')}日 ${String(jstDate.getHours()).padStart(2, '0')}時${String(jstDate.getMinutes()).padStart(2, '0')}分`;
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }


    /**
     * 説明が記載されていません。
     */
    updateLayers() {
        if (this.hrpns) {
            this.layerControl = new CustomLayerControl({
                layers: {
                    "雨雲レーダー（高解像度降水ナウキャスト）": this.hrpns,
                    "台風情報（予想進路図）": this.typhoon,
                },
                map: this.map
            });
        }

        if (this.layerControl) {
            this.map.removeControl(this.layerControl);
        }


        this.layersControlElement.appendChild(this.layerControl.onAdd(this.map));
    }


    /**
     * 雨雲レーダー（高解像度降水ナウキャスト/HRPNS）を更新する。
     */
    async updateHrpns() {
        if (!this.hrpns) { return; }
        this.hrpnsLatestTargetTime = await this.getHrpnsTargetTime();
        const url = this.hrpnsImgUrl(this.hrpnsLatestTargetTime["basetime"], this.hrpnsLatestTargetTime["validtime"]);
        this.hrpns.setUrl(url);
        this.$hrpnsTime.text(this.formatDatetime(this.hrpnsLatestTargetTime["validtime"]));
    }


    /**
     * 雨雲レーダー（高解像度降水ナウキャスト/HRPNS）を表示する。
     */
    async showHrpns() {
        this.hrpnsLatestTargetTime = await this.getHrpnsTargetTime();
        const url = this.hrpnsImgUrl(this.hrpnsLatestTargetTime["basetime"], this.hrpnsLatestTargetTime["validtime"]);
        this.hrpns = L.tileLayer(url, {
            opacity: 0.7
        }).addTo(this.map);
        // this.updateLayers();
        this.$hrpnsTime.text(this.formatDatetime(this.hrpnsLatestTargetTime["validtime"]));
    }


    /**
     * 雨雲レーダー（高解像度降水ナウキャスト/HRPNS）を非表示する。
     */
    hideHrpns() {
        this.map.removeLayer(this.hrpns);
        this.hrpns = null;
        this.updateLayers();
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
            const response = await fetch(this.hrpnsTimesUrl);
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
        this.typhoon = L.layerGroup().addTo(this.map);
        this.updateLayers();

        this.tropicalCycloneLatestTarget = await this.getTropicalCycloneTarget();
        if (!this.tropicalCycloneLatestTarget) return null;

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


    // 予報円を追加する関数
    addForecastCircle(forecast) {
        if (forecast && forecast.center && forecast.probabilityCircle) {
            const center = forecast.center;
            const radius = forecast.probabilityCircle.radius;
            const validtime = new Date(forecast.validtime["JST"]); // 予報の時刻

            L.circle([center[0], center[1]], {
                color: '#ffffff',
                fillColor: '#ffffff',
                fillOpacity: 0.2,
                radius: radius,
                weight: 1
            }).addTo(this.typhoon);

            // 予報円の接線をラインで表示
            forecast.probabilityCircle.tangent.forEach(tangent => {
                const line = tangent.map(point => [point[0], point[1]]);
                L.polyline(line, { color: '#ffffff', dashArray: '5, 5', weight: 1 }).addTo(this.typhoon);
            });

            L.marker([center[0], center[1]], {
                icon: L.divIcon({
                    className: 'forecast-icon',
                    html: `<div class="forecast-time">${validtime.getDate()}日${validtime.getHours()}時</div>`,
                    iconSize: [100, 40],
                    minZoom: 6
                })
            }).addTo(this.typhoon);
        }
    }


    // 強風域を追加する関数
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
            const response = await fetch(this.tropicalCycloneTargetUrl);
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
                            this.app.services.eew.reports[id].region = L.marker([0, 0], {
                                icon: L.icon({
                                    iconUrl: "./images/hypocenter.png",
                                    iconSize: [24, 24]
                                })
                            }).addTo(this.map);

                            this.app.services.eew.reports[id].sWave = L.circle([0, 0], {
                                radius: -1,
                                weight: 1,
                                color: '#ff4020',
                                fillColor: '#ff402080',
                                fillOpacity: 0.25,
                            }).addTo(this.map);

                            this.app.services.eew.reports[id].pWave = L.circle([0, 0], {
                                radius: -1,
                                weight: 1,
                                color: '#4080ff',
                                fillColor: '#00000000',
                                fillOpacity: 0,
                            }).addTo(this.map);
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

                    const REGION_LATLNG = new L.LatLng(this.app.services.eew.reports[id].latitude, this.app.services.eew.reports[id].longitude);
                    this.app.services.eew.reports[id].region.setLatLng(REGION_LATLNG);
                    this.app.services.eew.reports[id].sWave.setLatLng(REGION_LATLNG);
                    this.app.services.eew.reports[id].pWave.setLatLng(REGION_LATLNG);
                    this.app.services.eew.reports[id].sWave.setRadius(this.app.services.eew.reports[id].sWavePut);
                    this.app.services.eew.reports[id].pWave.setRadius(this.app.services.eew.reports[id].pWavePut);
                });

                if (this.app.services.settings.map.autoMove) {
                    if (dateNow - this.autoMoveCount >= 1000 * 3) {
                        if (this.app.services.eew.reports[this.app.services.eew.currentId].pWavePut >= 560000) {
                            this.map.setView([this.app.services.eew.reports[this.app.services.eew.currentId].latitude, this.app.services.eew.reports[this.app.services.eew.currentId].longitude], 5);
                        } else if (this.app.services.eew.reports[this.app.services.eew.currentId].pWavePut >= 280000) {
                            this.map.setView([this.app.services.eew.reports[this.app.services.eew.currentId].latitude, this.app.services.eew.reports[this.app.services.eew.currentId].longitude], 6);
                        } else if (this.app.services.eew.reports[this.app.services.eew.currentId].pWavePut > 0) {
                            this.map.setView([this.app.services.eew.reports[this.app.services.eew.currentId].latitude, this.app.services.eew.reports[this.app.services.eew.currentId].longitude], 7);
                        }

                        this.autoMoveCount = dateNow
                    }
                }
            } else {
                Object.keys(this.app.services.eew.reports).forEach((id) => {
                    if (id === "undefined") { return; }
                    if (this.app.services.eew.reports[id].isWarning) { return; }

                    this.map.removeLayer(this.app.services.eew.reports[id].region);
                    this.map.removeLayer(this.app.services.eew.reports[id].sWave);
                    this.map.removeLayer(this.app.services.eew.reports[id].pWave);
                    delete this.app.services.eew.reports[id];
                });
            }
        } catch (error) {
            console.error(error);
            this.app.services.debugLogs.add("error", `[${this.name}]`, `Map error: ${error}`);
        }
    }


    /**
     * マップを移動する。
     * @param {*} latLng 
     * @param {*} zoom 
     */
    setView(latLng, zoom) {
        this.map.flyTo(latLng, zoom);
    }


    /**
     * マップを初期位置に移動する。
     */
    setViewHome() {
        this.setView(this.defaultCenter, this.defaultZoom);
    }
}


/**
 * 独自レイヤーコントロールクラス
 */
class CustomLayerControl extends L.Control {
    constructor(options) {
        super(options);
        this.options = options || {};
        this.eewActive = false; // EEWの状態を示すプロパティ
    }

    get $hrpnsTime() {
        return ($("#hrpnsTime"));
    }

    onAdd(map) {
        this.map = map; // 地図オブジェクトをクラスのプロパティとして保存
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

                if (checkbox.checked && !this.eewActive) {
                    this.map.addLayer(layer);
                    this.$hrpnsTime.addClass("show");
                } else {
                    this.map.removeLayer(layer);
                    this.$hrpnsTime.removeClass("show");
                }

                L.DomEvent.on(checkbox, 'change', () => {
                    if (checkbox.checked) {
                        savedLayers[name] = true;
                        if (!this.eewActive) {
                            this.map.addLayer(layer);
                            this.$hrpnsTime.addClass("show");
                        }
                    } else {
                        savedLayers[name] = false;
                        this.map.removeLayer(layer);
                        this.$hrpnsTime.removeClass("show");
                    }
                    localStorage.setItem('selectedLayers', JSON.stringify(savedLayers));
                });

                const label = L.DomUtil.create('label', '', controlItem);
                label.htmlFor = name;
                label.innerHTML = name;
            }
        }
    }

    // EEWの開始を検知するメソッド
    startEew() {
        this.eewActive = true;
        this.updateLayerControlVisibility();
    }

    // EEWの終了を検知するメソッド
    stopEew() {
        this.eewActive = false;
        this.updateLayerControlVisibility();
    }

    // レイヤーの表示/非表示を更新するメソッド
    updateLayerControlVisibility() {
        const savedLayers = JSON.parse(localStorage.getItem('selectedLayers')) || {};

        for (const [name, layer] of Object.entries(this.options.layers)) {
            if (savedLayers[name]) {
                if (this.eewActive) {
                    this.map.removeLayer(layer);
                    this.$hrpnsTime.removeClass("show");
                } else {
                    this.map.addLayer(layer);
                    this.$hrpnsTime.addClass("show");
                }
            }
        }
    }
}