/*
 *
 * Version
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the MIT License.
 * 
 * https://github.com/yone1130/version/
 *
 */

/**
 * バージョン管理を行う
 */
export class Version {
    /**
     * @param {string} major 
     * @param {string} minor 
     * @param {string} patch 
     * @param {string} level 
     */
    constructor(major, minor, patch, level) {
        this.major = major;
        this.minor = minor;
        this.patch = patch;
        this.level = level;
    }

    /**
     * バージョン文字列を取得する
     * @returns {string}
     */
    get string() {
        if (this.level === Version.LEVELS.beta) {
            return `${this.major}.${this.minor}.${this.patch} (beta)`;
        }

        return `${this.major}.${this.minor}.${this.patch}`;
    }

    /**
     * バージョンレベル
     * @readonly
     * @type {{
     *     final: string,
     *     beta: string,
     * }}
     */
    static LEVELS = {
        final: "final",
        beta: "beta",
    }
}