/*
 *
 * debug-logs.mjs | YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

export class DebugLogs {
    debugLogs = [];


    constructor(datetime) {
        this.datetime = datetime;

        let debugLogsRaw = localStorage.getItem("debugLogs");

        if (debugLogsRaw === null) {
            this.add("START", "[START]", "- Start log -");
        } else {
            this.debugLogs = JSON.parse(debugLogsRaw);
            this.debugLogs.forEach(log => {
                this.addDebugLogsHtml(log.time, log.type, log.title, log.text);
            });
        }
    }


    add(type, title, text) {
        let time = `${this.datetime.year}/${('0' + this.datetime.month).slice(-2)}/${('0' + this.datetime.day).slice(-2)} ${('0' + this.datetime.hour).slice(-2)}:${('0' + this.datetime.minute).slice(-2)}:${('0' + this.datetime.second).slice(-2)}`;

        this.debugLogs.push({
            "time": time,
            "type": type,
            "title": title,
            "text": text
        });

        localStorage.setItem("debugLogs", JSON.stringify(this.debugLogs));

        this.addDebugLogsHtml(time, type, title, text);
    }


    addDebugLogsHtml(time, type, title, text) {
        let color = null;

        switch (type) {
            case "INFO":
                color = "#6060ffff";
                break;

            case "START":
                color = "#6060ffff";
                break;

            case "ERROR":
                color = "#ff6060ff";
                break;

            case "NETWORK":
                color = "#60ff60ff";
                break;

            default:
                color = "#ffffffff";
                break;
        }

        $('#debugLogLists').prepend(`
            <li>
                <h3 class="title" style="color: ${color};">${title} ${time}</h3>
                <p class="text">${text}</p>
            </li>
        `);
    }


    delete() {
        this.debugLogs = [];

        $('#debugLogLists').html("");
        localStorage.removeItem("debugLogs");
    }
}