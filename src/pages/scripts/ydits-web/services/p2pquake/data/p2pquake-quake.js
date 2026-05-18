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

import { P2PQUAKE_EQINFO_TYPE_TEXTS_JP_SHORT } from "../../../core/consts/p2pquake/p2pquake-eqinfo-type-texts-jp";

/**
 * P2P地震情報 情報コード551: JMAQuake  
 * 値の扱いは概ね仕様書の通りです。  
 * https://www.p2pquake.net/develop/json_api_v2/
 */
export class P2pquakeJmaQuake {
    /**
     * 既定の情報コード
     */
    static DEFAULT_CODE = 551;

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
     * 常に551
     */
    get code() {
        return this.#code;
    }

    /**
     * 情報コード  
     * 常に551
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
     * 情報の発表元
     */
    get source() {
        return this.#source;
    }

    /**
     * 情報の発表元
     * @type {string | null}
     */
    #source;

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
     * 情報の発表種類
     */
    get type() {
        return this.#type;
    }

    /**
     * 情報の発表種類
     * @type {"ScalePrompt" | "Destination" | "ScaleAndDestination" | "DetailScale" | "Foreign" | "Other"}
     */
    #type;

    /**
     * 情報の発表種類の日本語文字列表現
     * @return {typeof P2PQUAKE_EQINFO_TYPE_TEXTS_JP_SHORT[keyof typeof P2PQUAKE_EQINFO_TYPE_TEXTS_JP_SHORT] | "(不正な地震情報種別)"}
     */
    get typeText() {
        return P2PQUAKE_EQINFO_TYPE_TEXTS_JP_SHORT[this.#type] ?? "(不正な地震情報種別)";
    }

    /**
     * 訂正の有無
     */
    get correct() {
        return this.#correct;
    }

    /**
     * 訂正の有無
     * @type {"None" | "Unknown" | "ScaleOnly" | "DestinationOnly" | "ScaleAndDestination" | null}
     */
    #correct;

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
     */
    get depth() {
        return this.#depth;
    }

    /**
     * 震源の深さ[km]  
     * 震源情報が存在しない場合は -1 とする。
     * @type {number | null}
     */
    #depth;

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
     * 最大震度  
     * 震度情報が存在しない場合は -1 する。
     */
    get maxScale() {
        return this.#maxScale;
    }

    /**
     * 最大震度  
     * 震度情報が存在しない場合は -1 する。
     * @type {-1 | 10 | 20 | 30 | 40 | 45 | 50 | 55 | 60 | 70 | null}
     */
    #maxScale;

    /**
     * 国内への津波の有無
     */
    get domesticTsunami() {
        return this.#domesticTsunami;
    }

    /**
     * 国内への津波の有無
     * @type {"None" | "Unknown" | "Checking" | "NonEffective" | "Watch" | "Warning" | null}
     */
    #domesticTsunami;

    /**
     * 海外での津波の有無
     */
    get foreignTsunami() {
        return this.#foreignTsunami;
    }

    /**
     * 海外での津波の有無
     * @type {"None" | "Unknown" | "Checking" | "NonEffectiveNearby" | "WarningNearby" | "WarningPacific" | "WarningPacificWide" | "WarningIndian" | "WarningIndianWide" | "Potential" | null}
     */
    #foreignTsunami;

    /**
     * 震度観測点の情報
     */
    get points() {
        return this.#points;
    }

    /**
     * 震度観測点の情報
     * @type {Array<P2pquakeJmaQuakePoint>}
     */
    #points;

    /**
     * 自由付加文  
     * ない場合は空文字列とする。  
     * 気象庁の発表電文に含まれる自由付加文をそのまま提供しており、火山噴火に伴って発表される遠地地震に関する情報では、「大規模な噴火が発生しました」という文言が含まれる。
     */
    get comments() {
        return this.#comments;
    }

    /**
     * 自由付加文  
     * ない場合は空文字列とする。  
     * 気象庁の発表電文に含まれる自由付加文をそのまま提供しており、火山噴火に伴って発表される遠地地震に関する情報では、「大規模な噴火が発生しました」という文言が含まれる。
     * @type {string}
     */
    #comments;

    /**
     * @param {P2pquakeJmaQuakeArguments} data
     */
    constructor(data) {
        this.#id = data.id;
        this.#code = data.code;
        this.#time = data.time;
        this.#source = data.source ?? null;
        this.#issueTime = data.issueTime ?? null;
        this.#type = data.type;
        this.#correct = data.correct ?? null;
        this.#originTime = data.originTime ?? null;
        this.#hypocenterName = data.hypocenterName ?? null;
        this.#latitude = data.latitude ?? null;
        this.#longitude = data.longitude ?? null;
        this.#depth = data.depth ?? null;
        this.#magnitude = data.magnitude ?? null;
        this.#maxScale = data.maxScale ?? null;
        this.#domesticTsunami = data.domesticTsunami ?? null;
        this.#foreignTsunami = data.foreignTsunami ?? null;
        this.#points = data.points !== null && Array.isArray(data.points)
            ? data.points.map((point) => new P2pquakeJmaQuakePoint(point))
            : [];
        this.#comments = data.comments ?? "";
    }

    /**
     * JSONからイニシャライズする
     * @param {unknown} json
     * @returns {P2pquakeJmaQuake}
     */
    static fromJson(json) {
        const data = json !== null && typeof json === "object"
            ? /** @type {Record<string, unknown>} */ (json)
            : {};

        const id = typeof data.id === "string" ? data.id : "";
        const code = typeof data.code === "number" ? data.code : P2pquakeJmaQuake.DEFAULT_CODE;
        const time = typeof data.time === "string" ? new Date(data.time) : null;

        const issue = data.issue !== null && typeof data.issue === "object"
            ? /** @type {Record<string, unknown>} */ (data.issue)
            : {};

        const source = typeof issue.source === "string" ? issue.source : null;
        const issueTime = typeof issue.time === "string" ? new Date(issue.time) : null;

        const type = typeof issue.type === "string"
            ? /** @type {"ScalePrompt" | "Destination" | "ScaleAndDestination" | "DetailScale" | "Foreign" | "Other"} */ (issue.type)
            : "Other";

        const correct = typeof issue.correct === "string"
            ? /** @type {"ScaleAndDestination" | "None" | "Unknown" | "ScaleOnly" | "DestinationOnly" | null} */ (issue.correct)
            : null;

        const earthquake = data.earthquake !== null && typeof data.earthquake === "object"
            ? /** @type {Record<string, unknown>} */ (data.earthquake)
            : {};

        const originTime = typeof earthquake.time === "string" ? new Date(earthquake.time) : null;

        const maxScale = typeof earthquake.maxScale === "number"
            ? /** @type {-1 | 10 | 20 | 30 | 40 | 45 | 50 | 55 | 60 | 70} */ (earthquake.maxScale)
            : null;

        const domesticTsunami = typeof earthquake.domesticTsunami === "string"
            ? /** @type {"None" | "Unknown" | "Checking" | "NonEffective" | "Watch" | "Warning" | null} */ (earthquake.domesticTsunami)
            : null;

        const foreignTsunami = typeof earthquake.foreignTsunami === "string"
            ? /** @type {"None" | "Unknown" | "Checking" | "NonEffectiveNearby" | "WarningNearby" | "WarningPacific" | "WarningPacificWide" | "WarningIndian" | "WarningIndianWide" | "Potential" | null} */ (earthquake.foreignTsunami)
            : null;

        const hypocenter = earthquake.hypocenter !== null && typeof earthquake.hypocenter === "object"
            ? /** @type {Record<string, unknown>} */ (earthquake.hypocenter)
            : {};

        const hypocenterName = typeof hypocenter.name === "string" ? hypocenter.name : null;
        const latitude = typeof hypocenter.latitude === "number" ? hypocenter.latitude : null;
        const longitude = typeof hypocenter.longitude === "number" ? hypocenter.longitude : null;
        const depth = typeof hypocenter.depth === "number" ? hypocenter.depth : null;
        const magnitude = typeof hypocenter.magnitude === "number" ? hypocenter.magnitude : null;

        const points = Array.isArray(data.points)
            ? /** @type {Array<unknown>} */ data.points
            : [];

        const _comments = data.comments !== null && typeof data.comments === "object"
            ? /** @type {Record<string, unknown>} */ (data.comments)
            : /** @type {Record<string, unknown>} */ ({});

        const comments = typeof _comments.freeFormComment === "string" ? _comments.freeFormComment : "";

        return new P2pquakeJmaQuake({
            id,
            code,
            time,
            source,
            issueTime,
            type,
            correct,
            originTime,
            hypocenterName,
            latitude,
            longitude,
            depth,
            magnitude,
            maxScale,
            domesticTsunami,
            foreignTsunami,
            points,
            comments,
        });
    }
}

/**
 * P2P地震情報 情報コード551: JMAQuake 震度観測点の情報  
 * 値の扱いは概ね仕様書の通りです。  
 * https://www.p2pquake.net/develop/json_api_v2/  
 */
export class P2pquakeJmaQuakePoint {
    /**
     * 都道府県名
     */
    get perf() {
        return this.#pref;
    }

    /**
     * 都道府県名
     * @type {string}
     */
    #pref;

    /**
     * 観測点の名称
     * 震度速報の場合は 震度速報／地方予報区 名
     */
    get addr() {
        return this.#addr;
    }

    /**
     * 観測点の名称
     * 震度速報の場合は 震度速報／地方予報区 名
     * @type {string}
     */
    #addr;

    /**
     * 区域名かどうか
     */
    get isArea() {
        return this.#isArea;
    }

    /**
     * 区域名かどうか
     * @type {boolean}
     */
    #isArea;

    /**
     * 震度   
     * -1: 不明, 0: 震度0, 10: 震度1, 20: 震度2, 30: 震度3, 40: 震度4, 45: 震度5弱, 46: 震度5弱以上と推定されるが震度情報を入手していない, 50: 震度5強, 55: 震度6弱, 60: 震度6強, 70: 震度7
     */
    get scale() {
        return this.#scale;
    }

    /**
     * 震度  
     * -1: 不明, 0: 震度0, 10: 震度1, 20: 震度2, 30: 震度3, 40: 震度4, 45: 震度5弱, 46: 震度5弱以上と推定されるが震度情報を入手していない, 50: 震度5強, 55: 震度6弱, 60: 震度6強, 70: 震度7
     * @type {-1 | 0 | 10 | 20 | 30 | 40 | 45 | 46 | 50 | 55 | 60 | 70 | 99}
     */
    #scale;

    /**
     * @param {P2pquakeJmaQuakePointArguments} data
     */
    constructor(data) {
        this.#pref = data.pref;
        this.#addr = data.addr;
        this.#isArea = data.isArea;
        this.#scale = data.scale;
    }

    /**
     * JSONからイニシャライズする
     * @param {unknown} json
     * @returns {P2pquakeJmaQuakePoint}
     */
    static fromJson(json) {
        const data = json !== null && typeof json === "object"
            ? /** @type {Record<string, unknown>} */ (json)
            : {};

        const pref = typeof data.pref === "string" ? data.pref : "";
        const addr = typeof data.addr === "string" ? data.addr : "";
        const isArea = typeof data.isArea === "boolean" ? data.isArea : false;

        const scale = typeof data.scale === "number"
            ? /** @type {0 | -1 | 10 | 20 | 30 | 40 | 45 | 46 | 50 | 55 | 60 | 70} */ (data.scale)
            : -1;

        return new P2pquakeJmaQuakePoint({
            pref,
            addr,
            isArea,
            scale,
        });
    }
}
