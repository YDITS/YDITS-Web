/*!
 * 
 * Popup Dialog
 * 
 * Copyright (C) よね/Yone
 * 
 * Licensed under the MIT License.
 * 
 */

/**
 * ポップアップウィンドウを作成する
 */
export class PopupDialog {
    /**
     * @param {{
     *     type?: keyof typeof PopupDialog.types,
     *     id?: string,
     *     title?: string,
     *     content?: string,
     *     create?: boolean,
     * }} config
     */
    constructor({
        type = PopupDialog.types.default,
        id,
        title = "",
        content = "",
        create = true
    }) {
        this.type = type;
        this.id = id ? `win_${id}` : `win_${new Date().getTime()}`;
        this.title = title;
        this.content = content;
        this.color = PopupDialog.windowTypeToColor[this.type] || PopupDialog.windowTypeToColor.default;

        if (create) {
            this.create();
        }
    }


    /**
     * ウィンドウの要素
     * 
     * @type {HTMLElement | null}
     */
    get element() {
        if (!(this.#element instanceof HTMLElement)) {
            this.#element = document.getElementById(this.id);
        }

        return this.#element;
    }


    /**
     * @type {{
     *     readonly message: string,
     *     readonly error: string,
     *     readonly default: string,
     * }}
     */
    static types = Object.freeze({
        message: "message",
        error: "error",
        default: "message",
    });


    /**
     * @type {{
     *     readonly message: string,
     *     readonly error: string,
     *     readonly default: string,
     * }}
     */
    static windowTypeToColor = Object.freeze({
        message: "#404040ff",
        error: "#ff5050ff",
        default: "#404040ff",
    });


    /**
     * ウィンドウの要素
     * 
     * @type {HTMLElement | null}
     */
    #element = null;


    /**
     * ウィンドウをドラッグ中かどうか
     * 
     * @type {boolean}
     */
    #isDragging = false;


    /**
     * ドラッグ開始時のオフセットX座標
     * 
     * @type {number}
     */
    #offsetX = 0;


    /**
     * ドラッグ開始時のオフセットY座標
     * 
     * @type {number}
     */
    #offsetY = 0;


    /**
     * ウィンドウを作成する
     * 
     * @returns {void}
     */
    create() {
        if (this.element instanceof HTMLElement) {
            throw new Error(`Window with id \`${this.id}\` already exists.`);
        };

        const newWindowElement = `
                <dialog class="dialog" id="${this.id}">
                    <div class="navBar">
                        <h2 class="title">${this.title}</h2>
                        <span class="close material-symbols-outlined">close</span>
                    </div>
    
                    <div class="content">
                        ${this.content}
                    </div>
                </dialog>
            `

        const parser = new DOMParser();
        const doc = parser.parseFromString(newWindowElement, "text/html");
        const dialogElement = doc.body.firstChild;

        this.#element = dialogElement;

        dialogElement.querySelector(".navBar").style.backgroundColor = this.color;
        dialogElement.querySelector(".close").addEventListener("click", () => this.close());
        dialogElement.querySelector(".navBar").addEventListener("mousedown", (event) => this.#startDragging(event));

        document.body.append(dialogElement);
    }


    /**
     * ウィンドウを閉じる
     * 
     * @returns {void}
     */
    close() {
        if (!(this.element instanceof HTMLElement)) {
            return;
        }

        this.element.remove();
    }


    /**
     * ドラッグ開始時の処理
     * 
     * @param {MouseEvent} event
     * @returns {void}
     */
    #startDragging(event) {
        this.#isDragging = true;
        this.#offsetX = event.clientX - this.element.getBoundingClientRect().left;
        this.#offsetY = event.clientY - this.element.getBoundingClientRect().top;
        document.addEventListener("mousemove", this.#move.bind(this));
        document.addEventListener("mouseup", this.#stopDragging.bind(this));
    }


    /**
     * ドラッグ終了時の処理
     * 
     * @param {MouseEvent} event
     * @returns {void}
     */
    #stopDragging(event) {
        this.#isDragging = false;
        document.removeEventListener("mousemove", this.#move.bind(this));
        document.removeEventListener("mouseup", this.#stopDragging.bind(this));
    }


    /**
     * ドラッグ中の処理
     * 
     * @param {MouseEvent} event
     * @returns {void}
     */
    #move(event) {
        if (!this.#isDragging) return;
        const x = event.clientX - this.#offsetX;
        const y = event.clientY - this.#offsetY;
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
    }
}
