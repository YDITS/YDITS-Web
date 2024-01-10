
import { Service } from "../../service.mjs";
import { YahooKmoni } from "./yahoo-kmoni.mjs";
import { P2pquake } from "./p2pquake.mjs";
import { Dmdata } from "./dmdata.mjs";


/**
 * APIを扱うサービスです。
 */
export class Api extends Service {
    yahooKmoni = null;
    p2pquake = null;
    dmdata = null;


    constructor(app) {
        super(app, {
            name: "api",
            description: "APIを扱うサービスです。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

        this.yahooKmoni = new YahooKmoni(app);
        this.p2pquake = new P2pquake(app);
        this.dmdata = new Dmdata(app);
    }
}