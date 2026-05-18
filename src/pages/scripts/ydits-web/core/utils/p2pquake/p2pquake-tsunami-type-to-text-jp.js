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

import { P2PQUAKE_TSUNAMI_TEXTS_JP_SHORT } from "../../consts/p2pquake/p2pquake-tsunami-texts-jp.js";
import { P2PQUAKE_TSUNAMI_TEXTS_JP_FULL } from "../../consts/p2pquake/p2pquake-tsunami-texts-jp.js";

/**
 * P2P地震情報 津波種別 から 日本語津波文字列(語尾省略) へ変換する
 * @param {keyof typeof P2PQUAKE_TSUNAMI_TEXTS_JP_SHORT} type
 * @returns {typeof P2PQUAKE_TSUNAMI_TEXTS_JP_SHORT[keyof typeof P2PQUAKE_TSUNAMI_TEXTS_JP_SHORT] | "(不正な津波種別)"}
 */
export function p2pquakeTsunamiTypeToTextJpShort(type) {
    if (["None", "Unknown", "Checking"].includes(type)) {
        return `津波の${P2PQUAKE_TSUNAMI_TEXTS_JP_SHORT[type]}`;
    }

    return P2PQUAKE_TSUNAMI_TEXTS_JP_SHORT[type] ?? "(不正な津波種別)";
}

/**
 * P2P地震情報 津波種別 から 日本語津波文字列(語尾有り) へ変換する
 * @param {keyof typeof P2PQUAKE_TSUNAMI_TEXTS_JP_FULL} type
 * @returns {typeof P2PQUAKE_TSUNAMI_TEXTS_JP_FULL[keyof typeof P2PQUAKE_TSUNAMI_TEXTS_JP_FULL] | "(不正な津波種別)"}
 */
export function p2pquakeTsunamiTypeToTextJpFull(type) {
    if (["None", "Unknown", "Checking"].includes(type)) {
        return `津波の${P2PQUAKE_TSUNAMI_TEXTS_JP_FULL[type]}`;
    }

    return P2PQUAKE_TSUNAMI_TEXTS_JP_FULL[type] ?? "(不正な津波種別)";
}
