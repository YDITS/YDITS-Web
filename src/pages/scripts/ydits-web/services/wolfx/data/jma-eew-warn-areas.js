/*!
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
     * @param {Array<{
     *     "Chiiki": string?,
     *     "Shindo1": number?,
     *     "Shindo2": number?,
     *     "Time": string?,
     *     "Type": string?,
     *     "Arrive": string?,
     * }> | null} areas - Wolfx JMA EEW 警報地域のJSONデータクラス
     */
    constructor(areas = []) {
        if (!Array.isArray(areas)) {
            return;
        }

        areas.forEach(area => {
            this.areas.push(
                new WolfxJmaEewWarnArea(area)
            );
        });
    }
}
