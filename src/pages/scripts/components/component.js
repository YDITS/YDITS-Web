/**!
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 * Licensed under the Apache License 2.0.
 * 
 * https://github.com/YDITS/YDITS-Web
 *
 */

export class Component {
    /**
     * @param {{
     *     render: Render,
     * }}
     */
    constructor({ render }) {
        this.render = render;
    }

    /**
     * @returns {HTMLElement[]}
     */
    build() {
        return [];
    }
}