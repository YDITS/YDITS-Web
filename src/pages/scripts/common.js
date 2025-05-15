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
import { DomLoader } from "./components/loader.js";
import { Header } from "./components/header.js";
import { Footer } from "./components/footer.js";

const render = new Render();
const header = new Header({ render });
const footer = new Footer({ render });

/** @type {LoadItem[]} */
const loaderConfig = [
    {
        component: header,
        targetSelector: "header",
    },
    {
        component: footer,
        targetSelector: "footer",
        condition: (location) => !["/", "/eqhistory/", "/debug-logs/"].includes(location.pathname),
    },
];

const domLoader = new DomLoader({
    render: render,
    items: loaderConfig
});

document.addEventListener("DOMContentLoaded", () => {
    domLoader.load();
});
