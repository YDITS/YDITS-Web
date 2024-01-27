/*
 *
 * YDITS for Web
 *
 * Copyright (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

'use strict';

(function() {
    function initializePage() {
        loadCommonElements();
    }


    function loadCommonElements() {
        $("header").load("./elements/header.html");
        $("footer").load("./elements/footer.html");
    }


    $(function() {
        initializePage();
    });
})();
