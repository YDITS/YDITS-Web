/*
 *
 * map.mjs | YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

import { Service } from "../../service.mjs";


/**
 * マップを扱うサービスです。
 */
export class Map extends Service {
    map = null;
    loopCount = -1;
    autoMoveCount = null;


    constructor(app) {
        super(app, {
            name: "map",
            description: "マップを扱うサービスです。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

        this.settings = app.services.settings;

        this.map = L.map('map', {
            center: [38.0194092, 138.3664968],
            zoom: 6,
            maxZoom: 10,
            minZoom: 4,
            zoomSnap: 0,
            zoomDelta: 0,
            zoomControl: false
        });

        L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
            apikey: 'c168fc2f-2f64-4f13-874c-ce2dcec92819',
            attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        }).addTo(this.map);
    }


    update(dateNow) {
        if (this._app.services.api.yahooKmoni.isEew) {
            Object.keys(this._app.services.eew.reports).forEach((id) => {
                if (!this._app.services.eew.reports[id]) { return }
                if (this._app.services.eew.reports[id].isWarning) { return }

                if (this._app.services.eew.currentId === id) {
                    if (!this._app.services.eew.reports[id].region) {
                        this._app.services.eew.reports[id].region = L.circle([0, 0], {
                            radius: 5000,
                            weight: 2,
                            color: '#ff2010',
                            fillColor: '#ff2010',
                            fillOpacity: 1,
                        }).addTo(this.map);

                        this._app.services.eew.reports[id].sWave = L.circle([0, 0], {
                            radius: -1,
                            weight: 1,
                            color: '#ff4020',
                            fillColor: '#ff402080',
                            fillOpacity: 0.25,
                        }).addTo(this.map);

                        this._app.services.eew.reports[id].pWave = L.circle([0, 0], {
                            radius: -1,
                            weight: 1,
                            color: '#4080ff',
                            fillColor: '#00000000',
                            fillOpacity: 0,
                        }).addTo(this.map);
                    }

                    this._app.services.eew.reports[id].latitude = this._app.services.eew.reports[id].latitude.replace("N", "");
                    this._app.services.eew.reports[id].longitude = this._app.services.eew.reports[id].longitude.replace("E", "");

                    this._app.services.eew.reports[id].sRadius = this._app.services.eew.reports[id].psWave.sRadius * 1000;
                    this._app.services.eew.reports[id].pRadius = this._app.services.eew.reports[id].psWave.pRadius * 1000;

                    if (this._app.services.eew.reports[id].sRadius != this._app.services.eew.reports[id].lastSWave) {
                        this._app.services.eew.reports[id].sWaveInterval = (this._app.services.eew.reports[id].sRadius - this._app.services.eew.reports[id].lastSWave) / (60 * ((dateNow - this.loopCount) / 1000));
                        this._app.services.eew.reports[id].lastSWave = this._app.services.eew.reports[id].sRadius;
                        this._app.services.eew.reports[id].sWavePut = this._app.services.eew.reports[id].sRadius;
                    } else if (this._app.services.eew.reports[id].sRadius == this._app.services.eew.reports[id].lastSWave) {
                        this._app.services.eew.reports[id].sWavePut += this._app.services.eew.reports[id].sWaveInterval;
                    }

                    if (this._app.services.eew.reports[id].pRadius != this._app.services.eew.reports[id].lastPWave) {
                        this._app.services.eew.reports[id].pWaveInterval = (this._app.services.eew.reports[id].pRadius - this._app.services.eew.reports[id].lastPWave) / (60 * ((dateNow - this.loopCount) / 1000));
                        this._app.services.eew.reports[id].lastPWave = this._app.services.eew.reports[id].pRadius;
                        this._app.services.eew.reports[id].pWavePut = this._app.services.eew.reports[id].pRadius;
                        this.loopCount = dateNow;
                    } else if (this._app.services.eew.reports[id].pRadius == this._app.services.eew.reports[id].lastPWave) {
                        this._app.services.eew.reports[id].pWavePut += this._app.services.eew.reports[id].pWaveInterval;
                    }
                } else {
                    this._app.services.eew.reports[id].sWavePut += this._app.services.eew.reports[id].sWaveInterval;
                    this._app.services.eew.reports[id].pWavePut += this._app.services.eew.reports[id].pWaveInterval;
                }

                const REGION_LATLNG = new L.LatLng(this._app.services.eew.reports[id].latitude, this._app.services.eew.reports[id].longitude);
                this._app.services.eew.reports[id].region.setLatLng(REGION_LATLNG);
                this._app.services.eew.reports[id].sWave.setLatLng(REGION_LATLNG);
                this._app.services.eew.reports[id].pWave.setLatLng(REGION_LATLNG);
                this._app.services.eew.reports[id].sWave.setRadius(this._app.services.eew.reports[id].sWavePut);
                this._app.services.eew.reports[id].pWave.setRadius(this._app.services.eew.reports[id].pWavePut);
            });

            if (this.settings.map.autoMove) {
                if (dateNow - this.autoMoveCount >= 1000 * 3) {
                    if (this._app.services.eew.reports[this._app.services.eew.currentId].pWavePut >= 560000) {
                        this.map.setView([this._app.services.eew.reports[this._app.services.eew.currentId].latitude, this._app.services.eew.reports[id].longitude], 5);
                    } else if (this._app.services.eew.reports[this._app.services.eew.currentId].pWavePut >= 280000) {
                        this.map.setView([this._app.services.eew.reports[this._app.services.eew.currentId].latitude, this._app.services.eew.reports[id].longitude], 6);
                    } else if (this._app.services.eew.reports[this._app.services.eew.currentId].pWavePut > 0) {
                        this.map.setView([this._app.services.eew.reports[this._app.services.eew.currentId].latitude, this._app.services.eew.reports[id].longitude], 7);
                    }

                    this.autoMoveCount = dateNow
                }
            }
        } else {
            Object.keys(this._app.services.eew.reports).forEach((id) => {
                if (this._app.services.eew.reports[id] === undefined || this._app.services.eew.reports[id].isWarning) { return }
                this._app.services.eew.reports[id].region.setLatLng(new L.LatLng(0, 0));
                this._app.services.eew.reports[id].sWave.setLatLng(new L.LatLng(0, 0));
                this._app.services.eew.reports[id].pWave.setLatLng(new L.LatLng(0, 0));
                this._app.services.eew.reports[id].sWave.setRadius(0);
                this._app.services.eew.reports[id].pWave.setRadius(0);
            });
        }
    }


    setView(latLng, zoom) {
        this.map.setView(latLng, zoom);
    }
}