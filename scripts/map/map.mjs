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

import { MapItem } from "./map-item.mjs";


export class Map {
    map = null;
    mapItem = [];
    eewIdLast = null;
    eewNum = null;
    autoMoveCnt = null;
    loopCnt_moni = null;


    constructor(settings) {
        this.settings = settings;

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
        if (eew.data !== null && eew.data.hypoInfo !== null) {
            console.debug(eew.data);
            if (eew.data.id !== this.eewIdLast && this.eewIdLast !== null) {
                this.eewNum++;
            }

            this.eewIdLast = eew.data.id;

            for (let cnt = 0; cnt <= this.eewNum; cnt++) {
                if (cnt === this.eewNum) {
                    let eew_waves = eew.data.psWave;
                    let eew_wave_p;
                    let eew_wave_s;

                    if (eew_waves !== null) {
                        this.mapItem[this.eewNum].eew_lat = eew_waves['latitude'].replace("N", "");
                        this.mapItem[this.eewNum].eew_lng = eew_waves['longitude'].replace("E", "");
                        let eew_hypo_LatLng = new L.LatLng(this.mapItem[this.eewNum].eew_lat, this.mapItem[this.eewNum].eew_lng);

                        eew_wave_p = eew_waves['pRadius'];
                        eew_wave_s = eew_waves['sRadius'];
                        eew_wave_p *= 1000;
                        eew_wave_s *= 1000;
                    }

                    if (eew_wave_s != this.mapItem[this.eewNum].eew_wave_s_last) {
                        this.mapItem[this.eewNum].eew_wave_s_Interval = (eew_wave_s - this.mapItem[this.eewNum].eew_wave_s_last) / (60 * ((dateNow - this.loopCnt_moni) / 1000));
                        this.mapItem[this.eewNum].eew_wave_s_last = eew_wave_s;
                        this.mapItem[this.eewNum].eew_wave_s_put = eew_wave_s;
                    } else if (eew_wave_s == this.mapItem[this.eewNum].eew_wave_s_last) {
                        this.mapItem[this.eewNum].eew_wave_s_put += this.mapItem[this.eewNum].eew_wave_s_Interval;
                    }

                    if (eew_wave_p != this.mapItem[this.eewNum].eew_wave_p_last) {
                        this.mapItem[this.eewNum].eew_wave_p_Interval = (eew_wave_p - this.mapItem[this.eewNum].eew_wave_p_last) / (60 * ((dateNow - this.loopCnt_moni) / 1000));
                        this.mapItem[this.eewNum].eew_wave_p_last = eew_wave_p;
                        this.mapItem[this.eewNum].eew_wave_p_put = eew_wave_p;
                        this.loopCnt_moni = dateNow;
                    } else if (eew_wave_p == this.mapItem[this.eewNum].eew_wave_p_last) {
                        this.mapItem[this.eewNum].eew_wave_p_put += this.mapItem[this.eewNum].eew_wave_p_Interval;
                    }
                } else {
                    this.mapItem[cnt].eew_wave_s_put += this.mapItem[cnt].eew_wave_s_Interval;
                    this.mapItem[cnt].eew_wave_p_put += this.mapItem[cnt].eew_wave_p_Interval;
                }

                this.mapItem[cnt].hypo.setLatLng(new L.LatLng(this.mapItem[cnt].eew_lat, this.mapItem[cnt].eew_lng));
                this.mapItem[cnt].wave_s.setLatLng(new L.LatLng(this.mapItem[cnt].eew_lat, this.mapItem[cnt].eew_lng));
                this.mapItem[cnt].wave_s.setRadius(this.mapItem[cnt].eew_wave_s_put);
                this.mapItem[cnt].wave_p.setLatLng(new L.LatLng(this.mapItem[cnt].eew_lat, this.mapItem[cnt].eew_lng));
                this.mapItem[cnt].wave_p.setRadius(this.mapItem[cnt].eew_wave_p_put);
            }

            if (this.settings.map.autoMove) {
                if (dateNow - this.autoMoveCnt >= 1000 * 3) {
                    if (this.mapItem[this.eewNum].eew_wave_p_put >= 560000) {
                        this.map.setView([this.mapItem[this.eewNum].eew_lat, this.mapItem[this.eewNum].eew_lng], 5);
                    } else if (this.mapItem[this.eewNum].eew_wave_p_put >= 280000) {
                        this.map.setView([this.mapItem[this.eewNum].eew_lat, this.mapItem[this.eewNum].eew_lng], 6);
                    } else if (this.mapItem[this.eewNum].eew_wave_p_put > 0) {
                        this.map.setView([this.mapItem[this.eewNum].eew_lat, this.mapItem[this.eewNum].eew_lng], 7);
                    }

                    this.autoMoveCnt = dateNow
                }
            }
        } else {
            this.eewNum = 0;

            for (let cnt = 0; cnt < 9; cnt++) {
                this.mapItem[cnt].hypo.setLatLng(new L.LatLng(0, 0));
                this.mapItem[cnt].wave_s.setLatLng(new L.LatLng(0, 0));
                this.mapItem[cnt].wave_p.setLatLng(new L.LatLng(0, 0));
                this.mapItem[cnt].wave_s.setRadius(0);
                this.mapItem[cnt].wave_p.setRadius(0);
            }
        }
    }


    setView(latLng, zoom) {
        this.map.setView(latLng, zoom);
    }
}