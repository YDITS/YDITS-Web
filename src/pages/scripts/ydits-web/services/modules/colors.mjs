/*
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the Apache License 2.0.
 *
 */

export class Colors {
    static scaleToColor = {
        "unknown": 0x8080c0,
        "0": 0x8080c0,
        "1": 0x808080,
        "2": 0x4040c0,
        "3": 0x40c040,
        "4": 0xc0c040,
        "5-": 0xc0a040,
        "5+": 0xc08040,
        "6-": 0xc04040,
        "6+": 0xa04040,
        "7": 0x804080,
    }


    static scaleToFontColor = {
        "unknown": 0xffffff,
        "0": 0xffffff,
        "1": 0xffffff,
        "2": 0xffffff,
        "3": 0xffffff,
        "4": 0xffffff,
        "5-": 0xffffff,
        "5+": 0xffffff,
        "6-": 0xffffff,
        "6+": 0xffffff,
        "7": 0xffffff,
    }


    static parseToCssColor(colorInt) {
        return `#${colorInt.toString(16).padStart(6, "0")}`;
    }
}