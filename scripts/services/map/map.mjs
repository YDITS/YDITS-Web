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
import { MapItem } from "./map-item.mjs";


/**
 * マップを扱うサービスです。
 */
export class Map extends Service {
    map = null;
    mapItem = [];
    eewIdLast = null;
    eewNum = null;
    autoMoveCnt = null;
    loopCnt_moni = null;


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

        for (let cnt = 0; cnt < 9; cnt++) {
            this.mapItem[cnt] = new MapItem(this.map);
        }
    }


    update(eew, dateNow) {
        if (!eew.isEew) { return }

        if (eew.reports) {
            Object.keys(eew.reports).forEach((id) => {
                if (!eew.reports[id]) { return }

                if (eew.currentId === id) {
                    if (!eew.reports[id].sWave) {
                        eew.reports[id].region = L.circle([0, 0], {
                            radius: 5000,
                            weight: 2,
                            color: '#ff2010',
                            fillColor: '#ff2010',
                            fillOpacity: 1,
                        }).addTo(this.map);

                        eew.reports[id].sWave = L.circle([0, 0], {
                            radius: -1,
                            weight: 1,
                            color: '#ff4020',
                            fillColor: '#ff402080',
                            fillOpacity: 0.25,
                        }).addTo(this.map);

                        eew.reports[id].pWave = L.circle([0, 0], {
                            radius: -1,
                            weight: 1,
                            color: '#4080ff',
                            fillColor: '#00000000',
                            fillOpacity: 0,
                        }).addTo(this.map);
                    }

                    eew.reports[id].latitude = eew.reports[id].latitude.replace("N", "");
                    eew.reports[id].longitude = eew.reports[id].longitude.replace("E", "");

                    eew.reports[id].psWave.sRadius *= 1000;
                    eew.reports[id].psWave.pRadius *= 1000;

                    if (eew.reports[id].psWave.sRadius != eew.reports[id].lastSWave) {
                        eew.reports[id].sWaveInterval = (eew.reports[id].psWave.sRadius - eew.reports[id].lastSWave) / (60 * ((dateNow - this.loopCnt_moni) / 1000));
                        eew.reports[id].lastSWave = eew.reports[id].psWave.sRadius;
                        eew.reports[id].sWavePut = eew.reports[id].psWave.sRadius;
                    } else if (eew.reports[id].psWave.sRadius == eew.reports[id].lastSWave) {
                        // eew.reports[id].sWavePut += eew.reports[id].sWaveInterval;
                    }

                    if (eew.reports[id].psWave.pRadius != eew.reports[id].lastPWave) {
                        eew.reports[id].pWaveInterval = (eew.reports[id].psWave.pRadius - eew.reports[id].lastPWave) / (60 * ((dateNow - this.loopCnt_moni) / 1000));
                        eew.reports[id].lastPWave = eew.reports[id].psWave.pRadius;
                        eew.reports[id].pWavePut = eew.reports[id].psWave.pRadius;
                        this.loopCnt_moni = dateNow;
                    } else if (eew.reports[id].psWave.pRadius == eew.reports[id].lastPWave) {
                        // eew.reports[id].pWavePut += eew.reports[id].pWaveInterval;
                    }
                } else {
                    // eew.reports[id].sWavePut += eew.reports[id].sWaveInterval;
                    // eew.reports[id].pWavePut += eew.reports[id].pWaveInterval;
                }

                const REGION_LATLNG = new L.LatLng(eew.reports[id].latitude, eew.reports[id].longitude);
                eew.reports[id].region.setLatLng(REGION_LATLNG);
                eew.reports[id].sWave.setLatLng(REGION_LATLNG);
                eew.reports[id].pWave.setLatLng(REGION_LATLNG);
                eew.reports[id].sWave.setRadius(eew.reports[id].sWavePut);
                eew.reports[id].pWave.setRadius(eew.reports[id].pWavePut);
            });

            if (this.settings.map.autoMove) {
                if (dateNow - this.autoMoveCnt >= 1000 * 3) {
                    if (eew.reports[id].eew_wave_p_put >= 560000) {
                        this.map.setView([eew.reports[id].eew_lat, eew.reports[id].eew_lng], 5);
                    } else if (eew.reports[id].eew_wave_p_put >= 280000) {
                        this.map.setView([eew.reports[id].eew_lat, eew.reports[id].eew_lng], 6);
                    } else if (eew.reports[id].eew_wave_p_put > 0) {
                        this.map.setView([eew.reports[id].eew_lat, eew.reports[id].eew_lng], 7);
                    }

                    this.autoMoveCnt = dateNow
                }
            }
        } else {
            eew.reports[id].region.setLatLng(new L.LatLng(0, 0));
            eew.reports[id].sWave.setLatLng(new L.LatLng(0, 0));
            eew.reports[id].pWave.setLatLng(new L.LatLng(0, 0));
            eew.reports[id].sWave.setRadius(0);
            eew.reports[id].pWave.setRadius(0);
        }
    }


    setView(latLng, zoom) {
        this.map.setView(latLng, zoom);
    }
}