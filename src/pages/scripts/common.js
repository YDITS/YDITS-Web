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

function loadCommonComponents() {
    const $headerWrapper = document.querySelector("header");
    const $footerWrapper = document.querySelector("footer");

    render.build({
        target: $headerWrapper,
        children: $header("YDITS for Web"),
    });

    if (shouldLoadFooter()) {
        render.build({
            target: $footerWrapper,
            children: $footer("© よね/Yone"),
        });
    }
}

function shouldLoadFooter(location) {
    return !["/", "/eqhistory/", "/debug-logs/"].includes(location.pathname);
}

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