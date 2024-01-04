/*
 *
 * map-item.mjs | YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

export class MapItem {
    isCurrent = false;
    eew_lat = 0;
    eew_lng = 0;
    eew_wave_p_last = null;
    eew_wave_p_Interval = null;
    eew_wave_p_put = null;
    eew_wave_s_last = null;
    eew_wave_s_Interval = null;
    eew_wave_s_put = null;


    constructor(map) {
        this.hypo = L.circle([0, 0], {
            radius: 5000,
            weight: 2,
            color: '#ff2010',
            fillColor: '#ff2010',
            fillOpacity: 1,
        }).addTo(map);

        this.wave_s = L.circle([0, 0], {
            radius: -1,
            weight: 1,
            color: '#ff4020',
            fillColor: '#ff402080',
            fillOpacity: 0.25,
        }).addTo(map);

        this.wave_p = L.circle([0, 0], {
            radius: -1,
            weight: 1,
            color: '#4080ff',
            fillColor: '#00000000',
            fillOpacity: 0,
        }).addTo(map);
    }
}