/*
 *
 * index.js | YDITS for Web
 *
 * Copyright (c) YDITS, よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */


import { YditsWeb } from "./ydits-web.mjs";

(() => {
    document.addEventListener('DOMContentLoaded', () => {
        new YditsWeb()
    });
})();


