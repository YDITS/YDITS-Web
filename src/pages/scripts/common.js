/**!
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the Apache License 2.0.
 *
 */

import { Render } from "https://cdn.yoneyo.com/scripts/render/render-v1.0.0.mjs";

document.addEventListener("DOMContentLoaded", async () => await loadCommonElements());

/**
 * 共通の要素を読み込む
 * @returns {Promise<void>}
 */
async function loadCommonElements() {
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
     * ヘッダー
     * @returns {HTMLElement[]}
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
     * フッター
     * @returns {HTMLElement[]}
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
}
