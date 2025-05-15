/**!
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the Apache License 2.0.
 *
 */

import { Component } from "./component.js";

export class Header extends Component {
    /**
     * @param {{
     *     render: Render,
     * }}
     */
    constructor({ render }) {
        super({ render });
    }

    /**
     * @returns {HTMLElement[]}
     */
    build() {
        const render = this.render;

        return [
            render.$div({
                className: "wrapper",
                children: [
                    render.$h1({
                        id: "headerTitle",
                        className: "header__title",
                        textContent: "YDITS for Web",
                    }),
                ],
            }),
        ];
    }
}