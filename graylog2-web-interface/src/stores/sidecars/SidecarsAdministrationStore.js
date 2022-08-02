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

import * as URLUtils from 'util/URLUtils';
import UserNotification from 'util/UserNotification';
import { fetchPeriodically } from 'logic/rest/FetchProvider';
import { singletonStore, singletonActions } from 'logic/singleton';

export const SidecarsAdministrationActions = singletonActions(
  'core.SidecarsAdministration',
  () => Reflux.createActions({
    list: { asyncResult: true },
    refreshList: { asyncResult: true },
    setAction: { asyncResult: true },
  }),
);

export const SidecarsAdministrationStore = singletonStore(
  'core.SidecarsAdministration',
  () => Reflux.createStore({
    listenables: [SidecarsAdministrationActions],
    sourceUrl: '/sidecar',
    sidecars: undefined,
    filters: undefined,
    pagination: {
      count: undefined,
      page: undefined,
      pageSize: undefined,
      total: undefined,
    },
    query: undefined,

    propagateChanges() {
      this.trigger({
        sidecars: this.sidecars,
        filters: this.filters,
        query: this.query,
        pagination: this.pagination,
      });
    },

    list({ query = '', page = 1, pageSize = 50, filters }) {
      const body = {
        query: query,
        page: page,
        per_page: pageSize,
        filters: filters,
      };

      const promise = fetchPeriodically('POST', URLUtils.qualifyUrl(`${this.sourceUrl}/administration`), body);

      promise.then(
        (response) => {
          this.sidecars = response.sidecars;
          this.query = response.query;
          this.filters = response.filters;

          this.pagination = {
            total: response.pagination.total,
            count: response.pagination.count,
            page: response.pagination.page,
            pageSize: response.pagination.per_page,
          };

          this.propagateChanges();

          return response;
        },
        (error) => {
          UserNotification.error(error.status === 400 ? error.responseMessage : `获取客户端失败: ${error.message}`,
            '无法获取客户端');
        },
      );

      SidecarsAdministrationActions.list.promise(promise);
    },

    refreshList() {
      this.list({ query: this.query, page: this.pagination.page, pageSize: this.pagination.pageSize, filters: this.filters });
    },

    setAction(action, collectors) {
      const sidecarIds = Object.keys(collectors);
      const formattedCollectors = sidecarIds.map((sidecarId) => ({
        sidecar_id: sidecarId,
        collector_ids: collectors[sidecarId],
      }));
      const body = {
        action: action,
        collectors: formattedCollectors,
      };

      const promise = fetchPeriodically('PUT', URLUtils.qualifyUrl(`${this.sourceUrl}/administration/action`), body);
      let actionName = ''
      if (action === 'start') {
        actionName = '启动'
      } else if (action === 'restart') {
        actionName = '重启'
      } else {
        actionName = '暂停'
      }

      promise.then(
        (response) => {
          UserNotification.success('', `${actionName}${formattedCollectors.length}个客户端`);

          return response;
        },
        (error) => {
          UserNotification.error(`请求 ${action} 失败: ${error}`,
            `无法 ${action} 客户端`);
        },
      );

      SidecarsAdministrationActions.setAction.promise(promise);
    },
  }),
);
