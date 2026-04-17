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

import { WolfxJmaEewWarnArea } from "./jma-eew-warn-area.js";

/**
 * Wolfx JMA EEW 警報地域のデータクラス
*/
export class WolfxJmaEewWarnAreas {
    /**
     * @type {WolfxJmaEewWarnArea[]}
     */
    areas = [];


    /**
     * @param {[Object<string, string|number|Date>]} areas - Wolfx JMA EEW 警報地域のJSONデータクラス
     */
    constructor(areas = []) {
        areas.forEach(area => {
            this.areas.push(
                new WolfxJmaEewWarnArea(area)
            );
        });
    }
}
