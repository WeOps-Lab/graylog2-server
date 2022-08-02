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
import URI from 'urijs';
import lodash from 'lodash';

import * as URLUtils from 'util/URLUtils';
import UserNotification from 'util/UserNotification';
import fetch from 'logic/rest/FetchProvider';
import { singletonStore, singletonActions } from 'logic/singleton';

export const EventDefinitionsActions = singletonActions(
  'core.EventDefinitions',
  () => Reflux.createActions({
    listAll: { asyncResult: true },
    listPaginated: { asyncResult: true },
    get: { asyncResult: true },
    create: { asyncResult: true },
    update: { asyncResult: true },
    delete: { asyncResult: true },
    enable: { asyncResult: true },
    disable: { asyncResult: true },
    clearNotificationQueue: { asyncResult: true },
  }),
);

export const EventDefinitionsStore = singletonStore(
  'core.EventDefinitions',
  () => Reflux.createStore({
    listenables: [EventDefinitionsActions],
    sourceUrl: '/events/definitions',
    all: undefined,
    eventDefinitions: undefined,
    context: undefined,
    query: undefined,
    pagination: {
      count: undefined,
      page: undefined,
      pageSize: undefined,
      total: undefined,
      grandTotal: undefined,
    },

    getInitialState() {
      return this.getState();
    },

    propagateChanges() {
      this.trigger(this.getState());
    },

    getState() {
      return {
        all: this.all,
        eventDefinitions: this.eventDefinitions,
        context: this.context,
        query: this.query,
        pagination: this.pagination,
      };
    },

    eventDefinitionsUrl({ segments = [], query = {} }) {
      const uri = new URI(this.sourceUrl);
      const nextSegments = lodash.concat(uri.segment(), segments);

      uri.segmentCoded(nextSegments);
      uri.query(query);

      return URLUtils.qualifyUrl(uri.resource());
    },

    refresh() {
      if (this.all) {
        this.listAll();
      }

      if (this.pagination.page) {
        this.listPaginated({
          query: this.query,
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
        });
      }
    },

    listAll() {
      const promise = fetch('GET', this.eventDefinitionsUrl({ query: { per_page: 0 } }));

      promise.then((response) => {
        this.all = response.event_definitions;
        this.context = response.context;
        this.propagateChanges();

        return response;
      });

      EventDefinitionsActions.listAll.promise(promise);
    },

    listPaginated({ query = '', page = 1, pageSize = 10 }) {
      const promise = fetch('GET', this.eventDefinitionsUrl({
        query: {
          query: query,
          page: page,
          per_page: pageSize,
        },
      }));

      promise.then((response) => {
        this.eventDefinitions = response.event_definitions;
        this.context = response.context;
        this.query = response.query;

        this.pagination = {
          count: response.count,
          page: response.page,
          pageSize: response.per_page,
          total: response.total,
          grandTotal: response.grand_total,
        };

        this.propagateChanges();

        return response;
      }).catch((error) => {
        UserNotification.error(`加载事件失败: ${error}`,
          '加载事件失败');
      });

      EventDefinitionsActions.listPaginated.promise(promise);
    },

    get(eventDefinitionId) {
      const promise = fetch('GET', this.eventDefinitionsUrl({ segments: [eventDefinitionId, 'with-context'] }));

      promise.catch((error) => {
        if (error.status === 404) {
          UserNotification.error(`无法找到事件定义<${eventDefinitionId}>，请确认是否被删除。`,
            '无法找到事件定义');
        }
      });

      EventDefinitionsActions.get.promise(promise);
    },

    setAlertFlag(eventDefinition) {
      const isAlert = eventDefinition.notifications.length > 0;

      return { ...eventDefinition, alert: isAlert };
    },

    extractSchedulerInfo(eventDefinition) {
    // Removes the internal "_is_scheduled" field from the event definition data. We only use this to pass-through
    // the flag from the form.
      const clonedEventDefinition = lodash.cloneDeep(eventDefinition);
      const { _is_scheduled } = lodash.pick(clonedEventDefinition.config, ['_is_scheduled']);

      clonedEventDefinition.config = lodash.omit(clonedEventDefinition.config, ['_is_scheduled']);

      return { eventDefinition: clonedEventDefinition, isScheduled: lodash.defaultTo(_is_scheduled, true) };
    },

    create(newEventDefinition) {
      const { eventDefinition, isScheduled } = this.extractSchedulerInfo(newEventDefinition);
      const promise = fetch('POST', this.eventDefinitionsUrl({ query: { schedule: isScheduled } }), this.setAlertFlag(eventDefinition));

      promise.then(
        (response) => {
          UserNotification.success('事件定义创建成功',
            `事件定义"${eventDefinition.title}"创建成功。`);

          this.refresh();

          return response;
        },
        (error) => {
          if (error.status !== 400 || !error.additional.body || !error.additional.body.failed) {
            UserNotification.error(`创建事件定义"${eventDefinition.title}"失败：${error}`,
              '无法创建事件定义');
          }
        },
      );

      EventDefinitionsActions.create.promise(promise);
    },

    update(eventDefinitionId, updatedEventDefinition) {
      const { eventDefinition, isScheduled } = this.extractSchedulerInfo(updatedEventDefinition);
      const promise = fetch('PUT', this.eventDefinitionsUrl({ segments: [eventDefinitionId], query: { schedule: isScheduled } }), this.setAlertFlag(eventDefinition));

      promise.then(
        (response) => {
          UserNotification.success('事件定义更新成功',
            `事件定义"${eventDefinition.title}"更新成功。`);

          this.refresh();

          return response;
        },
        (error) => {
          if (error.status !== 400 || !error.additional.body || !error.additional.body.failed) {
            UserNotification.error(`更新事件定义"${eventDefinition.title}"失败：${error}`,
              '无法更新事件定义');
          }
        },
      );

      EventDefinitionsActions.update.promise(promise);
    },

    delete(eventDefinition) {
      const promise = fetch('DELETE', this.eventDefinitionsUrl({ segments: [eventDefinition.id] }));

      promise.then(
        () => {
          UserNotification.success('事件定义删除成功',
            `事件定义"${eventDefinition.title}"删除成功。`);

          this.refresh();
        },
        (error) => {
          UserNotification.error(`删除事件定义"${eventDefinition.title}"失败：${error}`,
            '无法删除事件定义');
        },
      );

      EventDefinitionsActions.delete.promise(promise);
    },

    enable(eventDefinition) {
      const promise = fetch('PUT', this.eventDefinitionsUrl({ segments: [eventDefinition.id, 'schedule'] }));

      promise.then(
        (response) => {
          UserNotification.success('事件定义成功启用',
            `事件定义"${eventDefinition.title}"已成功启用.`);

          this.refresh();

          return response;
        },
        (error) => {
          if (error.status !== 400 || !error.additional.body || !error.additional.body.failed) {
            UserNotification.error(`启用事件定义"${eventDefinition.title}"失败，状态为：${error}`,
              '无法启用事件定义');
          }
        },
      );

      EventDefinitionsActions.enable.promise(promise);
    },

    disable(eventDefinition) {
      const promise = fetch('PUT', this.eventDefinitionsUrl({ segments: [eventDefinition.id, 'unschedule'] }));

      promise.then(
        (response) => {
          UserNotification.success('事件定义已成功禁用',
            `事件定义"${eventDefinition.title}"已成功禁用.`);

          this.refresh();

          return response;
        },
        (error) => {
          if (error.status !== 400 || !error.additional.body || !error.additional.body.failed) {
            UserNotification.error(`禁用事件定义"${eventDefinition.title}"失败，状态为：${error}`,
              '无法禁用事件定义');
          }
        },
      );

      EventDefinitionsActions.disable.promise(promise);
    },

    clearNotificationQueue(eventDefinition) {
      const promise = fetch('PUT', this.eventDefinitionsUrl({ segments: [eventDefinition.id, 'clear-notification-queue'] }));

      promise.then(
        (response) => {
          UserNotification.success('已清除排队通知.',
            '已成功清除排队通知.');

          this.refresh();

          return response;
        },
        (error) => {
          if (error.status !== 400 || !error.additional.body || !error.additional.body.failed) {
            UserNotification.error(`清除排队通知失败并显示状态: ${error}`,
              '无法清除排队的通知');
          }
        },
      );

      EventDefinitionsActions.clearNotificationQueue.promise(promise);
    },
  }),
);
