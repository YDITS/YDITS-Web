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
 * 仕様書の通りです。
 * https://www.p2pquake.net/develop/json_api_v2/
 * @typedef {{
 *     id: string,
 *     code: number,
 *     time: Date | null,
 *     test: boolean | null,
 *     originTime: Date | null,
 *     arrivalTime: Date | null,
 *     condition: string | null,
 *     hypocenterName: string | null,
 *     hypocenterReduceName: string | null,
 *     latitude: number | null,
 *     longitude: number | null,
 *     depth: number | null,
 *     magnitude: number | null,
 *     issueTime: Date | null,
 *     eventId: string,
 *     serial: number,  // API仕様はstring
 *     cancelled: boolean,
 *     areas: Array<P2pquakeEewAreaArguments> | null,
 * }} P2pquakeEewArguments
 */

/**
 * P2P地震情報 情報コード556: EEW 対象地域(細分区域)
 * 仕様書の通りです。
 * https://www.p2pquake.net/develop/json_api_v2/
 * @typedef {{
 *     pref: string,
 *     name: string,
 *     scaleFrom: -1 | 0 | 10 | 20 | 30 | 40 | 45 | 50 | 55 | 60 | 70,
 *     scaleTo: -1 | 0 | 10 | 20 | 30 | 40 | 45 | 50 | 55 | 60 | 70 | 99,
 *     kindCode: "10" | "11" | "19" | null,
 *     arrivalTime: Date | null,
 * }} P2pquakeEewAreaArguments
 */
