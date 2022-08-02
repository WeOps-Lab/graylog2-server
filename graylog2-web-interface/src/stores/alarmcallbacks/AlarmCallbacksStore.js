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
import ApiRoutes from 'routing/ApiRoutes';
import fetch from 'logic/rest/FetchProvider';

import { singletonActions, singletonStore } from '../../logic/singleton';

export const AlarmCallbacksActions = singletonActions(
  'core.AlarmCallbacks',
  Reflux.createActions({
    delete: { asyncResult: true },
    list: { asyncResult: true },
    save: { asyncResult: true },
    update: { asyncResult: true },
  }),
);

export const AlarmCallbacksStore = singletonStore(
  'core.AlarmCallbacks',
  Reflux.createStore({
    listenables: [AlarmCallbacksActions],

    list(streamId) {
      const failCallback = (error) => UserNotification.error(`加载告警通知: ${error.message} 失败`,
        '加载告警通知失败');

      const url = URLUtils.qualifyUrl(ApiRoutes.AlarmCallbacksApiController.list(streamId).url);
      const promise = fetch('GET', url).then((response) => response.alarmcallbacks, failCallback);

      AlarmCallbacksActions.list.promise(promise);
    },
    save(streamId, alarmCallback) {
      const failCallback = (error) => {
        const errorMessage = (error.additional && error.additional.status === 400 ? error.additional.body.message : error.message);

        UserNotification.error(`保存告警通知失败: ${errorMessage}`,
          '无法保存告警通知');
      };

      const url = URLUtils.qualifyUrl(ApiRoutes.AlarmCallbacksApiController.create(streamId).url);

      const promise = fetch('POST', url, alarmCallback);

      promise.then(
        () => UserNotification.success('告警通知保存成功'),
        failCallback,
      );

      AlarmCallbacksActions.save.promise(promise);
    },
    delete(streamId, alarmCallbackId) {
      const failCallback = (error) => UserNotification.error(`删除告警通知失败: ${error.message}`,
        '删除告警通知失败');

      const url = URLUtils.qualifyUrl(ApiRoutes.AlarmCallbacksApiController.delete(streamId, alarmCallbackId).url);

      const promise = fetch('DELETE', url);

      promise.then(
        () => UserNotification.success('删除告警通知成功'),
        failCallback,
      );

      AlarmCallbacksActions.delete.promise(promise);
    },
    update(streamId, alarmCallbackId, deltas) {
      const failCallback = (error) => {
        const errorMessage = (error.additional && error.additional.status === 400 ? error.additional.body.message : error.message);

        UserNotification.error(`更新告警通知 '${alarmCallbackId}' 失败: ${errorMessage}`,
          '更新告警通知失败');
      };

      const url = URLUtils.qualifyUrl(ApiRoutes.AlarmCallbacksApiController.update(streamId, alarmCallbackId).url);

      const promise = fetch('PUT', url, deltas);

      promise.then(
        () => UserNotification.success('更新告警通知成功'),
        failCallback,
      );

      AlarmCallbacksActions.update.promise(promise);
    },
  }),
);
