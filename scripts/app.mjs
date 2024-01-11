/*
 *
 * app.mjs | YDITS for Web
 *
 * (c) よね/Yone
 *
 * No modification or reproduction of any kind is permitted.
 * 改変や複製を一切禁じます。
 *
 */

/**
 * アプリケーションを作成します。
 */
export class App {
    _services = [];


    constructor(config) {
        this._name = config.name;
        this._description = config.author;
        this._version = config.version;
        this._author = config.author;
        this._copyright = config.copyright;
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


    get services() {
        return this._services;
    }


    /**
     * 新規のサービスを登録します。
     */
    register(service) {
        const newService = new service(this);
        this._services[newService.name] = newService;
    }
}
