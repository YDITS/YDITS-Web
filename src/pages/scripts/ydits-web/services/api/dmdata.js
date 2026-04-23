/**!
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 * Licensed under the Apache License 2.0.
 *
 * https://github.com/YDITS/YDITS-Web
 *
 */

import { Service } from "../../../packages/app-creator/src/service.js";
import { PopupDialog } from "../../../packages/popup-dialog/src/popup-dialog.js";
import { YditsWeb } from "../../ydits-web.js";

/**
 * Project DM-D.S.S (dmdata.jp) APIを扱う
 */
export class Dmdata extends Service {
    /**
     * 認証のステート
     */
    static #STATE = "h352ly";

    /**
     * クライアントID
     */
    static #CLIENT_ID = "CId.M7sB113X43c8dDZ6SgEWXOa0gMm4S7tlh0fCM-IEJ5VV";

    /**
     * トークン取得のURI
     */
    static #GET_TOKEN_URI = "https://manager.dmdata.jp/account/oauth2/v1/token";

    /**
     * アカウント認証のベースURL
     */
    static #OAUTH_BASE_URI = "https://manager.dmdata.jp/account/oauth2/v1/auth";

    /**
     * WebSocket接続のエントリーURI
     */
    static #SOCKET_URI = "https://api.dmdata.jp/v2/socket";

    /**
     * アカウント認証後のリダイレクト先URI
     */
    static #OAUTH_REDIRECT_URI = "https://webapp.ydits.net/";

    /**
     * 認証で要求するスコープ(権限)
     */
    static #OAUTH_SCOPE = "socket.start socket.list socket.close eew.get.warning eew.get.forecast";

    /**
     * @param {YditsWeb} app
     */
    constructor(app) {
        super(app, {
            name: "dmdata",
            description: "Project DM-D.S.S (dmdata.jp) APIを扱うサービス。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

        this.app = app;
    }

    /**
     * アプリケーションインスタンス
     * @type {YditsWeb}
     * @override
     */
    app;

    /**
     * アクセストークン
     * @type {string?}
     */
    #accessToken = null;

    /**
     * WebSocketインスタンス
     * @type {WebSocket?}
     */
    #socket = null;

    /**
     * メッセージEEW受信時の処理
     * @param {string} data
     * @returns {Promise<void>}
     */
    async #whenEew(data) {
        const document = await this.#xmlParseToDocument(data);
        console.log(document);
    }

    /**
     * WebSocket接続を開始する
     * @returns {Promise<void>}
     */
    async #startSocket() {
        const dmdataGetClassifications = ["socket.start", "socket.list", "socket.close", "eew.forecast"];

        try {
            const response = await fetch(
                Dmdata.#SOCKET_URI,
                {
                    method: "POST",
                    headers: { "Authorization": "Bearer " + this.#accessToken },
                    body: JSON.stringify({ classifications: dmdataGetClassifications, test: "including" })
                }
            );

            const data = await response.json();

            if (data.error === undefined) {
                this.#socket = new WebSocket(data.websocket.url, ["dmdata.v2"]);

                this.#socket.addEventListener("open", () => {
                    this.app.services.debugLogs.add("network", `[NETWORK]`, "Successfully connected to dmdata.jp and WebSocket opened.");
                    document.getElementById("statusLamp").style.backgroundColor = "#4040ff";
                });

                this.#socket.addEventListener("close", (event) => {
                    this.app.services.debugLogs.add("network", `[NETWORK]`, "Successfully disconnected from dmdata.jp and WebSocket closed.");
                    this.app.services.settings.connect.eew = "yahoo-kmoni";
                });

                this.#socket.addEventListener("message", async (event) => {
                    const message = JSON.parse(event.data);

                    if (message.type === "ping") {
                        this.#socket.send(JSON.stringify({ type: "pong", pingId: message.pingId }));
                    }
                    if (message.type === "data" && message.format === "xml") {
                        await this.#whenEew(message.body);
                    }
                });

                this.#socket.addEventListener("error", event => {
                    this.app.services.debugLogs.add(
                        "error",
                        `[NETWORK]`,
                        `Failed to connect to dmdata.jp: ${event.error}`
                    );

                    new PopupDialog({
                        type: PopupDialog.types.error,
                        id: "errorDmdataConnection",
                        create: true,
                        title: "DM-D.S.S 接続エラー",
                        content: `
                            <p>
                                WebSocket接続中にエラーが発生しました。<br>
                                <code>
                                    ${event}
                                </code>
                            </p>
                        `,
                    });

                    this.app.services.settings.connect.eew = "yahoo-kmoni";
                });
            } else {
                if (document.getElementById("win_dmdata_oauth_error") === null) {
                    this.app.services.debugLogs.add(
                        "error",
                        `[NETWORK]`,
                        `Failed to connect to dmdata.jp.: ${data.error.message}`
                    );

                    new PopupDialog({
                        type: PopupDialog.types.error,
                        id: "errorDmdataConnection",
                        create: true,
                        title: "DM-D.S.S 接続エラー",
                        content: `
                            <p>
                                WebSocket接続に失敗しました。<br>
                                <code>
                                    ${data.error.message}
                                </code>
                            </p>
                        `,
                    });

                    this.app.services.settings.connect.eew = "yahoo-kmoni";
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * 初期化する
     * @returns {Promise<void>}
     */
    async initialize() {
        this.app.services.notify.show("message", "", `${this.name}をイニシャライズしています…`);

        if (this.app.services.settings.connect.eew !== "dmdata") return;

        this.#accessToken = localStorage.getItem("settings-dmdata-access-token");

        if (typeof this.#accessToken === "string") {
            await this.#startSocket();
        } else {
            await this.#setup();
        }
    }

    /**
     * アカウントを認証する
     * @returns {void}
     */
    connect() {
        let url = new URL(Dmdata.#OAUTH_BASE_URI);
        url.searchParams.set("client_id", Dmdata.#CLIENT_ID);
        url.searchParams.set("response_type", "code");
        url.searchParams.set("redirect_uri", Dmdata.#OAUTH_REDIRECT_URI);
        url.searchParams.set("scope", Dmdata.#OAUTH_SCOPE);
        url.searchParams.set("state", Dmdata.#STATE);

        window.open(url.toString(), "_blank");
    }

    /**
     * 認証をセットアップする
     * @returns {Promise<void>}
     */
    async #setup() {
        const responseState = this.#getParam({
            name: "state",
            url: location.href,
        });

        if (responseState !== Dmdata.#STATE) {
            return;
        }

        const responseError = this.#getParam({
            name: "error",
            url: location.href,
        });

        if (responseError === null) {
            await this.#getAccessToken();
        } else {
            await this.#onSetupError();
        }
    }

    /**
     * アクセストークンを取得する
     * @returns {Promise<void>}
     */
    async #getAccessToken() {
        const responseCode = this.#getParam({
            name: "code",
            url: location.href,
        });

        const dmdataFormBody = new URLSearchParams({
            "client_id": Dmdata.#CLIENT_ID,
            "grant_type": "authorization_code",
            "code": responseCode,
        }).toString();

        try {
            const response = await fetch(
                Dmdata.#GET_TOKEN_URI,
                {
                    method: "POST",
                    Host: "manager.dmdata.jp",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: dmdataFormBody
                }
            );

            const data = await response.json();

            if (data["error"] === undefined) {
                this.#accessToken = data["access_token"];
                localStorage.setItem("settings-dmdata-access-token", this.#accessToken);
                await this.#startSocket();
                return;
            } else if (data["error"] === "invalid_grant") {
                this.app.services.debugLogs.add(
                    "error",
                    "[NETWORK]",
                    "DM-D.S.S Account authentication failed."
                );

                new PopupDialog({
                    type: PopupDialog.types.error,
                    id: "errorDmdataOAuth",
                    create: true,
                    title: "DM-D.S.S アカウント認証エラー",
                    content: `
                        <p>
                            dmdataとの接続を続行するにはDM-D.S.Sアカウントを再度連携をしてください。<br>
                            <code>
                                ${data["error"]}<br>
                                ${data["error_description"]}<br>
                            </code>
                        </p>
                    `,
                });
            } else {
                this.app.services.debugLogs.add(
                    "error",
                    "[NETWORK]",
                    "DM-D.S.S Account authentication failed."
                );

                new PopupDialog({
                    type: PopupDialog.types.error,
                    id: "errorDmdataOAuth",
                    create: true,
                    title: "DM-D.S.S アカウント認証エラー",
                    content: `
                        <p>
                            DM-D.S.S アカウント認証でエラーが発生しました。<br>
                            設定をリセットした場合は再度アカウント連携をしてください。<br>
                            <code>
                                ${data["error"]}<br>
                                ${data["error_description"]}<br>
                            </code>
                        </p>
                    `,
                });
            }
        } catch (error) {
            this.app.services.debugLogs.add(
                "error",
                "[NETWORK]",
                "DM-D.S.S Account authentication failed."
            );

            new PopupDialog({
                type: PopupDialog.types.error,
                id: "errorDmdataOAuth",
                create: true,
                title: "DM-D.S.S アカウント認証エラー",
                content: `
                    <p>
                        DM-D.S.S アカウント認証時にエラーが発生しました。<br>
                        <code>${error}</code>
                    </p>
                `,
            });
        }
    }

    /**
     * 認証エラー時の処理
     * @returns {Promise<void>}
     */
    async #onSetupError() {
        this.app.services.debugLogs.add(
            "error",
            "[NETWORK]",
            "DM-D.S.S Account authentication failed."
        );

        const responseErrorDescription = this.#getParam({ name: "error_description", url: location.href });

        new PopupDialog({
            type: PopupDialog.types.error,
            id: "errorDmdataOAuth",
            create: true,
            title: "DM-D.S.S アカウント連携エラー",
            content: `
                <p>
                    ${responseError}<br>
                    ${responseErrorDescription}
                </p>
            `,
        });
    }

    /**
     * URLからパラメーターを取得する
     * @param {{
     *     name: string,
     *     url: URL | string,
     * }} _
     * @returns {string?}
     */
    #getParam({ name, url }) {
        if (typeof url === "string") {
            url = new URL(url);
        }

        const params = url.searchParams;
        const value = params.get(name);

        return value;
    }

    /**
     * XMLをパースする
     * @param {string} data
     * @returns {Promise<Document>}
     */
    async #xmlParseToDocument(data) {
        const buffer = new Uint8Array(
            atob(data).split("").map((c) => c.charCodeAt(0))
        );
        const textDecoder = new TextDecoder();
        const decompressor = new Zlib.Gunzip();
        const decompressed = textDecoder.decode(decompressor.decompress(buffer));

        const parser = new DOMParser();
        const document = parser.parseFromString(decompressed, "application/xml");

        return document;
    }
}
