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

/**
 * @typedef {Object} LoadItem
 * @property {Component} component - ロードするコンポーネントのインスタンス。
 * @property {string} targetSelector - コンポーネントを挿入する DOM 要素のセレクタ文字列。
 * @property {function(Location): boolean} [condition] - ロードを実行するかどうかを決定する関数。引数に window.location が渡されます。省略された場合は常に true とみなされます。
 */

export class DomLoader {
    /**
     * @param {{
     * render: Render,
     * items: LoadItem[],
     * }}
     */
    constructor({ render, items }) {
        if (!render) {
            throw new Error("Render instance is required.");
        }
        if (!Array.isArray(items)) {
            throw new Error("items must be an array of LoadItem objects.");
        }
        this.render = render;
        this.items = items;
    }

    /**
     * @returns {void}
     */
    load() {
        const currentLocation = window.location;
        const items = this.items;
        const render = this.render;

        items.forEach(item => {
            const shouldLoad = item.condition ? item.condition(currentLocation) : true;

            if (!shouldLoad) return;

            const targetElement = document.querySelector(item.targetSelector);

            if (!targetElement) {
                console.warn(`DomLoader: Target element not found for selector "${item.targetSelector}".`);
            }

            const builtElements = item.component.build();

            render.build({
                target: targetElement,
                children: builtElements
            });
        });
    }
}