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

import { YditsWeb } from "./ydits-web/ydits-web.js";

const app = new YditsWeb();

await app.run().catch(error => {
    console.error("アプリケーションのイニシャライズに失敗しました:", error);
    alert(`アプリケーションのイニシャライズに失敗しました: ${error?.stack ?? error}`);
});
