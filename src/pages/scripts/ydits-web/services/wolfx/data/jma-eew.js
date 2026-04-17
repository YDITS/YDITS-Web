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

import { WolfxJmaEewWarnAreas } from "./jma-eew-warn-areas.js";

/**
 * Wolfx JMA EEW のデータクラス
 */
export class WolfxJmaEewData {
    /**
     * @param {Object<string, boolean|number|string|Date|Object[]>} data - Wolfx JMA EEW のJSONデータクラス
     */
    constructor(data) {
        this.type = "jma_eew";
        this.title = data["Title"] || null;
        this.codeType = data["CodeType"] || null;
        this.issueSource = data["Issue"]["Source"] || null;
        this.issueStatus = data["Issue"]["Status"] || null;
        this.eventId = data["EventID"] || null;
        this.serial = data["Serial"] || null;
        this.announcedTime = data["AnnouncedTime"] && !isNaN(Date.parse(data["AnnouncedTime"])) ? new Date(data["AnnouncedTime"]) : null;
        this.originTime = data["OriginTime"] || null;
        this.hypocenter = data["Hypocenter"] || null;
        this.latitude = data["Latitude"] || null;
        this.longitude = data["Longitude"] || null;
        this.magnitude = data["Magunitude"] || null;
        this.depth = data["Depth"] || null;
        this.maxIntensity = data["MaxIntensity"] || null;
        this.accuracyEpicenter = data["Accuracy"]["Epicenter"] || null;
        this.accuracyDepth = data["Accuracy"]["Depth"] || null;
        this.accuracyMagnitude = data["Accuracy"]["Magunitude"] || null;
        this.maxIntChangeString = data["MaxIntChange"]["String"] || null;
        this.maxIntChangeReason = data["MaxIntChange"]["Reason"] || null;
        this.warnAreas = new WolfxJmaEewWarnAreas(data["WarnArea"]);
        this.isSea = data["isSea"];
        this.isTraining = data["isTraining"];
        this.isWarning = data["isWarn"];
        this.isFinal = data["isFinal"];
        this.isCancel = data["isCancel"];
        this.originalText = data["OriginalText"];
    }

    /**
     * 緊急地震速報が有効な時間
     * @type {number}
     */
    static VALID_EEW_DURATION_SECONDS = 180;

    /**
     * 渡された日時において、緊急地震速報が有効かどうか
     * 発表から3分以上経過している場合は無効とする。
     *
     * @param {Datetime} nowTime - 検証対象の Datetime クラス
     * @return {bool} - 緊急地震速報が有効かどうか
     */
    isValid(nowTime) {
        const _nowTime = nowTime.getTime();
        const announcedTime = this.announcedTime.getTime();
        return WolfxJmaEewData.VALID_EEW_DURATION_SECONDS >= ((_nowTime - announcedTime) / 1000)
    }

    /**
     * 警報のテキスト
     * @return {string}
     */
    get warnText() {
        return this.isWarning ? "警報" : "予報";
    }

    /**
     * 報数のテキスト
     * @return {string}
     */
    get serialText() {
        return `第${this.serial}報`;
    }

    /**
     * 震源の規模のテキスト
     * @return {string}
     */
    get magnitudeText() {
        return `M ${this.magnitude}`;
    }


    /**
     * 震源の深さのテキスト
     * @return {string}
     */
    get depthText() {
        if (typeof this.depth === "number") {
            return `約${this.depth}km`;
        } else {
            return "ごく浅い";
        }
    }
}
