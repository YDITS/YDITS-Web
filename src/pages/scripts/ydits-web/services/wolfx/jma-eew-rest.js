/**!
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the Apache License 2.0.
 *
 */

import { WolfxJmaEewData } from "./data/jma-eew.js";

/**
 * Woldfx JMA EEW REST
 */
export class WolfxJmaEewRest {
    endpoint = new URL("https://api.wolfx.jp/jma_eew.json");


    /**
     * エンドポイントから情報を取得する
     * @returns {Promise<WolfxJmaEewData>} - 取得した Wolfx JMA EEW のデータクラス
     */
    async fetch() {
        this.endpoint.searchParams.set("nocache", Date.now());
        const response = await fetch(this.endpoint);

        if (!response.ok) {
            throw new Error(`Failed to fetch data from Wolfx JMA EEW REST API:\nresponse.status: ${response.status} ${response.statusText}`);
        }

        return new WolfxJmaEewData(await response.json());
    }
}