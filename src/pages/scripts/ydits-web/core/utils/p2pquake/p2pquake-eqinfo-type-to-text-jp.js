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

import { P2PQUAKE_EQINFO_TYPE_TEXTS_JP_SHORT } from "../../consts/p2pquake/p2pquake-eqinfo-type-texts-jp.js";
import { P2PQUAKE_EQINFO_TYPE_TEXTS_JP_FULL } from "../../consts/p2pquake/p2pquake-eqinfo-type-texts-jp.js";

/**
 * P2P地震情報 地震情報種別 から 日本語地震情報種別文字列(短縮) に変換する
 * @param {keyof typeof P2PQUAKE_EQINFO_TYPE_TEXTS_JP_SHORT} type
 * @returns {typeof P2PQUAKE_EQINFO_TYPE_TEXTS_JP_SHORT[keyof typeof P2PQUAKE_EQINFO_TYPE_TEXTS_JP_SHORT] | "(不正な地震情報種別)"}
 */
export function p2pquakeEqinfoTypeToTextJpShort(type) {
    return P2PQUAKE_EQINFO_TYPE_TEXTS_JP_SHORT[type] ?? "(不正な情報種別)";
}

/**
 * P2P地震情報 地震情報種別 から 日本語地震情報種別文字列(完全) に変換する
 * @param {keyof typeof P2PQUAKE_EQINFO_TYPE_TEXTS_JP_FULL} type
 * @returns {typeof P2PQUAKE_EQINFO_TYPE_TEXTS_JP_FULL[keyof typeof P2PQUAKE_EQINFO_TYPE_TEXTS_JP_FULL] | "(不正な地震情報種別)"}
 */
export function p2pquakeEqinfoTypeToTextJpFull(type) {
    return P2PQUAKE_EQINFO_TYPE_TEXTS_JP_FULL[type] ?? "(不正な情報種別)";
}
