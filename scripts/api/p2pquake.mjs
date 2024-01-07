/*
 *
 * eqinfo.mjs | YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

export class P2pquake {
    eqinfoNum = 0;
    urlRestEew = new URL("https://api.p2pquake.net/v2/history?codes=556&limit=1");
    // urlRestEew = new URL("https://api.p2pquake.net/v2/history?codes=556&limit=1&offset=16");
    urlRestEqinfo = new URL("https://api.p2pquake.net/v2/history?codes=551&limit=100");
    urlSocket = new URL("wss://api.p2pquake.net/v2/ws");
    // urlSocket = new URL("wss://api-realtime-sandbox.p2pquake.net/v2/ws");
    data = [];
    socket = null;
    socketRetryCount = 0;
    isError = false;
    latestId = null;
    lastId = null;


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


    constructor(debugLogs, notify, datetime, settings, sounds, eew, eqinfo) {
        this.debugLogs = debugLogs;
        this.notify = notify;
        this.datetime = datetime;
        this.settings = settings;
        this.sounds = sounds;
        this.eew = eew;
        this.eqinfo = eqinfo;

        this.initialize()
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
        switch (data["code"]) {
            case 551:
                Push.create(
                    data["type"],
                    {
                        body: `${data["hypocenter"]}を震源とする、最大震度${data["maxInt"]}の地震がありました。\n規模は${data["magnitude"]}、深さは${data["depth"]}と推定されます。\n${data["tsunami"]}\nページ表示するにはここを選択してください。`,
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
                        ${data["hypocenter"]}を震源とする、最大震度${data["maxInt"]}の地震がありました。<br>
                        規模は${data["magnitude"]}、深さは${data["depth"]}と推定されます。<br>
                        ${data["tsunami"]}
                    `
                );
                break;

            case 556:
                try {
                    Push.create(
                        `緊急地震速報 (警報)`,
                        {
                            body: `《次の地域では強い揺れに備えてください。》\n${data["areas"]}`,
                            onClick: function () {
                                window.focus();
                                this.close();
                            }
                        }
                    );
                } catch (error) { console.error(error); }

                this.notify.show(
                    "eew",
                    `緊急地震速報 (警報)`,
                    `
                        《次の地域では強い揺れに備えてください。》<br>
                        ${data["areas"]}
                    `
                );
                break;

            default:
                return;
        }
    }


    initialize() {
        fetch(this.urlRestEew)
            .then((response) => response.json())
            .then((data) => {
                data = data[0];

                let dateNow = this.datetime.gmt.getTime();
                let issueTime = new Date(data.issue.time).getTime();

                // EEW発表から3分以下の場合は警報処理をする
                if ((dateNow - issueTime / (1000)) >= 180) { return }

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
                    hypocenter = '不明または調査中';
                }

                let magnitude = data['earthquake']['hypocenter']['magnitude'];

                if (magnitude == -1) {
                    magnitude = 'M -';
                } else {
                    magnitude = `M ${magnitude}`;
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
                    "areas": areasText
                }

                if (this.settings.sound.eewAny == true) {
                    this.sounds.eew.play();
                }

                this.eew.displayWarn(d);
                this.push(d);
            })
            .catch((error) => {
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
            let data = JSON.parse(message.data);

            this.debugLogs.add(
                "NETWORK",
                `[NETWORK]`,
                `
                    Got new message from Socket api.p2pquake.net.<br>
                    Code: ${data["code"]}
                `
            );

            this.latestId = data["_id"];

            if (this.latestId !== null && this.latestId === this.lastId) { return }

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
            hypocenter = '不明または調査中';
        }

        let magnitude = data['earthquake']['hypocenter']['magnitude'];

        if (magnitude == -1) {
            magnitude = 'M -';
        } else {
            magnitude = `M ${magnitude}`;
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
            "areas": areasText
        }

        if (this.settings.sound.eewAny == true) {
            this.sounds.eew.play();
        }

        this.eew.displayWarn(d);
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
            hypocenter = '不明または調査中';
        }

        let magnitude = data['earthquake']['hypocenter']['magnitude'];

        if (magnitude == -1) {
            magnitude = 'M -';
        } else {
            magnitude = `M ${magnitude}`;
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
