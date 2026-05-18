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
 * P2P地震情報 情報コード551: JMAQuake
 * 仕様書の通りです。
 * https://www.p2pquake.net/develop/json_api_v2/
 * @typedef {{
 *     id: string,
 *     code: number,
 *     time: Date | null,
 *     source: string | null,
 *     issueTime: Date | null,
 *     type: "ScalePrompt" | "Destination" | "ScaleAndDestination" | "DetailScale" | "Foreign" | "Other",
 *     correct: "None" | "Unknown" | "ScaleOnly" | "DestinationOnly" | "ScaleAndDestination" | null,
 *     originTime: Date | null,
 *     hypocenterName: string | null,
 *     latitude: number | null,
 *     longitude: number | null,
 *     depth: number | null,
 *     magnitude: number | null,
 *     maxScale: -1 | 10 | 20 | 30 | 40 | 45 | 50 | 55 | 60 | 70 | null,
 *     domesticTsunami: "None" | "Unknown" | "Checking" | "NonEffective" | "Watch" | "Warning" | null,
 *     foreignTsunami: "None" | "Unknown" | "Checking" | "NonEffectiveNearby" | "WarningNearby" | "WarningPacific" | "WarningPacificWide" | "WarningIndian" | "WarningIndianWide" | "Potential" | null,
 *     points: Array<P2pquakeJmaQuakePointArguments> | null,
 *     comments: string,
 * }} P2pquakeJmaQuakeArguments
 */

/**
 * P2P地震情報 情報コード551: JMAQuake 震度観測点の情報
 * 仕様書の通りです。
 * https://www.p2pquake.net/develop/json_api_v2/
 * @typedef {{
 *     pref: string,
 *     addr: string,
 *     isArea: boolean,
 *     scale: -1 | 0 | 10 | 20 | 30 | 40 | 45 | 46 | 50 | 55 | 60 | 70,  // -1, 0 はAPI仕様に記載無し
 * }} P2pquakeJmaQuakePointArguments
 */
