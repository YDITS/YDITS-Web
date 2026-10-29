/*!
 *
 * YDITS for Web
 *
 * Copyright (C) 2022-2026 よね/Yone
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
