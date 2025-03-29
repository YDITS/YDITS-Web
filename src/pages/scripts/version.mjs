/*
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the Apache License 2.0.
 *
 */

/**
 * バージョン管理を行います。
 */
export class Version {
    constructor(major, minor, patch, level) {
        this.major = major;
        this.minor = minor;
        this.patch = patch;
        this.level = level;
    }

    get string() {
        if (this.level === Version.levels.beta) {
            return `${this.major}.${this.minor}.${this.patch} (beta)`;
        }

        return `${this.major}.${this.minor}.${this.patch}`;
    }

    static levels = {
        final: "final",
        beta: "beta",
    }
}