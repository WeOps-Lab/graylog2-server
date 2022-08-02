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

export const AlertNotificationsActions = singletonActions(
  'core.AlertNotifications',
  Reflux.createActions({
    available: { asyncResult: true },
    listAll: { asyncResult: true },
    testAlert: { asyncResult: true },
  }),
);

export const AlertNotificationsStore = singletonStore(
  'core.AlertNotifications',
  Reflux.createStore({
    listenables: [AlertNotificationsActions],
    availableNotifications: undefined,
    allNotifications: undefined,

    getInitialState() {
      return {
        availableNotifications: this.availableNotifications,
        allNotifications: this.allNotifications,
      };
    },

    available() {
      const url = URLUtils.qualifyUrl(ApiRoutes.AlarmCallbacksApiController.available().url);
      const promise = fetch('GET', url);

      promise
        .then(
          (response) => {
            this.availableNotifications = response.types;
            this.trigger({ availableNotifications: this.availableNotifications });

            return this.availableNotifications;
          },
          (error) => {
            UserNotification.error(`获取可用的告警通知类型失败：${error.message}`,
              '无法获取可用的告警通知类型');
          },
        );

      AlertNotificationsActions.available.promise(promise);
    },

    listAll() {
      const url = URLUtils.qualifyUrl(ApiRoutes.AlarmCallbacksApiController.listAll().url);
      const promise = fetch('GET', url);

      promise.then(
        (response) => {
          this.allNotifications = response.alarmcallbacks;
          this.trigger({ allNotifications: this.allNotifications });

          return this.allNotifications;
        },
        (error) => {
          UserNotification.error(`获取告警通知失败：${error.message}`,
            '无法获取告警通知');
        },
      );

      AlertNotificationsActions.listAll.promise(promise);
    },

    testAlert(alarmCallbackId) {
      const url = URLUtils.qualifyUrl(ApiRoutes.AlarmCallbacksApiController.testAlert(alarmCallbackId).url);

      const promise = fetch('POST', url);

      promise.then(
        () => UserNotification.success('测试通知发送成功。'),
        (error) => {
          const message = (error.additional && error.additional.body && error.additional.body.message ? error.additional.body.message : error.message);

          UserNotification.error(`发送测试通知失败：${message}`,
            '无法发送测试通知');
        },
      );

      AlertNotificationsActions.testAlert.promise(promise);

      // Need to do this to handle possible concurrent calls to this method
      return promise;
    },
  }),
);
