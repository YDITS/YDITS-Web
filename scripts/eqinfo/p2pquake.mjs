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
    constructor(debugLogs, notify, settings, sounds, addToList) {
        this.debugLogs = debugLogs;
        this.notify = notify;
        this.settings = settings;
        this.sounds = sounds;
        this.addToList = addToList;
        this.eqinfoNum = 0;
        this.urlRest = new URL("https://api.p2pquake.net/v2/history?codes=551&limit=100");
        this.urlSocketStart = new URL("wss://api.p2pquake.net/v2/ws");
        // this.urlSocketStart = new URL("wss://api-realtime-sandbox.p2pquake.net/v2/ws");
        this.data = [];
        this.socket = null;
        this.socketRetryCount = 0;
        this.latestId = null;
        this.lastId = null;

        this.initial()
        this.startSocket();
    }


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


    List = class {
        constructor() {
            this.id = null;
            this.type = null;
        }
    }


    zeroPadding(value) {
        value = "0" + value;
        value = value.slice(-2);
        return value;
    }


    push(data) {
        Push.create(
            data["type"],
            {
                body: `${data["hypocenter"]}を震源とする、最大震度${data["maxInt"]}の地震がありました。\n規模は${data["magnitude"]}、深さは${data["depth"]}と推定されます。\n${data["tsunami"]}\nページ表示するにはここを選択してください。\n`,
                onClick: function () {
                    window.focus();
                    this.close();
                }
            })
    }


    initial() {
        fetch(this.urlRest)
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
                            datetime = "----/--/-- --:--:--";
                        } else {
                            datetime =
                                `${datetime.getFullYear()}/` +
                                `${this.zeroPadding(datetime.getMonth() + 1)}/` +
                                `${this.zeroPadding(datetime.getDate())} ` +
                                `${this.zeroPadding(datetime.getHours())}:` +
                                `${this.zeroPadding(datetime.getMinutes())}:` +
                                `${this.zeroPadding(datetime.getSeconds())}`;
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
                            hypocenter = '不明または調査中';
                        }

                        let magnitude = list['earthquake']['hypocenter']['magnitude'];

                        if (magnitude == -1) {
                            magnitude = 'M -';
                        } else {
                            magnitude = `M ${magnitude}`;
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
                        this.addToList(d)
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
            })
    }


    startSocket() {
        this.socket = new WebSocket(this.urlSocketStart);
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
        this.debugLogs.add(
            "NETWORK",
            `[NETWORK]`,
            "Successfully disconnected from api.p2pquake.net and WebSocket closed."
        );

        clearTimeout(this.retryTimeout);
    }


    socketGotMessage(message) {
        try {
            this.debugLogs.add(
                "NETWORK",
                `[NETWORK]`,
                "Got new message from Socket api.p2pquake.net."
            );

            let data = JSON.parse(message.data);
            this.latestId = data["_id"];

            console.log(data);

            if (
                (data["code"] !== 551) ||
                (data['issue']['type'] !== "DetailScale") ||

                // IDに変化がない場合は処理を行わない
                (this.latestId !== null && this.latestId === this.lastId)
            ) {
                return
            }

            if (data["issue"]["type"] in this.typesToJp) {
                data["issue"]["typeJp"] = this.typesToJp[data["issue"]["type"]];
            } else {
                data["issue"]["typeJp"] = "";
            }

            let datetime = new Date(data["earthquake"]["time"]);

            if (datetime.second === null) {
                datetime = "----/--/-- --:--:--";
            } else {
                datetime =
                    `${datetime.getFullYear()}/` +
                    `${this.zeroPadding(datetime.getMonth() + 1)}/` +
                    `${this.zeroPadding(datetime.getDate())} ` +
                    `${this.zeroPadding(datetime.getHours())}:` +
                    `${this.zeroPadding(datetime.getMinutes())}:` +
                    `${this.zeroPadding(datetime.getSeconds())}`;
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
            this.addToList(d);
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
        } catch (error) {
            console.error(error);
        }
    }


    socketError(event) {
        this.debugLogs.add(
            "ERROR",
            `[NETWORK]`,
            `Failed to connect to dmdata.jp.: ${event}`
        );

        if (this.socketRetryCount < 3) {
            this.notify.show(
                "error",
                "エラー",
                "P2P地震情報 (p2pquake.net) に接続できません。15秒後に再試行します。"
            );
            this.retryTimeout = setTimeout(
                () => {
                    this.startSocket();
                    this.socketRetryCount++;
                },
                15000
            );
        } else {
            this.notify.show(
                "error",
                "エラー",
                "P2P地震情報 (p2pquake.net) に接続できませんでした。"
            );
        }
    }
}
