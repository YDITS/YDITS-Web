/*
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the Apache License 2.0.
 *
 */

'use strict';

document.addEventListener("DOMContentLoaded", async() => await loadCommonElements());


/**
 * 共通の要素を読み込む
 * @returns {Promise<void>}
 */
async function loadCommonElements() {
    await safeCall(fetchAndSetElement, "header", "/elements/header.html");

    if (new Set(["/", "/eqhistory/", "/debug-logs/"]).has(location.pathname)) { return; }
    await safeCall(fetchAndSetElement, "footer", "/elements/footer.html");
}


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


/**
 * 要素を Fetch して読み込む
 * @param {string} query 
 * @param {string} uri 
 * @returns {Promise<void>}
 */
async function fetchAndSetElement(query, uri) {
    const response = await fetch(uri)
        .catch((error) => {
            throw new Error(`Failed to fetch html {url: ${uri}}: ${error.message}`, { error: error.stack });
        });

    const html = await response.text()
        .catch((error) => {
            throw new Error(`Failed to read html {url: ${uri}}: ${error.message}`, { error: error.stack });
        });

    let element;
    try {
        element = document.querySelector(query);
    } catch (error) {
        throw new Error(`Failed to get element {query: ${query}}: ${error.message}`, { error: error.stack });
    }

    if (!element) {
        throw new Error(`Invalid query specified {query: ${query}}: ${error.message}`, { error: error.stack });
    }

    element.innerHTML = html;
}
