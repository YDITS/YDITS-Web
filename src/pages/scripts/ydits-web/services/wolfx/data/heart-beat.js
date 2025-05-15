/**!
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the Apache License 2.0.
 *
 */

/**
 * Wolfx ハートビートパケット のデータクラス
 */
export class WolfxHeartbeatData {
    /**
     * @param {Object<string, string>} data - Wolfx ハートビートパケット のJSONデータクラス
     */
    constructor(data) {
        this.type = "heartbeat";
        this.ver = data["ver"] || null;
        this.id = data["id"] || null;
        this.timestamp = data["timestamp"] || null;
        this.message = data["message"] || null;
    }
}