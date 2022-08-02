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
import lodash from 'lodash';

import fetch from 'logic/rest/FetchProvider';
import ApiRoutes from 'routing/ApiRoutes';
import * as URLUtils from 'util/URLUtils';
import UserNotification from 'util/UserNotification';
import { singletonStore } from 'logic/singleton';

type StreamRule = {
  field: string,
  type: number,
  value: string,
  inverted: boolean,
  description: string,
};

type Callback = {
  (): void,
};

// eslint-disable-next-line import/prefer-default-export
export const StreamRulesStore = singletonStore(
  'core.StreamRules',
  () => Reflux.createStore({
    callbacks: [],

    types() {
      const url = '/streams/null/rules/types';
      const promise = fetch('GET', URLUtils.qualifyUrl(url));

      return promise;
    },
    update(streamId: string, streamRuleId: string, data: StreamRule, callback: (() => void)) {
      const failCallback = (error) => {
        UserNotification.error(`获取消息流规则失败: ${error}`,
          '无法获取消息流规则');
      };

      const url = URLUtils.qualifyUrl(ApiRoutes.StreamRulesApiController.update(streamId, streamRuleId).url);
      const request = {
        field: data.field,
        type: data.type,
        value: data.value,
        inverted: data.inverted,
        description: data.description,
      };

      fetch('PUT', url, request)
        .then(callback, failCallback)
        .then(this._emitChange.bind(this));
    },
    remove(streamId: string, streamRuleId: string, callback: (() => void)) {
      const failCallback = (error) => {
        UserNotification.error(`更新消息流规则失败: ${error}`,
          '无法更新消息流规则');
      };

      const url = URLUtils.qualifyUrl(ApiRoutes.StreamRulesApiController.delete(streamId, streamRuleId).url);

      fetch('DELETE', url)
        .then(callback, failCallback)
        .then(this._emitChange.bind(this));
    },
    create(streamId: string, data: StreamRule, callback: (() => void)) {
      const failCallback = (error) => {
        UserNotification.error(`创建消息流规则失败: ${error}`,
          '无法创建消息流规则');
      };

      const url = URLUtils.qualifyUrl(ApiRoutes.StreamRulesApiController.create(streamId).url);

      fetch('POST', url, data)
        .then(callback, failCallback)
        .then(this._emitChange.bind(this));
    },
    onChange(callback: Callback) {
      this.callbacks.push(callback);
    },
    _emitChange() {
      this.callbacks.forEach((callback) => callback());
    },
    unregister(callback: Callback) {
      lodash.pull(this.callbacks, callback);
    },
  }),
);
