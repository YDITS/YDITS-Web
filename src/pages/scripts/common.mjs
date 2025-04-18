/*
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the Apache License 2.0.
 *
 */

import { Render } from "https://cdn.yoneyo.com/scripts/render/render-v1.0.0.mjs";


document.addEventListener("DOMContentLoaded", async () => {
    /**
     * @type {Render}
     */
    const render = new Render();

    render.build({
        target: document.querySelector("header"),
        children: header(),
    });

    if (["/", "/eqhistory/", "/debug-logs/"].includes(location.pathname)) return;

    render.build({
        target: document.querySelector("footer"),
        children: footer(),
    });

    /**
     * @returns {Element[]}
     */
    function header() {
        return [
            render.$div({
                className: "wrapper",
                children: [
                    render.$h1({
                        id: "headerTitle",
                        className: "header__title",
                        textContent: "YDITS for Web",
                    }),
                ],
            }),
        ]
    }

    /**
     * @returns {Element[]}
     */
    function footer() {
        return [
            render.$div({
                className: "wrapper",
                children: [
                    render.$p({
                        id: "footerCopyright",
                        innerHTML: "&copy; よね/Yone",
                    }),
                ],
            }),
        ]
    }
});


/**
 * エラーを無視して関数を実行する
 * @param {Function<Promise<any>>} func 
 * @param  {...any} args 
 * @returns {Promise<any>}
 */
async function safeCall(func, ...args) {
    try {
        return await func(...args);
    } catch (error) {
        console.error(error.stack);
    };
}
