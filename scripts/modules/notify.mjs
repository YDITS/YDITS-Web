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
    lastNotifyId = null;


    constructor() {
        this.$notifyEle = $("#notify");
    }


    show(type, title, text) {
        let color = null;
        let hideAfter = null;

        switch (type) {
            case "message":
                color = "#404040ff";
                hideAfter = 5000;
                break;

            case "error":
                color = "#ff5050ff";
                hideAfter = 5000;
                break;

            default:
                color = "#404040ff";
                hideAfter = 5000;
                break;
        }

        this.$notifyEle
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
        }, hideAfter);
    }


    hide() {
        this.$notifyEle.removeClass("active");
    }
}
