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

document.addEventListener(
    "DOMContentLoaded",
    async() => await loadCommonElements()
);

// ---------------------------------------------------------------------------------------------------- //

async function loadCommonElements() {
    await trying(fetchAndSetElement, {query: "header", uri: "/elements/header.html"});
    if (new Set(["/", "/eqhistory/", "/debug-logs/"]).has(location.pathname)) { return; }
    await trying(fetchAndSetElement, {query: "footer", uri: "/elements/footer.html"});
}

// ---------------------------------------------------------------------------------------------------- //

async function trying(func, args) {
    try {
        return await func(args);
    } catch (error) {
        console.error(error);
    }
}

// ---------------------------------------------------------------------------------------------------- //

async function fetchAndSetElement(args) {
    let response;
    
    try {
        response = await fetch(args.uri);
    } catch (error) {
        throw new Error(`Failed to fetch html {url: ${args.uri}}: ${error}`);
    }

    const html = await response.text();

    // ---------- //

    const element = document.querySelector(args.query);

    if (!element) {
        throw new Error(`Invalid query specified {query: ${args.query}}`);
    }

    // ---------- //

    element.innerHTML = html;
}