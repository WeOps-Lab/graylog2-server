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

import ApiRoutes from 'routing/ApiRoutes';
import fetch from 'logic/rest/FetchProvider';
import * as URLUtils from 'util/URLUtils';
import UserNotification from 'util/UserNotification';

import { singletonActions, singletonStore } from '../../logic/singleton';

export const AlertsActions = singletonActions(
  'core.Alerts',
  Reflux.createActions({
    get: { asyncResult: true },
    list: { asyncResult: true },
    listPaginated: { asyncResult: true },
    listAllPaginated: { asyncResult: true },
    listAllStreams: { asyncResult: true },
  }),
);

export const AlertsStore = singletonStore(
  'core.Alerts',
  Reflux.createStore({
    listenables: [AlertsActions],

    list(stream, since) {
      const url = URLUtils.qualifyUrl(ApiRoutes.AlertsApiController.list(stream.id, since).url);
      const promise = fetch('GET', url);

      promise
        .then(
          (response) => this.trigger({ alerts: response }),
          (error) => {
            UserNotification.error(`加载消息流 "${stream.title}" 的告警失败: ${error.message}`,
              `无法加载消息流 "${stream.title}" 的告警.`);
          },
        );

      AlertsActions.list.promise(promise);
    },

    listPaginated(streamId, skip, limit, state = 'any') {
      const url = URLUtils.qualifyUrl(ApiRoutes.AlertsApiController.listPaginated(streamId, skip, limit, state).url);
      const promise = fetch('GET', url);

      promise
        .then(
          (response) => this.trigger({ alerts: response }),
          (error) => {
            UserNotification.error(`加载告警失败: ${error.message}`, '无法加载消息流的告警.');
          },
        );

      AlertsActions.listPaginated.promise(promise);
    },

    listAllPaginated(skip, limit, state) {
      const url = URLUtils.qualifyUrl(ApiRoutes.AlertsApiController.listAllPaginated(skip, limit, state).url);
      const promise = fetch('GET', url);

      promise.then(
        (response) => this.trigger({ alerts: response }),
        (error) => {
          UserNotification.error(`加载告警失败: ${error.message}`, '无法加载告警.');
        },
      );

      AlertsActions.listAllPaginated.promise(promise);
    },

    listAllStreams(since) {
      const url = URLUtils.qualifyUrl(ApiRoutes.AlertsApiController.listAllStreams(since).url);
      const promise = fetch('GET', url);

      promise
        .then(
          (response) => this.trigger({ alerts: response }),
          (error) => {
            UserNotification.error(`加载告警状态失败: ${error.message}`, '无法加载告警状态.');
          },
        );

      AlertsActions.listAllStreams.promise(promise);
    },

    get(alertId) {
      const url = URLUtils.qualifyUrl(ApiRoutes.AlertsApiController.get(alertId).url);
      const promise = fetch('GET', url);

      promise.then(
        (response) => {
          this.trigger({ alert: response });

          return response;
        },
        (error) => {
          UserNotification.error(`加载告警 '${alertId}' 失败: ${error.message}`, '无法加载告警.');
        },
      );

      AlertsActions.get.promise(promise);
    },
  }),
);
