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
 * P2P地震情報 情報コード556: EEW  
 * 値の扱いは概ね仕様書の通りです。  
 * https://www.p2pquake.net/develop/json_api_v2/
 */
export class P2pquakeEew {
    /**
     * 情報を一意に識別するID
     */
    get id() {
        return this.#id;
    }

    /**
     * 情報を一意に識別するID
     * @type {string}
     */
    #id;

    /**
     * 情報コード  
     * 常に556
     */
    get code() {
        return this.#code;
    }

    /**
     * 情報コード  
     * 常に556
     * @type {number}
     */
    #code;

    /**
     * p2pquakeサーバーが情報を受信した時刻
     */
    get time() {
        return this.#time;
    }

    /**
     * p2pquakeサーバーが情報を受信した時刻
     * @type {Date | null}
     */
    #time;

    /**
     * テストかどうか
     */
    get test() {
        return this.#test;
    }

    /**
     * テストかどうか
     * @type {boolean | null}
     */
    #test;

    /**
     * 地震の発生時刻
     */
    get originTime() {
        return this.#originTime;
    }

    /**
     * 地震の発生時刻
     * @type {Date | null}
     */
    #originTime;

    /**
     * 地震の発現時刻
     */
    get arrivalTime() {
        return this.#arrivalTime;
    }

    /**
     * 地震の発現時刻
     * @type {Date | null}
     */
    #arrivalTime;

    /**
     * 仮定震源要素の場合、"仮定震源要素" とする。    
     * 仮定震源要素でない場合、空文字 "" とする。
     */
    get condition() {
        return this.#condition;
    }

    /**
     * 仮定震源要素の場合、"仮定震源要素" とする。    
     * 仮定震源要素でない場合、空文字 "" とする。
     * @type {string | null}
     */
    #condition;

    /**
     * 震央地名
     */
    get hypocenterName() {
        return this.#hypocenterName;
    }

    /**
     * 震央地名
     * @type {string | null}
     */
    #hypocenterName;

    /**
     * 短縮用震央地名
     */
    get hypocenterReduceName() {
        return this.#hypocenterReduceName;
    }

    /**
     * 短縮用震央地名
     * @type {string | null}
     */
    #hypocenterReduceName;

    /**
     * 震源の緯度  
     * 震源情報が存在しない場合は -200 とする。
     */
    get latitude() {
        return this.#latitude;
    }

    /**
     * 震源の緯度  
     * 震源情報が存在しない場合は -200 とする。
     * @type {number | null}
     */
    #latitude;

    /**
     * 震源の経度  
     * 震源情報が存在しない場合は -200 とする。
     */
    get longitude() {
        return this.#longitude;
    }

    /**
     * 震源の経度  
     * 震源情報が存在しない場合は -200 とする。
     * @type {number | null}
     */
    #longitude;

    /**
     * 震源の深さ[km]  
     * 震源情報が存在しない場合は -1 とする。  
     * p2pquakeシステムの都合で小数点が付くが整数部のみ有効。
     */
    get depth() {
        return this.#depth;
    }

    /**
     * 震源の深さ[km]  
     * 震源情報が存在しない場合は -1 とする。  
     * p2pquakeシステムの都合で小数点が付くが整数部のみ有効。
     * @type {number | null}
     */
    #depth;

    /**
     * 震源の深さ[km]の文字列表現  
     * 震源情報が存在しない場合は null とする。  
     * p2pquakeシステムの都合で小数点が付くが整数部のみ有効。
     */
    get depthText() {
        const depth = this.#depth;

        if (depth === null || !Number.isFinite(depth)) {
            return "不明";
        } else if (depth === -1) {
            return "不明";
        } else if (depth === 0) {
            return "ごく浅い";
        }

        return `${Math.round(depth)}km`;
    }

    /**
     * 地震の規模[Mj]  
     * 震源情報が存在しない場合は -1 とする。
     */
    get magnitude() {
        return this.#magnitude;
    }

    /**
     * 地震の規模[Mj]  
     * 震源情報が存在しない場合は -1 とする。
     * @type {number | null}
     */
    #magnitude;

    /**
     * 地震の規模[Mj]の文字列表現  
     */
    get magnitudeText() {
        const magnitude = this.#magnitude;

        if (magnitude === null || !Number.isFinite(magnitude)) {
            return "不明";
        } else if (magnitude === -1) {
            return "不明";
        }

        return `M${magnitude.toFixed(1)}`;
    }

    /**
     * 情報の発表時刻
     */
    get issueTime() {
        return this.#issueTime;
    }

    /**
     * 情報の発表時刻
     * @type {Date | null}
     */
    #issueTime;

    /**
     * イベントID
     */
    get eventId() {
        return this.#eventId;
    }

    /**
     * イベントID
     * @type {string}
     */
    #eventId;

    /**
     * 情報の通番
     */
    get serial() {
        return this.#serial;
    }

    /**
     * 情報の通番
     * @type {number}
     */
    #serial;

    /**
     * 情報の通番の文字列表現
     */
    get serialText() {
        const serial = this.#serial;

        if (!Number.isFinite(serial)) {
            return "";
        }

        return `第${serial}報`;
    }

    /**
     * 取消報かどうか
     */
    get cancelled() {
        return this.#cancelled;
    }

    /**
     * 取消報かどうか
     * @type {boolean}
     */
    #cancelled;

    /**
     * 対象地域(細分区域)
     */
    get areas() {
        return this.#areas;
    }

    /**
     * 対象地域(細分区域)
     * @type {Array<P2pquakeEewArea>}
     */
    #areas;

    /**
     * @param {P2pquakeEewArguments} data
     */
    constructor(data) {
        this.#id = data.id;
        this.#code = data.code;
        this.#time = data.time;
        this.#test = data.test ?? false;  // テストでないときは値が出現しない
        this.#originTime = data.originTime ?? null;
        this.#arrivalTime = data.arrivalTime ?? null;
        this.#condition = data.condition ?? null;
        this.#hypocenterName = data.hypocenterName ?? null;
        this.#hypocenterReduceName = data.hypocenterReduceName ?? null;
        this.#latitude = data.latitude ?? null;
        this.#longitude = data.longitude ?? null;
        this.#depth = data.depth ?? null;
        this.#magnitude = data.magnitude ?? null;
        this.#issueTime = data.issueTime ?? null;
        this.#eventId = data.eventId ?? "";
        this.#serial = data.serial ?? -1;
        this.#cancelled = data.cancelled ?? false;
        this.#areas = data.areas !== null && Array.isArray(data.areas)
            ? data.areas.map((area) => new P2pquakeEewArea(area))
            : [];
    }

    /**
     * JSONからイニシャライズする
     * @param {unknown} json
     * @returns {P2pquakeEew}
     */
    static fromJson(json) {
        const data = json !== null && typeof json === "object"
            ? /** @type {Record<string, unknown>} */ (json)
            : {};

        const _id = data.id ?? data._id;
        const id = typeof _id === "string" ? _id : "";
        const code = typeof data.code === "number" ? data.code : 556;
        const time = typeof data.time === "string" ? new Date(data.time) : null;
        const test = typeof data.test === "boolean" ? data.test : false;  // テストでないときは値が出現しない

        const earthquake = data.earthquake !== null && typeof data.earthquake === "object"
            ? /** @type {Record<string, unknown>} */ (data.earthquake)
            : {};

        const originTime = typeof earthquake.originTime === "string" ? new Date(earthquake.originTime) : null;
        const arrivalTime = typeof earthquake.arrivalTime === "string" ? new Date(earthquake.arrivalTime) : null;
        const condition = typeof earthquake.condition === "string" ? earthquake.condition : null;

        const hypocenter = earthquake.hypocenter !== null && typeof earthquake.hypocenter === "object"
            ? /** @type {Record<string, unknown>} */ (earthquake.hypocenter)
            : {};

        const hypocenterName = typeof hypocenter.name === "string" ? hypocenter.name : null;
        const hypocenterReduceName = typeof hypocenter.reduceName === "string" ? hypocenter.reduceName : null;
        const latitude = typeof hypocenter.latitude === "number" ? hypocenter.latitude : null;
        const longitude = typeof hypocenter.longitude === "number" ? hypocenter.longitude : null;
        const depth = typeof hypocenter.depth === "number" ? hypocenter.depth : null;
        const magnitude = typeof hypocenter.magnitude === "number" ? hypocenter.magnitude : null;

        const issue = data.issue !== null && typeof data.issue === "object"
            ? /** @type {Record<string, unknown>} */ (data.issue)
            : {};
        const issueTime = typeof issue.time === "string" ? new Date(issue.time) : null;
        const eventId = typeof issue.eventId === "string" ? issue.eventId : "";
        const _serial = Number(issue.serial);
        const serial = Number.isFinite(_serial) ? _serial : -1;

        const cancelled = typeof data.cancelled === "boolean" ? data.cancelled : false;  // 不正な値の場合はfalseとして扱う

        const areas = Array.isArray(data.areas)
            ? /** @type {Array<unknown>} */ data.areas
            : [];

        return new P2pquakeEew({
            id,
            code,
            time,
            test,
            originTime,
            arrivalTime,
            condition,
            hypocenterName,
            hypocenterReduceName,
            latitude,
            longitude,
            depth,
            magnitude,
            issueTime,
            eventId,
            serial,
            cancelled,
            areas,
        });
    }
}

/**
 * P2P地震情報 情報コード556: EEW 対象地域(細分区域)  
 * 値の扱いは概ね仕様書の通りです。  
 * https://www.p2pquake.net/develop/json_api_v2/  
 */
export class P2pquakeEewArea {
    /**
     * 府県予報区名
     */
    get pref() {
        return this.#pref;
    }

    /**
     * 府県予報区名
     * @type {string}
     */
    #pref;

    /**
     * 細分区域名
     */
    get name() {
        return this.#name;
    }

    /**
     * 細分区域名
     * @type {string}
     */
    #name;

    /**
     * 予想最大震度の下限  
     * p2pquakeシステムの都合で小数点が付くが整数部のみ有効。  
     * -1: 不明, 0: 震度0, 10: 震度1, 20: 震度2, 30: 震度3, 40: 震度4, 45: 震度5弱, 50: 震度5強, 55: 震度6弱, 60: 震度6強, 70: 震度7
     */
    get scaleFrom() {
        return this.#scaleFrom;
    }

    /**
     * 予想最大震度の下限  
     * p2pquakeシステムの都合で小数点が付くが整数部のみ有効。  
     * -1: 不明, 0: 震度0, 10: 震度1, 20: 震度2, 30: 震度3, 40: 震度4, 45: 震度5弱, 50: 震度5強, 55: 震度6弱, 60: 震度6強, 70: 震度7
     * @type {-1 | 0 | 10 | 20 | 30 | 40 | 45 | 50 | 55 | 60 | 70}
     */
    #scaleFrom;

    /**
     * 予想最大震度の上限  
     * p2pquakeシステムの都合で小数点が付くが整数部のみ有効。  
     * -1: 不明, 0: 震度0, 10: 震度1, 20: 震度2, 30: 震度3, 40: 震度4, 45: 震度5弱, 50: 震度5強, 55: 震度6弱, 60: 震度6強, 70: 震度7, 99: [from]程度以上
     */
    get scaleTo() {
        return this.#scaleTo;
    }

    /**
     * 予想最大震度の上限  
     * p2pquakeシステムの都合で小数点が付くが整数部のみ有効。  
     * -1: 不明, 0: 震度0, 10: 震度1, 20: 震度2, 30: 震度3, 40: 震度4, 45: 震度5弱, 50: 震度5強, 55: 震度6弱, 60: 震度6強, 70: 震度7, 99: [from]程度以上
     * @type {-1 | 0 | 10 | 20 | 30 | 40 | 45 | 50 | 55 | 60 | 70 | 99}
     */
    #scaleTo;

    /**
     * 警報コード  
     * "10": 未到達と予想, "11": 既に到達と予想, "19": 主要動の到達予想なし(PLUM法による震度予想のみ)
     */
    get kindCode() {
        return this.#kindCode;
    }

    /**
     * 警報コード  
     * "10": 未到達と予想, "11": 既に到達と予想, "19": 主要動の到達予想なし(PLUM法による震度予想のみ)
     * @type {"10" | "11" | "19" | null}
     */
    #kindCode;

    /**
     * 主要動の到達予想時刻
     */
    get arrivalTime() {
        return this.#arrivalTime;
    }

    /**
     * 主要動の到達予想時刻
     * @type {Date | null}
     */
    #arrivalTime;

    /**
     * @param {P2pquakeEewAreaArguments} data
     */
    constructor(data) {
        this.#pref = data.pref;
        this.#name = data.name;
        this.#scaleFrom = data.scaleFrom;
        this.#scaleTo = data.scaleTo;
        this.#kindCode = data.kindCode ?? null;
        this.#arrivalTime = data.arrivalTime ?? null;
    }

    /**
     * JSONからイニシャライズする
     * @param {unknown} json
     * @returns {P2pquakeEewArea}
     */
    static fromJson(json) {
        const data = json !== null && typeof json === "object"
            ? /** @type {Record<string, unknown>} */ (json)
            : {};

        const pref = typeof data.perf === "string" ? data.perf : "";
        const name = typeof data.name === "string" ? data.name : "";

        const scaleFrom = typeof data.scaleFrom === "number"
            ? /** @type {0 | -1 | 10 | 20 | 30 | 40 | 45 | 50 | 55 | 60 | 70} */ (data.scaleFrom)
            : -1;

        const scaleTo = typeof data.scaleTo === "number"
            ? /** @type {0 | -1 | 10 | 20 | 30 | 40 | 45 | 50 | 55 | 60 | 70 | 99} */ (data.scaleTo)
            : -1;

        const kindCode = typeof data.kindCode === "string"
            ? /** @type {"10" | "11" | "19" | null} */ (data.kindCode)
            : null;

        const arrivalTime = typeof data.arrivalTime === "string" ? new Date(data.arrivalTime) : null;

        return new P2pquakeEewArea({
            pref,
            name,
            scaleFrom,
            scaleTo,
            kindCode,
            arrivalTime,
        });
    }
}
