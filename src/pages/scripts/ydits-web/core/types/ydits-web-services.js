/*!
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 * Licensed under the Apache License 2.0.
 *
 * https://github.com/YDITS/YDITS-Web
 *
 */

import { Datetime } from "../../services/datetime/datetime.js";
import { DebugLogs } from "../../services/debug-logs/debug-logs.js";
import { ElementsManager } from "../../services/elements/elements.js";
import { Notify } from "../../services/notify/notify.js";
import { GeoLocation } from "../../services/geolocation/geolocation.js";
import { Eew } from "../../services/eew/eew.js";
import { Eqinfo } from "../../services/eqinfo/eqinfo.js";
import { JmaDataFeed } from "../../services/jma/jma-data-feed.js";
import { ServiceWorker } from "../../services/service-worker/service-worker.js";
import { PushNotify } from "../../services/push-notify/push-notify.js";
import { Sounds } from "../../services/sounds/sounds.js";
import { Api } from "../../services/api/api.js";
import { Settings } from "../../services/settings/settings.js";
import { Map } from "../../services/map/map.js";

/**
 * @typedef {{
 *     datetime: Datetime,
 *     debugLogs: DebugLogs,
 *     elementsManager: ElementsManager,
 *     notify: Notify,
 *     geoLocation: GeoLocation,
 *     eew: Eew,
 *     eqinfo: Eqinfo,
 *     jmaDataFeed: JmaDataFeed,
 *     serviceWorker: ServiceWorker,
 *     pushNotify: PushNotify,
 *     sounds: Sounds,
 *     api: Api,
 *     settings: Settings,
 *     map: Map,
 * }} YditsWebServices
 */
