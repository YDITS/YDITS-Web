/*
 *
 * eew.mjs | YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

export class Eew {
    data = null;


    constructor() {
        this.$eewWarn = $("#eewWarn");

        $(document).on("click", "#eewNotify", () => this.displayWarn());
        $(document).on("click", "#eewWarn .closeBtn", () => this.hideWarn());
    }


    initialize(settings) {
        this.settings = settings;
        switch (this.settings.connect.eew) {
            case "yahoo-kmoni":
                break;
        }
    }


    displayWarn(data) {
        this.$eewWarn.addClass("active");
    }

    hideWarn(data) {
        this.$eewWarn.removeClass("active");
    }
}