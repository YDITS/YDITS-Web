/**!
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the Apache License 2.0.
 *
 */

import { WolfxHeartbeatData } from "./data/heart-beat.js";

/**
 * Woldfx JMA EEW WebSocket
 */
export class WolfxJmaEewSocket {
    /**
     * @param {Object} options
     * @param {Object} callbacks - 各コールバック関数のオブジェクト
     */
    constructor(options, callbacks) {
        if (!callbacks.onOpened) {
            throw new Error("Required argument 'callbacks.onOpened' is not specified.");
        }

        if (!callbacks.onClosed) {
            throw new Error("Required argument 'callbacks.onClosed' is not specified.");
        }

        if (!callbacks.onUpdated) {
            throw new Error("Required argument 'callbacks.onUpdated' is not specified.");
        }

        if (!callbacks.onError) {
            throw new Error("Required argument 'callbacks.onError' is not specified.");
        }

        this.callbacks = callbacks;

        /**
         * WebSocketクローズ時に再接続するかどうか
         * @type {bool}
         */
        this.autoReconnect = options.autoReconnect || true;

        try {
            this.connect(this.endpoint);
        } catch (error) {
            throw new Error(`Failed to connect to Wolfx JMA EEW WebSocket: ${error}`);
        }
    }


    /**
     * エンドポイント
     * @type {URL}
     */
    endpoint = new URL("wss://ws-api.wolfx.jp/jma_eew");


    /**
     * 接続中に取得したデータリスト
     * @type {List}
     */
    data = [];


    /**
     * エンドポイントへWebSocket接続を開始する
     * 
     * @param {URL} endpoint
     * @returns {Promise<void>}
     */
    async connect(endpoint) {
        try {
            this.socket = new WebSocket(endpoint);
        } catch (error) {
            throw new Error(`Failed to connect to Wolfx JMA EEW WebSocket: ${error}`);
        }

        this.socket.addEventListener(
            "open",
            (event) => this.onOpened(
                event,
                (isRetried) => this.callbacks.onOpened(isRetried)
            )
        );

        this.socket.addEventListener(
            "close",
            (event) => this.onClosed(
                event,
                (event) => this.callbacks.onClosed(event)
            )
        );

        this.socket.addEventListener(
            "message",
            (event) => this.onMessage(
                event,
                (event, data) => this.callbacks.onUpdated(event, data)
            )
        );

        this.socket.addEventListener(
            "error",
            (event) => this.onError(
                event,
                (event) => this.callbacks.onError(event)
            )
        );
    }


    /**
     * WebSocket接続を切断する
     * 
     * @returns {void}
     */
    disconnect() {
        this.socket.close();
    }


    /**
     * WebSocket接続がオープンした時の処理
     * 
     * @param {Event} event
     * @param {Function} callback - コールバック関数
     * @returns {void}
     */
    onOpened(event, callback) {
        let isRetried = false;

        if (this.socketRetryCount > 0) isRetried = true;

        callback(event, isRetried);

        this.socketRetryCount = 0;
    }


    /**
     * WebSocket接続がクローズした時の処理
     * 
     * @param {CloseEvent} event
     * @param {Function} callback - コールバック関数
     * @returns {void}
     */
    onClosed(event, callback) {
        this.socket = null;

        clearTimeout(this.retryTimeout);

        if (this.autoReconnect) {
            this.retryTimeout = setTimeout(
                (callback) => {
                    callback();
                    this.socketRetryCount++;
                },
                10 * 1000,
                () => this.connect(this.endpoint)
            );
        }

        callback(event);
    }


    /**
     * WebSocket接続でメッセージを受け取った時の処理
     * 
     * @param {MessageEvent<any>} event
     * @param {Function} callback - コールバック関数
     * @returns {void}
     */
    onMessage(event, callback) {
        try {
            let data = JSON.parse(event.data);

            if (data.type === "heartbeat") {
                try {
                    data = new WolfxHeartbeatData(data);
                    this.onGetHeartbeat(data);
                } catch (error) {
                    throw new Error(`Failed to parse data of Wolfx Heartbeat JSON data: ${error}`);
                }
            } else if (data.type === "jma_eew") {
                try {
                    data = new WolfxJmaEewData(data);
                } catch (error) {
                    throw new Error(`Failed to parse data of Wolfx JMA EEW JSON data: ${error}`);
                }
            } else {
                throw new Error(`Unknown data type was response: ${data.type}`);
            }

            callback(event, data);
        } catch (error) {
            throw new Error(`Unhandled error at onMessage: ${error}`);
        }
    }


    /**
     * WebSocket接続でエラーが発生した時の処理
     * 
     * @param {Event} event
     * @param {Function} callback - コールバック関数
     * @returns {void}
     */
    onError(event, callback) {
        callback(event);
    }


    /**
     * ハートビートパケットを受け取った時の処理
     * 
     * @param {WolfxHeartbeatData} data
     * @returns {void}
     */
    onGetHeartbeat(data) {
        this.socket.send(JSON.stringify({
            type: "pong",
            timestamp: data.timestamp,
        }));
    }
}