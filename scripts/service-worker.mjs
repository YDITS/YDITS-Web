/*
 *
 * service-worker.mjs | YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

export class ServiceWorker {
    constructor(debugLogs) {
        this.debugLogs = debugLogs;
        this.register();
    }


    async register() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register(
                    './sw.js',
                    {
                        scope: './',
                    }
                );
                if (registration.installing) {
                    this.debugLogs.add("INFO", `[INFO]`, "Service worker installing.");
                } else if (registration.waiting) {
                    this.debugLogs.add("INFO", `[INFO]`, "Service worker installed.");
                } else if (registration.active) {
                    // this.debugLogs.add(`[INFO ]`, "Service worker active.");
                }
            } catch (error) {
                this.debugLogs.add("ERROR", `[ERROR]`, `Registration failed with ${error}`);
            }
        } else {
            this.debugLogs.add("INFO", `[INFO]`, "Service worker is not installed.");
        }
    }
}