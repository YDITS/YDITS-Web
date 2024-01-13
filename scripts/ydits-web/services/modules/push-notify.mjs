/*
 *
 * YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

'use strict';

import { Service } from "../../../service.mjs"

/**
 * プッシュ通知を扱うサービスです。
 */
export class PushNotify extends Service {
    constructor(app) {
        super(app, {
            name: "pushNotify",
            description: "プッシュ通知を扱うサービスです。",
            version: "0.0.0",
            author: "よね/Yone",
            copyright: "Copyright © よね/Yone"
        });

        if (!Push.Permission.has()) { Push.Permission.request(() => { }, () => { }) }
    }
}