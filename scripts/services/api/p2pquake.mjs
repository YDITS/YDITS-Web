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
    id = {
        id: null,
        eventId: null,
        serial: null,
    }
    eqinfoNum = 0;
    data = [];
    socket = null;
    socketRetryCount = 0;
    isError = false;
    latestId = null;
    lastId = null;
    a = null;

    urlRestEew = new URL("https://api.p2pquake.net/v2/history?codes=556&limit=1");
    urlRestEqinfo = new URL("https://api.p2pquake.net/v2/history?codes=551&limit=100");
    // urlSocket = new URL("wss://api.p2pquake.net/v2/ws");

    // DEBUG
    // urlRestEew = new URL("https://api.p2pquake.net/v2/history?codes=556&limit=1&offset=16");
    urlSocket = new URL("wss://api-realtime-sandbox.p2pquake.net/v2/ws");

    typesToJp = {
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
        "?": {
            "bgcolor": "#8080c0",
            "color": "#ffffff"
        },
        "0": {
            "bgcolor": "#8080c0",
            "color": "#ffffff"
        },
        "1": {
            "bgcolor": "#808080",
            "color": "#ffffff"
        },
        "2": {
            "bgcolor": "#4040c0",
            "color": "#ffffff"
        },
        "3": {
            "bgcolor": "#40c040",
            "color": "#ffffff"
        },
        "4": {
            "bgcolor": "#c0c040",
            "color": "#ffffff"
        },
        "5-": {
            "bgcolor": "#c0a040",
            "color": "#ffffff"
        },
        "5+": {
            "bgcolor": "#c08040",
            "color": "#ffffff"
        },
        "6-": {
            "bgcolor": "#c04040",
            "color": "#ffffff"
        },
        "6+": {
            "bgcolor": "#a04040",
            "color": "#ffffff"
        },
        "7": {
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

        this.debugLogs = this._app.services.debugLogs;
        this.notify = this._app.services.notify;
        this.datetime = this._app.services.datetime;
        this.settings = this._app.services.settings;
        this.sounds = this._app.services.sounds;
        this.eew = this._app.services.eew;
        this.eqinfo = this._app.services.eqinfo;
        document.addEventListener("build", () => initialize());
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


    push(data) {
        try {
            switch (data["code"]) {
                // eqinfo
                case 551:
                    Push.create(
                        data["type"],
                        {
                            body: `${data["hypocenter"]}を震源とする、最大震度${data["maxInt"]}の地震がありました。\n規模は${data["magnitude"]}、深さは${data["depth"]}と推定されます。\n${data["tsunami"]}`,
                            onClick: function() {
                                window.focus();
                                this.close();
                            }
                        }
                    );

                    this.notify.show(
                        "message",
                        data["type"],
                        `
                            ${data["hypocenter"]}を震源とする、最大震度${data["maxInt"]}の地震がありました。<br>
                            規模は${data["magnitude"]}、深さは${data["depth"]}と推定されます。<br>
                            ${data["tsunami"]}
                        `
                    );
                    break;

                // EEW
                case 556:
                    try {
                        Push.create(
                            `緊急地震速報 (警報)`,
                            {
                                body: `《次の地域では強い揺れに備えてください。》\n${data["areasText"]}`,
                                onClick: function () {
                                    window.focus();
                                    this.close();
                                }
                            }
                        );
                    } catch (error) {
                        console.error(error);
                    }

                    this.notify.show(
                        "eew",
                        `緊急地震速報 (警報)`,
                        `
                            《次の地域では強い揺れに備えてください。》<br>
                            ${data["areasText"]}
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
                const DATA = data[0];
                let report = this.eew.reports[DATA._id];

                if (report === undefined) {
                    report = new this.eew.Report();
                }

                const NOW_TIME = this.datetime.gmt.getTime();
                const ISSUE_TIME = new Date(DATA.issue.time).getTime();

                // EEW発表から3分以下の場合は警報処理をする
                if (((NOW_TIME - ISSUE_TIME) / 1000) >= 180) { return }

                this.eew.isEew = true;
                report.isWarning = true;

                report.originTime = new Date(DATA.earthquake.originTime);

                if (report.originTime === null) {
                    report.originTimeText = "----/--/-- --:--";
                } else {
                    report.originTimeText =
                        `${report.originTime.getFullYear()}/` +
                        `${this.zeroPadding(report.originTime.getMonth() + 1)}/` +
                        `${this.zeroPadding(report.originTime.getDate())} ` +
                        `${this.zeroPadding(report.originTime.getHours())}:` +
                        `${this.zeroPadding(report.originTime.getMinutes())}`
                }

                if (DATA.earthquake.hypocenter.name) {
                    report.regionName = DATA.earthquake.hypocenter.name;
                } else {
                    report.regionName = '震源 不明';
                }

                report.magnitude = DATA.earthquake.hypocenter.magnitude;

                if (report.magnitude === -1) {
                    report.magnitudeText = 'M不明';
                } else {
                    magnitudeText = `M${magnitude}`;
                }

                report.depth = DATA.earthquake.hypocenter.depth;

                switch (report.depth) {
                    case -1:
                        report.depthText = "不明";
                        break;
                    
                    case 0:
                        report.depthText = "ごく浅い";
                        break;
                    
                    default:
                        report.depthText = `約${report.depth}km`;
                        break;
                }

                let areasList = [];
                let areasText = "";

                DATA.areas.forEach(area => {
                    this.eew.warnAreas.push(new this.eew.WarnAreas(
                        area.name,
                        area.pref,
                        area.arrivalTime,
                        area.scaleFrom,
                        area.scaleTo
                    ));
                });

                this.eew.warnAreas.forEach(area => {
                    this.eew.warnAreasText += `${area.pref}　`;
                });

                this.eew.warning(d);
                this.push(d);
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

        fetch(this.urlRestEqinfo)
            .then((response) => response.json())
            .then((data) => {
                data.forEach((list) => {
                    if (
                        (list["code"] === 551) &&
                        (list['issue']['type'] === "DetailScale")
                    ) {
                        if (list["issue"]["type"] in this.typesToJp) {
                            list["issue"]["typeJp"] = this.typesToJp[list["issue"]["type"]];
                        } else {
                            list["issue"]["typeJp"] = "";
                        }

                        let datetime = new Date(list["earthquake"]["time"]);

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

                        let maxInt = list['earthquake']['maxScale'];

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

                        let hypocenter = list['earthquake']['hypocenter']['name'];

                        if (hypocenter == '') {
                            hypocenter = '震源 調査中';
                        }

                        let magnitude = list['earthquake']['hypocenter']['magnitude'];

                        if (magnitude == -1) {
                            magnitude = 'M調査中または不明';
                        } else {
                            magnitude = `M${magnitude}`;
                        }

                        let depth = list['earthquake']['hypocenter']['depth'];

                        if (depth == -1) {
                            depth = '-';
                        } else if (depth == 0) {
                            depth = 'ごく浅い';
                        } else {
                            depth = `約${depth}km`;
                        }

                        let tsunami = list['earthquake']['domesticTsunami'];

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

                        this.data.push(list);
                        let d = {
                            "code": data["code"],
                            "isFirst": true,
                            "num": this.eqinfoNum,
                            "type": list["issue"]["typeJp"],
                            "maxInt": maxInt,
                            "hypocenter": hypocenter,
                            "datetime": datetime,
                            "magnitude": magnitude,
                            "depth": depth,
                            "tsunami": tsunami,
                            "bgcolor": bgcolor,
                            "color": color
                        }
                        this.eqinfo.addToList(d)
                        this.eqinfoNum++;
                    }
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
        this.debugLogs.add(
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

            this.debugLogs.add(
                "NETWORK",
                `[NETWORK]`,
                `
                    Got new message from Socket api.p2pquake.net.<br>
                    Code: ${DATA.code}
                `
            );

            this.latestId = data["_id"];

            if (this.latestId !== null && this.latestId === this.lastId) { return }

            // DEBUG
            data["code"] = 556;

            switch (data["code"]) {
                case 551:
                    this.whenEqinfo(data);
                    break;

                case 556:
                    this.whenEew(data);
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

        // DEBUG
        data = {
            "areas": [
                {
                    "arrivalTime": null,
                    "kindCode": "11",
                    "name": "石川県能登",
                    "pref": "石川",
                    "scaleFrom": 60,
                    "scaleTo": 70
                },
                {
                    "arrivalTime": "2024/01/01 16:10:50",
                    "kindCode": "19",
                    "name": "富山県西部",
                    "pref": "富山",
                    "scaleFrom": 55,
                    "scaleTo": 55
                },
                {
                    "arrivalTime": "2024/01/01 16:10:50",
                    "kindCode": "19",
                    "name": "石川県加賀",
                    "pref": "石川",
                    "scaleFrom": 55,
                    "scaleTo": 55
                },
                {
                    "arrivalTime": null,
                    "kindCode": "11",
                    "name": "新潟県上越",
                    "pref": "新潟",
                    "scaleFrom": 45,
                    "scaleTo": 50
                },
                {
                    "arrivalTime": null,
                    "kindCode": "11",
                    "name": "新潟県佐渡",
                    "pref": "新潟",
                    "scaleFrom": 45,
                    "scaleTo": 50
                },
                {
                    "arrivalTime": null,
                    "kindCode": "11",
                    "name": "新潟県中越",
                    "pref": "新潟",
                    "scaleFrom": 45,
                    "scaleTo": 50
                },
                {
                    "arrivalTime": "2024/01/01 16:10:54",
                    "kindCode": "19",
                    "name": "富山県東部",
                    "pref": "富山",
                    "scaleFrom": 50,
                    "scaleTo": 50
                },
                {
                    "arrivalTime": null,
                    "kindCode": "11",
                    "name": "長野県北部",
                    "pref": "長野",
                    "scaleFrom": 45,
                    "scaleTo": 45
                },
                {
                    "arrivalTime": "2024/01/01 16:11:07",
                    "kindCode": "19",
                    "name": "福井県嶺北",
                    "pref": "福井",
                    "scaleFrom": 45,
                    "scaleTo": 45
                },
                {
                    "arrivalTime": null,
                    "kindCode": "11",
                    "name": "岐阜県飛騨",
                    "pref": "岐阜",
                    "scaleFrom": 40,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": null,
                    "kindCode": "11",
                    "name": "新潟県下越",
                    "pref": "新潟",
                    "scaleFrom": 40,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": null,
                    "kindCode": "11",
                    "name": "長野県南部",
                    "pref": "長野",
                    "scaleFrom": 40,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": null,
                    "kindCode": "11",
                    "name": "岐阜県美濃中西部",
                    "pref": "岐阜",
                    "scaleFrom": 40,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": null,
                    "kindCode": "11",
                    "name": "長野県中部",
                    "pref": "長野",
                    "scaleFrom": 40,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": null,
                    "kindCode": "11",
                    "name": "福島県会津",
                    "pref": "福島",
                    "scaleFrom": 40,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": null,
                    "kindCode": "11",
                    "name": "群馬県北部",
                    "pref": "群馬",
                    "scaleFrom": 40,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": null,
                    "kindCode": "11",
                    "name": "群馬県南部",
                    "pref": "群馬",
                    "scaleFrom": 40,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": null,
                    "kindCode": "11",
                    "name": "岐阜県美濃東部",
                    "pref": "岐阜",
                    "scaleFrom": 40,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": "2024/01/01 16:11:11",
                    "kindCode": "10",
                    "name": "福井県嶺南",
                    "pref": "福井",
                    "scaleFrom": 40,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": "2024/01/01 16:11:18",
                    "kindCode": "10",
                    "name": "栃木県南部",
                    "pref": "栃木",
                    "scaleFrom": 40,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": "2024/01/01 16:11:19",
                    "kindCode": "10",
                    "name": "埼玉県北部",
                    "pref": "埼玉",
                    "scaleFrom": 40,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": "2024/01/01 16:11:21",
                    "kindCode": "10",
                    "name": "山形県村山",
                    "pref": "山形",
                    "scaleFrom": 40,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": "2024/01/01 16:11:22",
                    "kindCode": "10",
                    "name": "茨城県南部",
                    "pref": "茨城",
                    "scaleFrom": 40,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": "2024/01/01 16:11:22",
                    "kindCode": "10",
                    "name": "埼玉県南部",
                    "pref": "埼玉",
                    "scaleFrom": 40,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": "2024/01/01 16:11:24",
                    "kindCode": "10",
                    "name": "福島県中通り",
                    "pref": "福島",
                    "scaleFrom": 40,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": "2024/01/01 16:11:25",
                    "kindCode": "10",
                    "name": "茨城県北部",
                    "pref": "茨城",
                    "scaleFrom": 40,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": "2024/01/01 16:11:25",
                    "kindCode": "10",
                    "name": "千葉県北西部",
                    "pref": "千葉",
                    "scaleFrom": 40,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": "2024/01/01 16:11:28",
                    "kindCode": "10",
                    "name": "兵庫県北部",
                    "pref": "兵庫",
                    "scaleFrom": 40,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": "2024/01/01 16:11:08",
                    "kindCode": "10",
                    "name": "栃木県北部",
                    "pref": "栃木",
                    "scaleFrom": 30,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": "2024/01/01 16:11:11",
                    "kindCode": "10",
                    "name": "埼玉県秩父",
                    "pref": "埼玉",
                    "scaleFrom": 30,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": "2024/01/01 16:11:14",
                    "kindCode": "10",
                    "name": "山梨県中・西部",
                    "pref": "山梨",
                    "scaleFrom": 30,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": "2024/01/01 16:11:15",
                    "kindCode": "10",
                    "name": "山形県置賜",
                    "pref": "山形",
                    "scaleFrom": 30,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": "2024/01/01 16:11:15",
                    "kindCode": "10",
                    "name": "滋賀県北部",
                    "pref": "滋賀",
                    "scaleFrom": 30,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": "2024/01/01 16:11:17",
                    "kindCode": "10",
                    "name": "愛知県西部",
                    "pref": "愛知",
                    "scaleFrom": 30,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": "2024/01/01 16:11:20",
                    "kindCode": "10",
                    "name": "山形県庄内",
                    "pref": "山形",
                    "scaleFrom": 30,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": "2024/01/01 16:11:21",
                    "kindCode": "10",
                    "name": "三重県北部",
                    "pref": "三重",
                    "scaleFrom": 30,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": "2024/01/01 16:11:23",
                    "kindCode": "10",
                    "name": "静岡県東部",
                    "pref": "静岡",
                    "scaleFrom": 30,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": "2024/01/01 16:11:27",
                    "kindCode": "10",
                    "name": "宮城県南部",
                    "pref": "宮城",
                    "scaleFrom": 30,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": "2024/01/01 16:11:39",
                    "kindCode": "10",
                    "name": "奈良県",
                    "pref": "奈良",
                    "scaleFrom": 30,
                    "scaleTo": 40
                },
                {
                    "arrivalTime": "2024/01/01 16:11:41",
                    "kindCode": "10",
                    "name": "宮城県中部",
                    "pref": "宮城",
                    "scaleFrom": 30,
                    "scaleTo": 40
                }
            ],
            "cancelled": false,
            "code": 556,
            "earthquake": {
                "arrivalTime": "2024/01/01 16:10:10",
                "condition": "",
                "hypocenter": {
                    "depth": 10,
                    "latitude": 37.6,
                    "longitude": 137.2,
                    "magnitude": 7.4,
                    "name": "能登半島沖",
                    "reduceName": "能登半島沖"
                },
                "originTime": "2024/01/01 16:10:08"
            },
            "id": "6592658bd616be440743c890",
            "issue": {
                "eventId": "20240101161010",
                "serial": "3",
                "time": "2024/01/01 16:11:07"
            },
            "time": "2024/01/01 16:11:07.163",
            "timestamp": {
                "convert": "2024/01/01 16:11:07.158",
                "register": "2024/01/01 16:11:07.163"
            },
            "user_agent": "jmaxml-seis-parser-go, relay, register-api",
            "ver": "20231023"
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

        let areas = [];
        let areasText = "";

        data["areas"].forEach(area => {
            if (areas.includes(area["pref"])) { return }
            areas.push(area["pref"]);
        });

        areas.forEach(area => {
            areasText += `${area}　`;
        });

        let d = {
            "code": data["code"],
            "num": this.eqinfoNum,
            // "maxInt": maxInt,
            "hypocenter": hypocenter,
            "datetime": datetime,
            "magnitude": magnitude,
            "depth": depth,
            "areas": areas,
            "areasText": areasText
        }

        if (this.settings.sound.eewAny == true) {
            this.sounds.eew.play();
        }

        this.eew.warning(d);
        this.push(d);
    }


    whenEqinfo(data) {
        if (data['issue']['type'] !== "DetailScale") { return }

        if (data["issue"]["type"] in this.typesToJp) {
            data["issue"]["typeJp"] = this.typesToJp[data["issue"]["type"]];
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

        this.data.push(data);
        this.lastId = this.latestId;
        let d = {
            "code": data["code"],
            "isFirst": false,
            "num": this.eqinfoNum,
            "type": data["issue"]["typeJp"],
            "maxInt": maxInt,
            "hypocenter": hypocenter,
            "datetime": datetime,
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

        this.push(d);
    }


    socketError(event) {
        this.debugLogs.add(
            "ERROR",
            `[NETWORK]`,
            `Failed to connect to api.p2pquake.net.<br>${event}`
        );

        this.isError = true;

        if (this.socketRetryCount < 3) {
            this.notify.show(
                "error",
                "エラー",
                "P2P地震情報 (p2pquake.net) に接続できません。10秒後に再接続を試行します。"
            );
        } else {
            this.notify.show(
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
