/*
 *
 * App Creater
 *
 * Copyright (C) よね/Yone
 *
 * Licensed under the MIT License.
 *
 */

export class ServiceManager {
    /**
     * サービスオブジェクト
     * @returns {Object<string, Service>}
     */
    get services() {
        return this.#services;
    }


    /**
     * サービスを登録する
     * @param {class<Service>} NewService
     * @returns {void}
     */
    register(NewService) {
        const newService = new NewService(this);

        if (!newService.name) {
            throw new Error('`name` is required in the service.');
        }

        this.services[newService.name] = newService;
    }


    /**
     * サービスオブジェクト
     * @type {Object<string, Service>}
     */
    #services = {};
}