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

export class Footer extends Component {
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
                    render.$p({
                        id: "footerCopyright",
                        innerHTML: "&copy; よね/Yone",
                    }),
                ],
            }),
        ];
    }

}