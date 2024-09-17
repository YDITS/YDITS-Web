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

(function() {
    function loadCommonElements() {
        $("header").load("/elements/header.html");
        $("footer").load("/elements/footer.html");
    }


    $(function() {
        loadCommonElements();
    });
})();
