/**!
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the Apache License 2.0.
 *
 */

import { Service } from "../../../packages/app-creator/src/service.js";

import { YahooKmoni } from "./yahoo-kmoni.js";
import { P2pquake } from "./p2pquake.js";
import { Dmdata } from "./dmdata.js";
import { Wolfx } from "../wolfx/wolfx.js";

/**
 * APIを扱う
 */
export class Api extends Service {
    /**
     * @param {App} app 
     */
    constructor(app) {
        super(app, {
            name: "api",
            description: "APIを扱うサービス。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

        this.p2pquake = new P2pquake(app);
        if (app.isEqhistoryMode) return;

        this.wolfx = new Wolfx(app);
        this.yahooKmoni = new YahooKmoni(app);
        this.dmdata = new Dmdata(app);
    }
}