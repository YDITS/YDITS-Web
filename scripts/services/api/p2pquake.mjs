/*
 *
 * p2pquake.mjs | YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

import { Service } from "../../service.mjs";


/**
 * P2P地震情報 APIを扱うサービスです。
 */
export class P2pquake extends Service {
    eqinfoNum = 0;

    id = {
        id: null,
        lastId: null,
        eventId: null,
        lastEvengId: null,
        serial: null,
        lastSerial: null,
    }

    socket = null;
    socketRetryCount = 0;
    isError = false;

    urlRestEew = new URL("https://api.p2pquake.net/v2/history?codes=556&limit=1");
    urlRestEqinfo = new URL("https://api.p2pquake.net/v2/history?codes=551&limit=100");
    urlSocket = new URL("wss://api.p2pquake.net/v2/ws");

    // DEBUG
    // urlRestEew = new URL("https://api.p2pquake.net/v2/history?codes=556&limit=1&offset=16");
    // urlSocket = new URL("wss://api-realtime-sandbox.p2pquake.net/v2/ws");

    maxScaleText = {
        "-1": "?",
        "0": "0",
        "10": "1",
        "20": "2",
        "30": "3",
        "40": "4",
        "45": "5弱",
        "50": "5強",
        "55": "6弱",
        "60": "6強",
        "70": "7"
    }

    typesJp = {
        "ScalePrompt": "震度速報",
        "Destination": "震源情報",
        "ScaleAndDestination": "震源・震度情報",
        "DetailScale": "各地の震度情報",
        "Foreign": "遠地地震情報",
        "Other": "地震情報"
    }

    tsunamiLevels = {
        'None': '津波の心配なし',
        'Unknown': '津波の影響は不明',
        'Checking': '津波の影響を現在調査中',
        'NonEffective': '若干の海面変動が予想されるが、被害の心配はなし',
        'Watch': '津波注意報が発表',
        'Warning': '津波警報等（大津波警報・津波警報あるいは津波注意報）が発表'
    };

    colors = {
        "-1": {
            "bgcolor": "#8080c0",
            "color": "#ffffff"
        },
        "0": {
            "bgcolor": "#8080c0",
            "color": "#ffffff"
        },
        "10": {
            "bgcolor": "#808080",
            "color": "#ffffff"
        },
        "20": {
            "bgcolor": "#4040c0",
            "color": "#ffffff"
        },
        "30": {
            "bgcolor": "#40c040",
            "color": "#ffffff"
        },
        "40": {
            "bgcolor": "#c0c040",
            "color": "#ffffff"
        },
        "45": {
            "bgcolor": "#c0a040",
            "color": "#ffffff"
        },
        "50": {
            "bgcolor": "#c08040",
            "color": "#ffffff"
        },
        "55": {
            "bgcolor": "#c04040",
            "color": "#ffffff"
        },
        "60": {
            "bgcolor": "#a04040",
            "color": "#ffffff"
        },
        "70": {
            "bgcolor": "#804080",
            "color": "#ffffff"
        }
    }


    constructor(app) {
        super(app, {
            name: "p2pquake",
            description: "Yahoo! 強震モニタを扱うサービスです。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

        this.startSocket();
    }


    List = class {
        id = null;
        type = null;
    }


    zeroPadding(value) {
        value = "0" + value;
        value = value.slice(-2);
        return value;
    }


    push(code) {
        try {
            switch (code) {
                // eqinfo
                case 551:
                    Push.create(
                        this._app.services.eqinfo.typeJp,
                        {
                            body: `${this._app.services.eqinfo.regionName}を震源とする、最大震度${this._app.services.eqinfo.maxScaleText}の地震がありました。\n規模は${this._app.services.eqinfo.magnitudeText}、深さは${this._app.services.eqinfo.depthText}と推定されます。\n${this._app.services.eqinfo.tsunamiJp}`,
                            onClick: function () {
                                window.focus();
                                this.close();
                            }
                        }
                    );

                    this.notify.show(
                        "message",
                        data["type"],
                        `
                            ${this._app.services.eqinfo.regionName}を震源とする、最大震度${this._app.services.eqinfo.maxScaleText}の地震がありました。<br>
                            規模は${this._app.services.eqinfo.magnitudeText}、深さは${this._app.services.eqinfo.depthText}と推定されます。<br>
                            ${this._app.services.eqinfo.tsunamiJp}
                        `
                    );
                    break;

                // EEW
                case 556:
                    try {
                        Push.create(
                            `緊急地震速報 (警報)`,
                            {
                                body: `《次の地域では強い揺れに備えてください。》\n${this._app.services.eew.warnAreasText}`,
                                onClick: function () {
                                    window.focus();
                                    this.close();
                                }
                            }
                        );
                    } catch (error) {
                        console.error(error);
                    }

                    this._app.services.notify.show(
                        "eew",
                        `緊急地震速報 (警報)`,
                        `
                            《次の地域では強い揺れに備えてください。》<br>
                            ${this._app.services.eew.warnAreasText}
                        `
                    );
                    break;

                default:
                    return;
            }
        } catch (error) {
            console.error(error);
        }
    }


    initialize() {
        fetch(this.urlRestEew)
            .then((response) => response.json())
            .then((data) => {
                try {
                    const DATA = data[0];

                    if (this._app.services.eew.reports[DATA._id] === undefined) {
                        this._app.services.eew.reports[DATA._id] = new this._app.services.eew.Report();
                    }

                    this._app.services.eew.currentId = DATA._id;

                    const NOW_TIME = this._app.services.datetime.gmt.getTime();
                    const ISSUE_TIME = new Date(DATA.issue.time).getTime();

                    // EEW発表から3分以下の場合は警報処理をする
                    if (((NOW_TIME - ISSUE_TIME) / 1000) >= 180) { return }

                    this._app.services.eew.isEew = true;
                    this._app.services.eew.reports[DATA._id].isWarning = true;

                    this._app.services.eew.reports[DATA._id].originTime = new Date(DATA.earthquake.originTime);

                    if (!(this._app.services.eew.reports[DATA._id].originTime instanceof Date)) {
                        this._app.services.eew.reports[DATA._id].originTimeText = "----/--/-- --:--";
                    } else {
                        this._app.services.eew.reports[DATA._id].originTimeText =
                            `${this._app.services.eew.reports[DATA._id].originTime.getFullYear()}/` +
                            `${this.zeroPadding(this._app.services.eew.reports[DATA._id].originTime.getMonth() + 1)}/` +
                            `${this.zeroPadding(this._app.services.eew.reports[DATA._id].originTime.getDate())} ` +
                            `${this.zeroPadding(this._app.services.eew.reports[DATA._id].originTime.getHours())}:` +
                            `${this.zeroPadding(this._app.services.eew.reports[DATA._id].originTime.getMinutes())}`
                    }

                    if (DATA.earthquake.hypocenter.name) {
                        this._app.services.eew.reports[DATA._id].regionName = DATA.earthquake.hypocenter.name;
                    } else {
                        this._app.services.eew.reports[DATA._id].regionName = '震源 不明';
                    }

                    this._app.services.eew.reports[DATA._id].magnitude = DATA.earthquake.hypocenter.magnitude;

                    if (this._app.services.eew.reports[DATA._id].magnitude === -1) {
                        this._app.services.eew.reports[DATA._id].magnitudeText = 'M不明';
                    } else {
                        this._app.services.eew.reports[DATA._id].magnitudeText = `M${this._app.services.eew.reports[DATA._id].magnitude}`;
                    }

                    this._app.services.eew.reports[DATA._id].depth = DATA.earthquake.hypocenter.depth;

                    switch (this._app.services.eew.reports[DATA._id].depth) {
                        case -1:
                            this._app.services.eew.reports[DATA._id].depthText = "不明";
                            break;

                        case 0:
                            this._app.services.eew.reports[DATA._id].depthText = "ごく浅い";
                            break;

                        default:
                            this._app.services.eew.reports[DATA._id].depthText = `約${this._app.services.eew.reports[DATA._id].depth}km`;
                            break;
                    }

                    DATA.areas.forEach((area) => {
                        this._app.services.eew.warnAreas.push(
                            new this._app.services.eew.WarnArea(
                                this._app.services.eew,
                                {
                                    name: area.name,
                                    pref: area.pref,
                                    arrivalTime: area.arrivalTime,
                                    scaleFrom: area.scaleFrom,
                                    scaleTo: area.scaleTo
                                }
                            )
                        );
                    });

                    let warnAreasText = "";

                    this._app.services.eew.warnAreas.forEach(area => {
                        if (warnAreasText.indexOf(area.pref) !== -1) { return }
                        warnAreasText += `${area.pref}　`;
                    });

                    this._app.services.eew.warnAreasText = warnAreasText;

                    this._app.services.eew.warning();
                    this.push(556);
                } catch (error) {
                    console.error(error);
                }
            })
            .catch((error) => {
                console.error(error);
                if (error != 'TypeError: Failed to fetch') {
                    this._app.services.notify.show(
                        "error",
                        "エラー",
                        `
                            P2P地震情報 (p2pquake.net) に接続できません。<br>
                            <code>${error}</code>
                        `
                    );
                }
            });

        fetch(this.urlRestEqinfo)
            .then((response) => response.json())
            .then((data) => {
                data.forEach((list) => {
                    if (
                        (list["code"] !== 551) ||
                        (list['issue']['type'] !== "DetailScale")
                    ) {
                        return
                    }

                    if (list["issue"]["type"] in this.typesJp) {
                        list["issue"]["typeJp"] = this.typesJp[list["issue"]["type"]];
                    } else {
                        list["issue"]["typeJp"] = "";
                    }

                    this._app.services.eqinfo.originTime = new Date(list["earthquake"]["time"]);

                    if (!(this._app.services.eqinfo.originTime instanceof Date)) {
                        this._app.services.eqinfo.originTimeText = "----/--/-- --:--";
                    } else {
                        this._app.services.eqinfo.originTimeText =
                            `${this._app.services.eqinfo.originTime.getFullYear()}/` +
                            `${this.zeroPadding(this._app.services.eqinfo.originTime.getMonth() + 1)}/` +
                            `${this.zeroPadding(this._app.services.eqinfo.originTime.getDate())} ` +
                            `${this.zeroPadding(this._app.services.eqinfo.originTime.getHours())}:` +
                            `${this.zeroPadding(this._app.services.eqinfo.originTime.getMinutes())}`
                    }

                    this._app.services.eqinfo.maxScale = list['earthquake']['maxScale'];

                    if (this._app.services.eqinfo.maxScale in this.maxScaleText) {
                        this._app.services.eqinfo.maxScaleText = this.maxScaleText[String(this._app.services.eqinfo.maxScale)];
                    } else {
                        this._app.services.eqinfo.maxScaleText = "?";
                    }

                    this._app.services.eqinfo.regionName = list['earthquake']['hypocenter']['name'];

                    if (this._app.services.eqinfo.regionName == '') {
                        this._app.services.eqinfo.regionName = '震源 調査中';
                    }

                    this._app.services.eqinfo.magnitude = list['earthquake']['hypocenter']['magnitude'];

                    if (this._app.services.eqinfo.magnitude == -1) {
                        magnitudeText = 'M調査中または不明';
                    } else {
                        this._app.services.eqinfo.magnitudeText = `M${this._app.services.eqinfo.magnitude}`;
                    }

                    this._app.services.eqinfo.depth = list['earthquake']['hypocenter']['depth'];

                    if (this._app.services.eqinfo.depth == -1) {
                        this._app.services.eqinfo.depthText = '調査中または不明';
                    } else if (this._app.services.eqinfo.depth == 0) {
                        this._app.services.eqinfo.depthText = 'ごく浅い';
                    } else {
                        this._app.services.eqinfo.depthText = `約${this._app.services.eqinfo.depth}km`;
                    }

                    this._app.services.eqinfo.tsunami = list['earthquake']['domesticTsunami'];

                    if (this._app.services.eqinfo.tsunami in this.tsunamiLevels) {
                        this._app.services.eqinfo.tsunamiJp = this.tsunamiLevels[this._app.services.eqinfo.tsunami];
                    } else {
                        this._app.services.eqinfo.tsunamiJp = "津波の影響は不明";
                    }

                    let bgcolor;
                    let color;

                    if (this._app.services.eqinfo.maxScale in this.colors) {
                        bgcolor = this.colors[this._app.services.eqinfo.maxScale]["bgcolor"];
                        color = this.colors[this._app.services.eqinfo.maxScale]["color"];
                    } else {
                        bgcolor = "#404040ff";
                        color = "#ffffffff";
                    }

                    this._app.services.eqinfo.addToList(true, this.eqinfoNum)
                    this.eqinfoNum++;
                });
            })
            .catch((error) => {
                console.error(error);
                if (error != 'TypeError: Failed to fetch') {
                    this.notify.show(
                        "error",
                        "エラー",
                        `
                            P2P地震情報 (p2pquake.net) に接続できません。<br>
                            <code>${error}</code>
                        `
                    );
                }
            });
    }


    startSocket() {
        if (!navigator.onLine) { return }
        this.socket = new WebSocket(this.urlSocket);
        this.socket.addEventListener("open", (event) => this.socketOpened(event));
        this.socket.addEventListener("close", (event) => this.socketClosed(event));
        this.socket.addEventListener("message", (event) => this.socketGotMessage(event));
        this.socket.addEventListener("error", (event) => this.socketError(event));
    }


    socketOpened(event) {
        this._app.services.debugLogs.add(
            "NETWORK",
            `[NETWORK]`,
            "Successfully connected to api.p2pquake.net and WebSocket opened."
        );

        this.isError = false;

        this.keepAlive();

        if (this.socketRetryCount > 0) {
            this.notify.show(
                "message",
                "WebSocket再接続",
                "P2P地震情報 (p2pquake.net) に再接続しました。"
            );
        }

        this.socketRetryCount = 0;
    }


    socketClosed(event) {
        this.socket = null;

        this.debugLogs.add(
            "NETWORK",
            `[NETWORK]`,
            "Successfully disconnected from api.p2pquake.net and WebSocket closed."
        );

        if (!this.isError && this.socketRetryCount < 3) {
            this.notify.show(
                "error",
                "WebSocket切断",
                "P2P地震情報 (p2pquake.net) から切断されました。再接続を試行します。"
            );
        }

        if (navigator.onLine && this.socketRetryCount < 3) {
            this.retryTimeout = setTimeout(
                () => {
                    this.startSocket();
                    this.socketRetryCount++;
                },
                10 * 1000
            );
        }

        // clearTimeout(this.retryTimeout);
    }


    socketGotMessage(message) {
        try {
            const DATA = JSON.parse(message.data);

            this._app.services.debugLogs.add(
                "NETWORK",
                `[NETWORK]`,
                `
                    Got new message from Socket api.p2pquake.net.<br>
                    Code: ${DATA.code}
                `
            );

            this.latestId = DATA["_id"];

            if (this.latestId !== null && this.latestId === this.lastId) { return }

            // DEBUG
            DATA["code"] = 556;

            switch (DATA["code"]) {
                case 551:
                    this.whenEqinfo(DATA);
                    break;

                case 556:
                    this.whenEew(DATA);
                    break;

                default:
                    return;
            }
        } catch (error) {
            console.error(error);
        }
    }


    whenEew(data) {
        if (data["test"]) { return }

        if (this._app.services.eew.reports[data._id] === undefined) {
            this._app.services.eew.reports[data._id] = new this._app.services.eew.Report();
        }

        this._app.services.eew.currentId = data._id;

        const NOW_TIME = this._app.services.datetime.gmt.getTime();
        const ISSUE_TIME = new Date(data.issue.time).getTime();

        // EEW発表から3分以下の場合は警報処理をする
        if (((NOW_TIME - ISSUE_TIME) / 1000) >= 180) { return }

        this._app.services.eew.isEew = true;
        this._app.services.eew.reports[data._id].isWarning = true;

        this._app.services.eew.reports[data._id].originTime = new Date(data.earthquake.originTime);

        if (!(this._app.services.eew.reports[data._id].originTime instanceof Date)) {
            this._app.services.eew.reports[data._id].originTimeText = "----/--/-- --:--";
        } else {
            this._app.services.eew.reports[data._id].originTimeText =
                `${this._app.services.eew.reports[data._id].originTime.getFullYear()}/` +
                `${this.zeroPadding(this._app.services.eew.reports[data._id].originTime.getMonth() + 1)}/` +
                `${this.zeroPadding(this._app.services.eew.reports[data._id].originTime.getDate())} ` +
                `${this.zeroPadding(this._app.services.eew.reports[data._id].originTime.getHours())}:` +
                `${this.zeroPadding(this._app.services.eew.reports[data._id].originTime.getMinutes())}`
        }

        if (data.earthquake.hypocenter.name) {
            this._app.services.eew.reports[data._id].regionName = data.earthquake.hypocenter.name;
        } else {
            this._app.services.eew.reports[data._id].regionName = '震源 不明';
        }

        this._app.services.eew.reports[data._id].magnitude = data.earthquake.hypocenter.magnitude;

        if (this._app.services.eew.reports[data._id].magnitude === -1) {
            this._app.services.eew.reports[data._id].magnitudeText = 'M不明';
        } else {
            this._app.services.eew.reports[data._id].magnitudeText = `M${this._app.services.eew.reports[data._id].magnitude}`;
        }

        this._app.services.eew.reports[data._id].depth = data.earthquake.hypocenter.depth;

        switch (this._app.services.eew.reports[data._id].depth) {
            case -1:
                this._app.services.eew.reports[data._id].depthText = "不明";
                break;

            case 0:
                this._app.services.eew.reports[data._id].depthText = "ごく浅い";
                break;

            default:
                this._app.services.eew.reports[data._id].depthText = `約${this._app.services.eew.reports[data._id].depth}km`;
                break;
        }

        if (this._app.services.settings.sound.eewAny == true) {
            this._app.services.sounds.eew.play();
        }


        data.areas.forEach((area) => {
            this._app.services.eew.warnAreas.push(
                new this._app.services.eew.WarnArea(
                    this._app.services.eew,
                    {
                        name: area.name,
                        pref: area.pref,
                        arrivalTime: area.arrivalTime,
                        scaleFrom: area.scaleFrom,
                        scaleTo: area.scaleTo
                    }
                )
            );
        });

        let warnAreasText = "";

        this._app.services.eew.warnAreas.forEach(area => {
            if (warnAreasText.indexOf(area.pref) !== -1) { return }
            warnAreasText += `${area.pref}　`;
        });

        this._app.services.eew.warnAreasText = warnAreasText;

        this._app.services.eew.warning();
        this.push(556);
    }


    whenEqinfo(data) {
        if (data['issue']['type'] !== "DetailScale") { return }

        if (data["issue"]["type"] in this.typesJp) {
            data["issue"]["typeJp"] = this.typesJp[data["issue"]["type"]];
        } else {
            data["issue"]["typeJp"] = "";
        }

        let datetime = new Date(data["earthquake"]["time"]);

        if (datetime.second === null) {
            datetime = "----/--/-- --:--";
        } else {
            datetime =
                `${datetime.getFullYear()}/` +
                `${this.zeroPadding(datetime.getMonth() + 1)}/` +
                `${this.zeroPadding(datetime.getDate())} ` +
                `${this.zeroPadding(datetime.getHours())}:` +
                `${this.zeroPadding(datetime.getMinutes())}`
        }

        let maxInt = data['earthquake']['maxScale'];

        switch (maxInt) {
            case -1: maxInt = '-'; break;
            case 10: maxInt = '1'; break;
            case 20: maxInt = '2'; break;
            case 30: maxInt = '3'; break;
            case 40: maxInt = '4'; break;
            case 45: maxInt = '5-'; break;
            case 50: maxInt = '5+'; break;
            case 55: maxInt = '6-'; break;
            case 60: maxInt = '6+'; break;
            case 70: maxInt = '7'; break;

            default:
                maxInt = `?`;
                break;
        }

        let hypocenter = data['earthquake']['hypocenter']['name'];

        if (hypocenter == '') {
            hypocenter = '震源 調査中';
        }

        let magnitude = data['earthquake']['hypocenter']['magnitude'];

        if (magnitude == -1) {
            magnitude = 'M調査中または不明';
        } else {
            magnitude = `M${magnitude}`;
        }

        let depth = data['earthquake']['hypocenter']['depth'];

        if (depth == -1) {
            depth = '-';
        } else if (depth == 0) {
            depth = 'ごく浅い';
        } else {
            depth = `約${depth}km`;
        }

        let tsunami = data['earthquake']['domesticTsunami'];

        if (tsunami in this.tsunamiLevels) {
            tsunami = this.tsunamiLevels[tsunami];
        } else {
            tsunami = "津波の影響は不明";
        }

        let bgcolor;
        let color;

        if (maxInt in this.colors) {
            bgcolor = this.colors[maxInt]["bgcolor"];
            color = this.colors[maxInt]["color"];
        } else {
            bgcolor = "#404040ff";
            color = "#ffffffff";
        }

        this.lastId = this.latestId;
        let d = {
            "code": data["code"],
            "isFirst": false,
            "num": this.eqinfoNum,
            "type": this._app.d,
            "datetime": datetime,
            "regionName": hypocenter,
            "maxScale": maxInt,
            "magnitude": magnitude,
            "depth": depth,
            "tsunami": tsunami,
            "bgcolor": bgcolor,
            "color": color
        }
        this.eqinfo.addToList(d);
        this.eqinfoNum++;

        if (this.settings.sound.eqinfo == true) {
            switch (maxInt) {
                case "1":
                    this.sounds.eqinfo.play();
                    this.sounds.eqinfoVoice1.play();
                    break;

                case "2":
                    this.sounds.eqinfo.play();
                    this.sounds.eqinfoVoice2.play();
                    break;

                case "3":
                    this.sounds.eqinfo.play();
                    this.sounds.eqinfoVoice3.play();
                    break;

                case "4":
                    this.sounds.eqinfo.play();
                    this.sounds.eqinfoVoice4.play();
                    break;

                case "5-":
                    this.sounds.eqinfo.play();
                    this.sounds.eqinfoVoice5.play();
                    break;

                case "5+":
                    this.sounds.eqinfo.play();
                    this.sounds.eqinfoVoice6.play();
                    break;

                case "6-":
                    this.sounds.eqinfo.play();
                    this.sounds.eqinfoVoice7.play();
                    break;

                case "6+":
                    this.sounds.eqinfo.play();
                    this.sounds.eqinfoVoice8.play();
                    break;

                case "7":
                    this.sounds.eqinfo.play();
                    this.sounds.eqinfoVoice9.play();
                    break;

                default:
                    this.sounds.eqinfo.play();
                    break;
            }
        }

        this.push(551);
    }


    socketError(event) {
        this._app.services.debugLogs.add(
            "ERROR",
            `[NETWORK]`,
            `Failed to connect to api.p2pquake.net.<br>${event}`
        );

        this.isError = true;

        if (this.socketRetryCount < 3) {
            this._app.services.notify.show(
                "error",
                "エラー",
                "P2P地震情報 (p2pquake.net) に接続できません。10秒後に再接続を試行します。"
            );
        } else {
            this._app.services.notify.show(
                "error",
                "エラー",
                "P2P地震情報 (p2pquake.net) に接続できませんでした。"
            );
        }

        this.socket = null;
    }


    keepAlive() {
        const KEEP_ALIVE_INTERVAL_ID = setInterval(
            () => {
                if (this.socket) {
                    this.socket.send('ping');
                } else {
                    clearInterval(KEEP_ALIVE_INTERVAL_ID);
                }
            },
            // Set the interval to 20 seconds to prevent the service worker from becoming inactive.
            20 * 1000
        );
    }
}
