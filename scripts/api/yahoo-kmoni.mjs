/*
 *
 * yahoo-kmoni.mjs | YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

export class YahooKmoni {
    reportNumLast = null;
    fetchLastStatus = null;
    maxIntLast = null;


    constructor(debugLogs, notify, datetime, settings, sounds, eew, dmdata) {
        this.debugLogs = debugLogs;
        this.notify = notify;
        this.datetime = datetime;
        this.settings = settings;
        this.sounds = sounds;
        this.eew = eew;
        this.dmdata = dmdata;
    }


    get() {
        if (!navigator.onLine) { return }

        const KMONI_DATETIME = this.makeKmoniDatetime();
        if (KMONI_DATETIME === null) { return }

        const URL = `https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/${KMONI_DATETIME}.json`;

        // --- debug
        // const URL = `https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/20210213/20210213230859.json`;  //2021-2-13-23:08 Fukushima
        // const URL = "https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/20220529/20220529155631.json";  //2022-5-29-15:55 Ibaraki
        // const URL = `https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/19700101/19700101000000.json`;  //1970-1-1-00:00 HTTP 403
        // const URL = `https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/20200212/202002121937${this.zeroPadding(this.datetime.second)}.json`;  //2020-2-12-19:36 double eew
        // const URL = `https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/20240101/202401011610${this.zeroPadding(this.datetime.second)}.json`;  //2024-1-1-16:10 Ishikawa
        // const URL = "https://www.lmoni.bosai.go.jp/monitor/webservice/hypo/eew/20220330001911.json";                 //2022-3-30-00:19 kmoni
        // ---

        fetch(URL)
            .then((response) => {
                if (!response.ok) {
                    this.fetchError(`Status Code: HTTP ${response.status}`);
                    return null
                }

                return response.json()
            })
            .then(data => {
                if (data === null) { return }

                if (this.settings.connect.eew === 'yahoo-kmoni' || this.dmdata.accessToken === null) {
                    if (data["hypoInfo"] != null) {
                        const REPORT_NUM = data["hypoInfo"]["items"][0]["reportNum"];

                        this.eew.data = {
                            "id": data["hypoInfo"]["items"][0]["reportId"],
                            "hypoInfo": data["hypoInfo"]["items"][0],
                            "psWave": data["psWave"]["items"][0]
                        };

                        if (REPORT_NUM !== this.reportNumLast) {
                            this.reportNumLast = REPORT_NUM;

                            const IS_FINAL = data["hypoInfo"]["items"][0]["isFinal"];
                            let reportNumText;

                            if (IS_FINAL == 'true') {
                                reportNumText = '最終報';
                            } else {
                                reportNumText = `第${REPORT_NUM}報`;
                            }

                            let originTime = new Date(data["hypoInfo"]["items"][0]["originTime"]);

                            if (originTime.second === null) {
                                originTime = "----/--/-- --:--:--";
                            } else {
                                originTime =
                                    `${originTime.getFullYear()}/` +
                                    `${this.zeroPadding(originTime.getMonth() + 1)}/` +
                                    `${this.zeroPadding(originTime.getDate())} ` +
                                    `${this.zeroPadding(originTime.getHours())}:` +
                                    `${this.zeroPadding(originTime.getMinutes())}:` +
                                    `${this.zeroPadding(originTime.getSeconds())}`;
                            }

                            let regionName = data["hypoInfo"]["items"][0]["regionName"];

                            if (!regionName) {
                                regionName = '不明';
                            }

                            let maxInt = data["hypoInfo"]["items"][0]["calcintensity"];

                            switch (maxInt) {
                                case '01': maxInt = "1"; break;
                                case '02': maxInt = "2"; break;
                                case '03': maxInt = "3"; break;
                                case '04': maxInt = "4"; break;
                                case '5-': maxInt = "5-"; break;
                                case '5+': maxInt = "5+"; break;
                                case '6-': maxInt = "6-"; break;
                                case '6+': maxInt = "6+"; break;
                                case '07': maxInt = "7"; break;

                                default:
                                    maxInt = `?`;
                                    break;
                            }

                            let magnitude = data["hypoInfo"]["items"][0]["magnitude"];

                            if (magnitude) {
                                magnitude = `M${magnitude}`;
                            } else {
                                magnitude = 'M不明';
                            }

                            let depth = data["hypoInfo"]["items"][0]["depth"];

                            if (depth) {
                                depth = `約${depth}`;
                            } else {
                                depth = '深さ不明';
                            }

                            /*
                            // Yahoo 強震モニタのJSONデータに 予報・警報 のフラッグがないため 未実装

                            let type = data['alertflg'];

                            switch (type) {
                                case 'true':
                                    type = "警報"
                                    break;
    
                                case 'false':
                                    type = "予報"
                                    break;
    
                                case null:
                                    type = "{Null}"
                                    break;
    
                                default:
                                    type = "{Unknown}"
                                    break;
                            }
                            */

                            let type = '';

                            let isCancel = data["hypoInfo"]["items"][0]['isCancel'];

                            if (isCancel == 'true') {
                                isCancel = true;
                                type = '取消報';
                            } else {
                                isCancel = false;
                            }

                            if (isCancel == 'true') {
                                if (this.settings.sound.eewCancel == true) {
                                    this.sounds.eewVoiceCancel.play();
                                }
                            } else {
                                if (this.settings.sound.eewAny == true && this.maxIntLast != maxInt) {
                                    switch (maxInt) {
                                        case '1':
                                            this.sounds.eewVoice1.play();
                                            break;

                                        case '2':
                                            this.sounds.eewVoice2.play();
                                            break;

                                        case '3':
                                            this.sounds.eewVoice3.play();
                                            break;

                                        case '4':
                                            this.sounds.eewVoice4.play();
                                            break;

                                        case '5-':
                                            this.sounds.eew.play();
                                            this.sounds.eewVoice5.play();
                                            break;

                                        case '5+':
                                            this.sounds.eew.play();
                                            this.sounds.eewVoice6.play();
                                            break;

                                        case '6-':
                                            this.sounds.eew.play();
                                            this.sounds.eewVoice7.play();
                                            break;

                                        case '6+':
                                            this.sounds.eew.play();
                                            this.sounds.eewVoice8.play();
                                            break;

                                        case '7':
                                            this.sounds.eew.play();
                                            this.sounds.eewVoice9.play();
                                            break;

                                        default:
                                            this.sounds.eew.play();
                                            break;
                                    }
                                }
                            }

                            const d = {
                                "isCancel": isCancel,
                                "type": type,
                                "reportNum": reportNumText,
                                "regionName": regionName,
                                "maxInt": maxInt
                            }

                            this.push(d);

                            // ----- put ----- //
                            let eew_bgc;
                            let eew_fntc;

                            switch (maxInt) {
                                case '1':
                                    eew_bgc = "#808080";
                                    eew_fntc = "#ffffff";
                                    break;
                                case '2':
                                    eew_bgc = "#4040c0";
                                    eew_fntc = "#ffffff";
                                    break;
                                case '3':
                                    eew_bgc = "#40c040";
                                    eew_fntc = "#ffffff";
                                    break;
                                case '4':
                                    eew_bgc = "#c0c040";
                                    eew_fntc = "#ffffff";
                                    break;
                                case '5-':
                                    eew_bgc = "#c0a040";
                                    eew_fntc = "#ffffff";
                                    break;
                                case '5+':
                                    eew_bgc = "#c08040";
                                    eew_fntc = "#ffffff";
                                    break;
                                case '6-':
                                    eew_bgc = "#c04040";
                                    eew_fntc = "#ffffff";
                                    break;
                                case '6+':
                                    eew_bgc = "#a04040";
                                    eew_fntc = "#ffffff";
                                    break;
                                case '7':
                                    eew_bgc = "#804080";
                                    eew_fntc = "#ffffff";
                                    break;

                                default:
                                    eew_bgc = "#8080c0";
                                    eew_fntc = "#ffffff";
                                    break;
                            }

                            if (isCancel) {
                                eew_bgc = "#7f7fc0";
                                eew_fntc = "#010101";
                            }

                            $('#eewTitle').text(`緊急地震速報 ${type}(${reportNumText})`);
                            $('#eewCalc').text(maxInt);
                            $('#eewRegion').text(regionName);
                            $('#eewOrigin_time').text(`発生日時: ${originTime}`);
                            $('#eewMagnitude').text(`規模 ${magnitude}`);
                            $('#eewDepth').text(`深さ ${depth}`);

                            $('#eewField').css({
                                'background-color': eew_bgc,
                                'color': eew_fntc
                            })
                            $(`#eewCalc`).css({
                                'background-color': 'initial',
                                'color': 'initial'
                            });

                            this.maxIntLast = maxInt;
                        }
                    } else {
                        this.eew.data = null;

                        this.reportNumLast = null;
                        this.maxIntLast = null;

                        $('#eewTitle').text(`緊急地震速報は発表されていません`);
                        $('#eewCalc').text("");
                        $('#eewRegion').text("");
                        $('#eewOrigin_time').text("");
                        $('#eewMagnitude').text("");
                        $('#eewDepth').text("");

                        $('#eewField').css({
                            'background-color': "#404040ff",
                            'color': "#ffffffff"
                        });
                        $(`#eewCalc`).css({
                            'background-color': 'initial',
                            'color': 'initial'
                        });
                    }

                    $('#statusLamp').css({ 'background-color': '#40ff40' });

                    if (!this.fetchLastStatus) {
                        this.fetchLastStatus = true;
                    }
                }
            })
            .catch(error => {
                this.fetchError(error);
            });
    }


    fetchError(error) {
        if (
            (this.settings.connect.eew === 'yahoo-kmoni') ||
            (this.dmdata.accessToken === null)
        ) {
            $('#statusLamp').css({ 'background-color': '#ff4040' });

            if (this.fetchLastStatus) {
                this.debugLogs.add(
                    "ERROR",
                    "[NETWORK]",
                    `Failed to connect to weather-kyoshin.east.edge.storage-yahoo.jp.<br>${error}`
                );

                this.notify.show(
                    "error",
                    "エラー",
                    `
                        Yahoo! 強震モニタ (storage-yahoo.jp) に接続できません。<br>
                        強震モニタが一時的に利用できないか、ネットワークが低速な可能性があります。<br>
                        <code>${error}</code>
                    `
                );
            }

            this.fetchLastStatus = false;
        }
    }


    makeKmoniDatetime() {
        if (this.datetime.gmt === null) { return null }

        let kmoniDatetime = this.datetime.gmt;

        kmoniDatetime.setSeconds(this.datetime.second - 2);
        kmoniDatetime =
            `${kmoniDatetime.getFullYear()}` +
            `${this.zeroPadding(kmoniDatetime.getMonth() + 1)}` +
            `${this.zeroPadding(kmoniDatetime.getDate())}` +
            `/` +
            `${kmoniDatetime.getFullYear()}` +
            `${this.zeroPadding(kmoniDatetime.getMonth() + 1)}` +
            `${this.zeroPadding(kmoniDatetime.getDate())}` +
            `${this.zeroPadding(kmoniDatetime.getHours())}` +
            `${this.zeroPadding(kmoniDatetime.getMinutes())}` +
            `${this.zeroPadding(kmoniDatetime.getSeconds())}`;

        return kmoniDatetime;
    }


    push(data) {
        try {
            if (data.isCancel) {
                Push.create(
                    `緊急地震速報 ${data.type}(${data.reportNum})`,
                    {
                        body: `先程の緊急地震速報は取り消されました。\nページ表示するにはここを選択してください。`,
                        onClick: function () {
                            window.focus();
                            this.close();
                        }
                    }
                );

                this.notify.show(
                    "message",
                    `緊急地震速報 ${data.type}(${data.reportNum})`,
                    `先程の緊急地震速報は取り消されました。`
                );
            } else {
                try {
                    Push.create(
                        `緊急地震速報 ${data.type}(${data.reportNum})`,
                        {
                            body: `${data.regionName}で地震発生。予想最大震度は${data.maxInt}です。\nページ表示するにはここを選択してください。`,
                            onClick: function () {
                                window.focus();
                                this.close();
                            }
                        }
                    );
                } catch (error) { console.error(error); }

                this.notify.show(
                    "message",
                    `緊急地震速報 ${data.type}(${data.reportNum})`,
                    `${data.regionName}で地震発生。予想最大震度は${data.maxInt}です。`
                );
            }
        } catch (error) {
            console.error(error);
        }
    }


    zeroPadding(value) {
        value = "0" + value;
        value = value.slice(-2);
        return value;
    }
}