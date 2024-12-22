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

document.addEventListener("DOMContentLoaded", loadCommonElements);

// ---------------------------------------------------------------------------------------------------- //

async function loadCommonElements() {
    await trying(fetchAndSetElement, "header", "/elements/header.html");
    if (new Set(["/", "/eqhistory/", "/debug-logs/"]).has(location.pathname)) { return; }
    await trying(fetchAndSetElement, "footer", "/elements/footer.html");
}

// ---------------------------------------------------------------------------------------------------- //

async function trying(func, ...args) {
    try {
        return await func(...args);
    } catch (error) {
        console.error(error);
    }
}

// ---------------------------------------------------------------------------------------------------- //

async function fetchAndSetElement(query, uri) {
    let response;

    try {
        response = await fetch(uri);
    } catch (error) {
        throw new Error(`Failed to fetch html {url: ${uri}}: ${error}`);
    }

    const html = await response.text();

    // ---------- //

    const element = document.querySelector(query);

    if (!element) {
        throw new Error(`Invalid query specified {query: ${query}}`);
    }

    // ---------- //

    element.innerHTML = html;
}