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

import { P2PQUAKE_SCALE_TO_INTERNAL_SCALE } from "../../consts/p2pquake/p2pquake-scale-to-internal-scale.js";
import { SCALE_TEXTS_JP } from "../../consts/scale-texts/scale-texts-jp.js";

/**
 * P2P地震情報 震度値 から 日本語震度階級文字列 に変換する
 * @param {keyof typeof P2PQUAKE_SCALE_TO_INTERNAL_SCALE} scale
 * @returns {typeof SCALE_TEXTS_JP[keyof typeof SCALE_TEXTS_JP] | "?"}
 */
export function p2pquakeScaleToTextJp(scale) {
    const internalScale = P2PQUAKE_SCALE_TO_INTERNAL_SCALE[scale] ?? scale;
    return SCALE_TEXTS_JP[internalScale] ?? "?";
}
