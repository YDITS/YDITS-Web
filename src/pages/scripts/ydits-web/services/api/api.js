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

import { Service } from "../../../packages/app-creator/src/service.js";

import { YditsWeb } from "../../ydits-web.js";
import { YahooKmoni } from "./yahoo-kmoni.js";
import { P2pquake } from "./p2pquake.js";
import { Dmdata } from "./dmdata.js";
import { Wolfx } from "../wolfx/wolfx.js";

/**
 * APIを扱う
 */
export class Api extends Service {
    /**
     * @param {YditsWeb} app
     */
    constructor(app) {
        super(app, {
            name: "api",
            description: "APIを扱うサービス。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone",
        });

        this.app = app;

        this.p2pquake = new P2pquake(app);

        if (app.mode === YditsWeb.MODES.eqhistory) {
            return;
        }

        this.wolfx = new Wolfx(app);
        this.yahooKmoni = new YahooKmoni(app);
        this.dmdata = new Dmdata(app);
    }

    /**
     * アプリケーションインスタンス
     * @type {YditsWeb}
     * @override
     */
    app;

    /**
     * P2P地震情報のインスタンス
     * @type {P2pquake}
     */
    p2pquake;

    /**
     * Wolfx APIのインスタンス
     * @type {Wolfx?}
     */
    wolfx = null;

    /**
     * Yahoo強震モニタのインスタンス
     * @type {YahooKmoni?}
     */
    yahooKmoni = null;

    /**
     * Project DM-D.S.S のインスタンス
     * @type {Dmdata?}
     */
    dmdata = null;
}
