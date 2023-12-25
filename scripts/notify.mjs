/*
 *
 * notify.mjs | YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

export class Notify {
    constructor() {
        this.notifyEle = $("#notify");
        this.lastNotifyId = null;
    }


    show(type, title, text) {
        let color = null;
        let deleteAfter = null;

        switch (type) {
            case "message":
                color = "#404040ff";
                deleteAfter = 5000;
                break;

            case "error":
                color = "#ff5050ff";
                deleteAfter = 8000;
                break;

            default:
                color = "#404040ff";
                deleteAfter = 5000;
                break;
        }

        this.notifyEle
            .html(`
                <h3>${title}</h3>
                <p>${text}</p>
            `)
            .css({
                "background-color": color
            })
            .addClass("active");

        clearTimeout(this.lastNotifyId);
        this.lastNotifyId = setTimeout(() => {
            this.hide();
        }, deleteAfter);
    }
    
    
    hide() {
        this.notifyEle.removeClass("active");
    }
}
