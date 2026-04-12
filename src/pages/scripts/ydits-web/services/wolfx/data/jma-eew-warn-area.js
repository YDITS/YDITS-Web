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

/**
 * Wolfx JMA EEW 警報地域のデータクラス
*/
export class WolfxJmaEewWarnArea {
    /**
     * @param {Object<string, string|number|Date>} area - Wolfx JMA EEW 警報地域のJSONデータクラス
     */
    constructor(area = {}) {
        this.name = typeof area["Chiiki"] === "string" ? area["Chiiki"] : "";
        this.intUpper = Number.isInteger(area["Shindo1"]) ? area["Shindo1"] : null;
        this.intLower = Number.isInteger(area["Shindo2"]) ? area["Shindo2"] : null;
        this.time = area["Time"] && !isNaN(Date.parse(area["Time"])) ? new Date(area["Time"]) : null;
        this.type = typeof area["Type"] === "string" ? area["Type"] : "";
        this.arrive = area["Arrive"] || null;
    }


    /**
     * 警報かどうか
     * @return {bool}
     */
    get isWarn() {
        if (this.type === "警報") { return true } else { return false };
    }
}
