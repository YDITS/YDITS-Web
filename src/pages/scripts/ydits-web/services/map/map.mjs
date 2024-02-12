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


    constructor(app) {
        super(app, {
            name: "map",
            description: "マップを扱うサービスです。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

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
    initialize() {
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
        this.map.setView(latLng, zoom);
    }


    /**
     * マップを初期位置に移動する。
     */
    setViewHome() {
        this.setView(this.defaultCenter, this.defaultZoom);
    }
}