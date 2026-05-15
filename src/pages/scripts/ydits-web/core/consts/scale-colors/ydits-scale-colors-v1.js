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
 * 内部震度値 から 震度配色 に変換する object
 * 
 * YDITSカラースキーム(震度配色) - 第1版:  
 * https://www.ydits.net/color-scheme/
 * 
 * @type {scaleColors}
 */
export const YDITS_SCALE_COLORS_V1 = {
    "unknown": {
        background: "#8080c0",
        foreground: "#ffffff",
        border: "#8080c0",
    },
    "0": {
        background: "#8080c0",
        foreground: "#ffffff",
        border: "#8080c0",
    },
    "1": {
        background: "#808080",
        foreground: "#ffffff",
        border: "#808080",
    },
    "2": {
        background: "#4040c0",
        foreground: "#ffffff",
        border: "#4040c0",
    },
    "3": {
        background: "#40c040",
        foreground: "#ffffff",
        border: "#40c040",
    },
    "4": {
        background: "#c0c040",
        foreground: "#ffffff",
        border: "#c0c040",
    },
    "5-": {
        background: "#c0a040",
        foreground: "#ffffff",
        border: "#c0a040",
    },
    "5+": {
        background: "#c08040",
        foreground: "#ffffff",
        border: "#c08040",
    },
    "6-": {
        background: "#c04040",
        foreground: "#ffffff",
        border: "#c04040",
    },
    "6+": {
        background: "#a04040",
        foreground: "#ffffff",
        border: "#a04040",
    },
    "7": {
        background: "#804080",
        foreground: "#ffffff",
        border: "#804080",
    },
};
