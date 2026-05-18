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
import { YDITS_SCALE_COLORS_V1 } from "../../consts/scale-colors/ydits-scale-colors-v1.js";

/**
 * P2P地震情報 震度値 から YDITS震度配色 に変換する
 * @param {keyof typeof P2PQUAKE_SCALE_TO_INTERNAL_SCALE} scale
 * @returns {scaleColors[keyof scaleColors]}
 */
export function p2pquakeScaleToYditsScaleColors(scale) {
    const internalScale = P2PQUAKE_SCALE_TO_INTERNAL_SCALE[scale] ?? scale;
    return YDITS_SCALE_COLORS_V1[internalScale] ?? {
        background: "#404040",
        foreground: "#ffffff",
        border: "#404040",
    };
}
