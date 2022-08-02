/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
import Reflux from 'reflux';

import UserNotification from 'util/UserNotification';
import * as URLUtils from 'util/URLUtils';
import fetch from 'logic/rest/FetchProvider';
import { singletonStore, singletonActions } from 'logic/singleton';

export const LookupTableCachesActions = singletonActions(
  'core.LookupTableCaches',
  () => Reflux.createActions({
    searchPaginated: { asyncResult: true },
    reloadPage: { asyncResult: true },
    get: { asyncResult: true },
    create: { asyncResult: true },
    delete: { asyncResult: true },
    update: { asyncResult: true },
    getTypes: { asyncResult: true },
    validate: { asyncResult: true },
  }),
);

export const LookupTableCachesStore = singletonStore(
  'core.LookupTableCaches',
  () => Reflux.createStore({
    listenables: [LookupTableCachesActions],
    cache: null,
    caches: null,
    types: null,
    pagination: {
      page: 1,
      per_page: 10,
      total: 0,
      count: 0,
      query: null,
    },
    validationErrors: {},

    getInitialState() {
      return this.getState();
    },

    getState() {
      return {
        cache: this.cache,
        caches: this.caches,
        types: this.types,
        pagination: this.pagination,
        validationErrors: this.validationErrors,
      };
    },

    propagateChanges() {
      this.trigger(this.getState());
    },

    reloadPage() {
      const promise = this.searchPaginated(this.pagination.page, this.pagination.per_page, this.pagination.query);

      LookupTableCachesActions.reloadPage.promise(promise);

      return promise;
    },

    searchPaginated(page, perPage, query) {
      let url;

      if (query) {
        url = this._url(`caches?page=${page}&per_page=${perPage}&query=${encodeURIComponent(query)}`);
      } else {
        url = this._url(`caches?page=${page}&per_page=${perPage}`);
      }

      const promise = fetch('GET', url);

      promise.then((response) => {
        this.pagination = {
          count: response.count,
          total: response.total,
          page: response.page,
          per_page: response.per_page,
          query: response.query,
        };

        this.caches = response.caches;
        this.propagateChanges();
      }, this._errorHandler('无法获取数据字典缓存信息', '无法获取数据字典缓存信息'));

      LookupTableCachesActions.searchPaginated.promise(promise);

      return promise;
    },

    get(idOrName) {
      const url = this._url(`caches/${idOrName}`);
      const promise = fetch('GET', url);

      promise.then((response) => {
        this.cache = response;
        this.propagateChanges();
      }, this._errorHandler(`加载数据字典缓存 ${idOrName} 失败`, '无法获得数据字典缓存'));

      LookupTableCachesActions.get.promise(promise);

      return promise;
    },

    create(cache) {
      const url = this._url('caches');
      const promise = fetch('POST', url, cache);

      promise.then((response) => {
        this.cache = response;
        this.propagateChanges();
      }, this._errorHandler('创建数据字典缓存失败', `无法创建数据字典缓存 "${cache.name}"`));

      LookupTableCachesActions.create.promise(promise);

      return promise;
    },

    update(cache) {
      const url = this._url(`caches/${cache.id}`);
      const promise = fetch('PUT', url, cache);

      promise.then((response) => {
        this.cache = response;
        this.propagateChanges();
      }, this._errorHandler('更新数据字典缓存失败', `无法更新数据字典缓存 "${cache.name}"`));

      LookupTableCachesActions.update.promise(promise);

      return promise;
    },

    getTypes() {
      const url = this._url('types/caches');
      const promise = fetch('GET', url);

      promise.then((response) => {
        this.types = response;
        this.propagateChanges();
      }, this._errorHandler('加载可用类型失败', '无法加载可用类型'));

      LookupTableCachesActions.getTypes.promise(promise);

      return promise;
    },

    delete(idOrName) {
      const url = this._url(`caches/${idOrName}`);
      const promise = fetch('DELETE', url);

      promise.catch(this._errorHandler('删除数据字典失败', `无法删除数据字典 "${idOrName}"`));

      LookupTableCachesActions.delete.promise(promise);

      return promise;
    },

    validate(cache) {
      const url = this._url('caches/validate');
      const promise = fetch('POST', url, cache);

      promise.then((response) => {
        this.validationErrors = response.errors;
        this.propagateChanges();
      }, this._errorHandler('数据字典校验失败', `无法校验数据字典 "${cache.name}"`));

      LookupTableCachesActions.validate.promise(promise);

      return promise;
    },

    _errorHandler(message, title, cb) {
      return (error) => {
        let errorMessage;

        try {
          errorMessage = error.additional.body.message;
        } catch (e) {
          errorMessage = error.message;
        }

        UserNotification.error(`${message}: ${errorMessage}`, title);

        if (cb) {
          cb(error);
        }
      };
    },

    _url(path) {
      return URLUtils.qualifyUrl(`/system/lookup/${path}`);
    },
  }),
);
