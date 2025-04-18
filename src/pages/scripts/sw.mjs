/*
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the Apache License 2.0.
 *
 */

self.addEventListener("install", async (event) => await onInstall(event));
self.addEventListener('fetch', async (event) => await onFetch(event));

/**
 * インストール時のイベントハンドラ
 * @param {Event} event 
 * @returns {Promise<void>}
 */
async function onInstall(event) {
    console.log("Service Worker installed.");
}


/**
 * フェッチ時のイベントハンドラ
 * @param {Event} event 
 * @returns {Promise<void>}
 */
async function onFetch(event) {
    console.log("Service Worker fetching.");
}
