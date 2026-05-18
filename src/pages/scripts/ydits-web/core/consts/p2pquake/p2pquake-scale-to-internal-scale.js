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
 * P2P地震情報 震度値 から 内部震度値 に変換する object
 * @type {{
 *     "-1": "unknown",
 *     "0": "0",
 *     "00": "0",
 *     "10": "1",
 *     "20": "2",
 *     "30": "3",
 *     "40": "4",
 *     "45": "5-",
 *     "50": "5+",
 *     "55": "6-",
 *     "60": "6+",
 *     "70": "7",
 * }}
 */
export const P2PQUAKE_SCALE_TO_INTERNAL_SCALE = {
    "-1": "unknown",
    "0": "0",
    "00": "0",
    "10": "1",
    "20": "2",
    "30": "3",
    "40": "4",
    "45": "5-",
    "50": "5+",
    "55": "6-",
    "60": "6+",
    "70": "7",
};
