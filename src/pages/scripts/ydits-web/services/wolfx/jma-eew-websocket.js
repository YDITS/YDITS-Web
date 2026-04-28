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

import { WolfxHeartbeatData } from "./data/heart-beat.js";
import { WolfxJmaEewData } from "./data/jma-eew.js";

/**
 * Woldfx JMA EEW WebSocket
 */
export class WolfxJmaEewSocket {
    /**
     * @param {{
     *     autoReconnect: boolean,
     * }} options
     * @param {{
     *     onOpened: (event: Event, isRetried: boolean) => void,
     *     onClosed: (event: CloseEvent) => void,
     *     onUpdated: (event: MessageEvent<any>, data: WolfxJmaEewData | WolfxHeartbeatData) => void,
     *     onError: (event: Event) => void,
     * }} callbacks - 各コールバック関数のオブジェクト
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
         * @type {boolean}
         */
        this.autoReconnect = typeof options.autoReconnect === "boolean" ? options.autoReconnect : true;

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
     * @type {[]}
     */
    data = [];

    /**
     * WebSocketインスタンス
     * @type {WebSocket | null}
     */
    socket = null;

    /**
     * 再接続用のTimeout ID
     * @type {number | null}
     */
    retryTimeout = null;

    /**
     * WebSocketの再接続試行のインターバル[ms]
     * @type {number}
     */
    reconnectIntervalMs = 0;

    /**
     * エンドポイントへWebSocket接続を開始する
     *
     * @param {URL} endpoint
     * @returns {Promise<void>}
     */
    async connect(endpoint) {
        if (!navigator.onLine) {
            return;
        }

        if (
            this.socket?.readyState === WebSocket.OPEN ||
            this.socket?.readyState === WebSocket.CONNECTING
        ) {
            return;
        }

        try {
            this.socket = new WebSocket(endpoint);
        } catch (error) {
            throw new Error(`Failed to connect to Wolfx JMA EEW WebSocket: ${error}`);
        }

        this.socket.addEventListener(
            "open",
            (event) => this.onOpened(
                event,
                (event, isRetried) => this.callbacks.onOpened(event, isRetried)
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
     * @returns {void}
     */
    disconnect() {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.close();
            this.socket = null;
        }
    }

    /**
     * WebSocketを再接続する
     */
    reconnect() {
        if (this.retryTimeout) clearTimeout(this.retryTimeout);
        this.retryTimeout = setTimeout(
            () => this.connect(this.endpoint),
            this.reconnectIntervalMs
        );

        if (this.reconnectIntervalMs === 0) {
            // 再接続インターバルの初期値
            this.reconnectIntervalMs = 2000;
        } else if (this.reconnectIntervalMs >= 60000) {
            // 再接続インターバルの最大値
            this.reconnectIntervalMs = 60000;
        } else {
            // 指数関数的な再接続インターバル増加
            this.reconnectIntervalMs *= 2;
        }
    }

    /**
     * WebSocket接続がオープンした時の処理
     * @param {Event} event
     * @param {(event: Event, isRetried: boolean) => void} callback - コールバック関数
     * @returns {void}
     */
    onOpened(event, callback) {
        const isRetried = this.reconnectIntervalMs > 0 ? true : false;
        callback(event, isRetried);
        this.retryTimeout = null;
        this.reconnectIntervalMs = 0;
    }

    /**
     * WebSocket接続がクローズした時の処理
     * @param {CloseEvent} event
     * @param {(event: CloseEvent) => void} callback - コールバック関数
     * @returns {void}
     */
    onClosed(event, callback) {
        this.socket = null;

        if (!navigator.onLine) {
            return;
        }

        callback(event);

        if (this.autoReconnect) {
            this.reconnect();
        }
    }

    /**
     * WebSocket接続でエラーが発生した時の処理
     * @param {Event} event
     * @param {(event: Event) => void} callback - コールバック関数
     * @returns {void}
     */
    onError(event, callback) {
        this.socket = null;

        if (!navigator.onLine) {
            return;
        }

        callback(event);

        if (this.autoReconnect) {
            this.reconnect();
        }
    }

    /**
     * WebSocket接続でメッセージを受け取った時の処理
     * @param {MessageEvent<any>} event
     * @param {(event: MessageEvent<any>, data: WolfxJmaEewData | WolfxHeartbeatData) => void} callback - コールバック関数
     * @returns {void}
     */
    onMessage(event, callback) {
        try {
            let raw = JSON.parse(event.data);

            /**@type {WolfxJmaEewData | WolfxHeartbeatData}*/
            let data;

            if (raw.type === "heartbeat") {
                try {
                    data = new WolfxHeartbeatData(raw);
                    this.onGetHeartbeat(data);
                } catch (error) {
                    throw new Error(`Failed to parse data of Wolfx Heartbeat JSON data: ${error}`);
                }
            } else if (raw.type === "jma_eew") {
                try {
                    data = new WolfxJmaEewData(raw);
                } catch (error) {
                    throw new Error(`Failed to parse data of Wolfx JMA EEW JSON data: ${error}`);
                }
            } else {
                throw new Error(`Unknown data type was response: ${raw?.type}`);
            }

            callback(event, data);
        } catch (error) {
            throw new Error(`Unhandled error at onMessage: ${error}`);
        }
    }

    /**
     * ハートビートを受け取った時の処理
     * @param {WolfxHeartbeatData} data
     * @returns {void}
     */
    onGetHeartbeat(data) {
        if (this.socket?.readyState !== WebSocket.OPEN) {
            return;
        }

        this.socket.send(JSON.stringify({
            type: "pong",
            timestamp: data.timestamp,
        }));
    }
}
