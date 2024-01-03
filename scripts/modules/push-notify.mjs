/*
 *
 * push.mjs | YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

export class PushNotify {
    constructor() {
        if (!Push.Permission.has()) { Push.Permission.request(() => { }, () => { }) }
    }
}