/*
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the Apache License 2.0.
 *
 */

'use strict';

import { Service } from "../../../service.mjs";
import { YahooKmoni } from "./yahoo-kmoni.mjs";
import { P2pquake } from "./p2pquake.mjs";
import { Dmdata } from "./dmdata.mjs";
import { Wolfx } from "./wolfx.mjs";

/**
 * APIを扱う。
 */
export class Api extends Service {
    constructor(app) {
        super(app, {
            name: "api",
            description: "APIを扱うサービスです。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

        this.wolfx = new Wolfx(app);
        this.p2pquake = new P2pquake(app);
        this.yahooKmoni = new YahooKmoni(app);
        this.dmdata = new Dmdata(app);
    }
}