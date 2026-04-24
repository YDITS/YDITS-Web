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

/**
 * Wolfx JMA EEW 警報地域のデータクラス
*/
export class WolfxJmaEewWarnArea {
    /**
     * @param {{
     *     "Chiiki": string?,
     *     "Shindo1": number?,
     *     "Shindo2": number?,
     *     "Time": string?,
     *     "Type": string?,
     *     "Arrive": string?,
     * }} area - Wolfx JMA EEW 警報地域のJSONデータクラス
     */
    constructor(area) {
        this.name = typeof area["Chiiki"] === "string" ? area["Chiiki"] : "";
        this.intUpper = Number.isInteger(area["Shindo1"]) ? area["Shindo1"] : null;
        this.intLower = Number.isInteger(area["Shindo2"]) ? area["Shindo2"] : null;
        this.time = area["Time"] && !isNaN(Date.parse(area["Time"])) ? new Date(area["Time"]) : null;
        this.type = typeof area["Type"] === "string" ? area["Type"] : "";
        this.arrive = area["Arrive"] || null;
    }

    /**
     * 警報かどうか
     * @return {boolean}
     */
    get isWarn() {
        return this.type === "警報";
    }
}
