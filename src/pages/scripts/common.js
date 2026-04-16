/**!
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 * Licensed under the Apache License 2.0.
 * 
 * https://github.com/YDITS/YDITS-Web
 *
 */

import { Render } from "https://cdn.yoneyo.com/scripts/render@1.0.0/render.js";

const render = new Render();

loadCommonComponents();

/**
 * @returns {void}
 */
function loadCommonComponents() {
    const $headerWrapper = document.querySelector("header");
    const $footerWrapper = document.querySelector("footer");

    render.build({
        target: $headerWrapper,
        children: $header("YDITS for Web"),
    });

    if (shouldLoadFooter(location)) {
        render.build({
            target: $footerWrapper,
            children: $footer("© よね/Yone"),
        });
    }
}

/**
 * @param {Location} _location 
 * @returns {boolean}
 */
function shouldLoadFooter(_location) {
    return !["/", "/eqhistory/", "/debug-logs/"].includes(_location.pathname);
}

/**
 * @param {string} title 
 * @returns {Array<HTMLElement>}
 */
function $header(title) {
    return [
        render.$div({
            className: "wrapper",
            children: [
                render.$h1({
                    id: "headerTitle",
                    className: "header__title",
                    textContent: title,
                }),
            ],
        }),
    ];
}

/**
 * @param {string} copyright 
 * @returns {Array<HTMLElement>}
 */
function $footer(copyright) {
    return [
        render.$div({
            className: "wrapper",
            children: [
                render.$p({
                    id: "footerCopyright",
                    textContent: copyright,
                }),
            ],
        }),
    ];
}
