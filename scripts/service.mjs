/*
 *
 * service.mjs | YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

/**
 * アプリケーションで稼働するサービスを作成します。
 */
export class Service {
    constructor(app, config) {
        this._app = app;
        this._name = config.name;
        this._description = config.description;
        this._version = config.version;
        this._author = config.author;
        this._copyright = config.copyright;
    }


    get app() {
        return this._app;
    }


    get config() {
        return {
            name: this._name,
            description: this._description,
            version: this._version,
            author: this.author,
            copyright: this._copyright
        }
    }


    get name() {
        return this._name;
    }


    get description() {
        return this._description;
    }


    get version() {
        return this._version;
    }


    get author() {
        return this._author;
    }


    get copyright() {
        return this._copyright;
    }
}