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

export const CollectorConfigurationsActions = singletonActions(
  'core.CollectorConfigurations',
  () => Reflux.createActions({
    all: { asyncResult: true },
    list: { asyncResult: true },
    listUploads: { asyncResult: true },
    getConfiguration: { asyncResult: true },
    getConfigurationSidecars: { asyncResult: true },
    getUploads: { asyncResult: true },
    createConfiguration: { asyncResult: true },
    updateConfiguration: { asyncResult: true },
    renderPreview: { asyncResult: true },
    copyConfiguration: { asyncResult: true },
    delete: { asyncResult: true },
    validate: { asyncResult: true },
  }),
);

export const CollectorConfigurationsStore = singletonStore(
  'core.CollectorConfigurations',
  () => Reflux.createStore({
    listenables: [CollectorConfigurationsActions],
    sourceUrl: '/sidecar',
    configurations: undefined,
    pagination: {
      page: undefined,
      pageSize: undefined,
      total: undefined,
    },
    total: undefined,
    paginatedConfigurations: undefined,
    query: undefined,

    propagateChanges() {
      this.trigger({
        configurations: this.configurations,
        query: this.query,
        total: this.total,
        pagination: this.pagination,
        paginatedConfigurations: this.paginatedConfigurations,
      });
    },

    _fetchConfigurations({ query, page, pageSize }) {
      const baseUrl = `${this.sourceUrl}/configurations`;
      const search = {
        query: query,
        page: page,
        per_page: pageSize,
      };

      const uri = URI(baseUrl).search(search).toString();

      return fetch('GET', URLUtils.qualifyUrl(uri));
    },

    _fetchUploads({ page }) {
      const baseUrl = `${this.sourceUrl}/configurations/uploads`;
      const search = {
        page: page,
      };

      const uri = URI(baseUrl).search(search).toString();

      return fetch('GET', URLUtils.qualifyUrl(uri));
    },

    all() {
      const promise = this._fetchConfigurations({ pageSize: 0 });

      promise
        .then(
          (response) => {
            this.configurations = response.configurations;
            this.propagateChanges();

            return response.configurations;
          },
          (error) => {
            UserNotification.error(`加载采集器配置失败: ${error}`,
              '无法加载采集器配置');
          },
        );

      CollectorConfigurationsActions.all.promise(promise);
    },

    list({ query = '', page = 1, pageSize = 10 }) {
      const promise = this._fetchConfigurations({ query: query, page: page, pageSize: pageSize });

      promise
        .then(
          (response) => {
            this.query = response.query;

            this.pagination = {
              page: response.pagination.page,
              pageSize: response.pagination.per_page,
              total: response.pagination.total,
            };

            this.total = response.total;
            this.paginatedConfigurations = response.configurations;
            this.propagateChanges();

            return response.configurations;
          },
          (error) => {
            UserNotification.error(`加载采集器配置失败: ${error}`,
              '无法加载采集器配置');
          },
        );

      CollectorConfigurationsActions.list.promise(promise);
    },

    listUploads({ page = 1 }) {
      const promise = this._fetchUploads({ page: page });

      promise
        .catch(
          (error) => {
            UserNotification.error(`加载采集器配置失败: ${error}`,
              '无法加载采集器配置');
          },
        );

      CollectorConfigurationsActions.listUploads.promise(promise);
    },

    refreshList() {
      this.list({ query: this.query, page: this.page, pageSize: this.pageSize });
    },

    getConfiguration(configurationId) {
      const promise = fetch('GET', URLUtils.qualifyUrl(`${this.sourceUrl}/configurations/${configurationId}`));

      promise.catch((error) => {
        let errorMessage = `加载采集器配置失败: ${error}`;

        if (error.status === 404) {
          errorMessage = `无法加载采集器配置 <${configurationId}>.`;
        }

        UserNotification.error(errorMessage, '无法加载采集器配置');
      });

      CollectorConfigurationsActions.getConfiguration.promise(promise);
    },

    getConfigurationSidecars(configurationId) {
      const promise = fetch('GET', URLUtils.qualifyUrl(`${this.sourceUrl}/configurations/${configurationId}/sidecars`));

      promise.catch((error) => {
        let errorMessage = `加载采集器配置失败: ${error}`;

        if (error.status === 404) {
          errorMessage = `无法找到采集器配置<${configurationId}>.`;
        }

        UserNotification.error(errorMessage, '无法加载采集器配置');
      });

      CollectorConfigurationsActions.getConfigurationSidecars.promise(promise);
    },

    renderPreview(template) {
      const requestTemplate = {
        template: template,
      };

      const promise = fetch(
        'POST',
        URLUtils.qualifyUrl(`${this.sourceUrl}/configurations/render/preview`),
        requestTemplate,
      );

      promise
        .catch(
          (error) => {
            UserNotification.error(`无法加载采集器预览: ${error}`,
              '加载采集器预览失败');
          },
        );

      CollectorConfigurationsActions.renderPreview.promise(promise);
    },

    createConfiguration(configuration) {
      const url = URLUtils.qualifyUrl(`${this.sourceUrl}/configurations`);
      const method = 'POST';

      const promise = fetch(method, url, configuration);

      promise
        .then((response) => {
          UserNotification.success('', '配置更新成功');

          return response;
        }, (error) => {
          UserNotification.error(error.status === 400 ? error.responseMessage : `配置更新失败: ${error.message}`,
            '无法更新配置');
        });

      CollectorConfigurationsActions.createConfiguration.promise(promise);
    },

    updateConfiguration(configuration) {
      const url = URLUtils.qualifyUrl(`${this.sourceUrl}/configurations/${configuration.id}`);

      const promise = fetch('PUT', url, configuration);

      promise
        .then((response) => {
          UserNotification.success('', '配置更新成功');
          this.refreshList();

          return response;
        }, (error) => {
          UserNotification.error(`配置更新失败: ${error.status === 400 ? error.responseMessage : error.message}`,
            `无法更新配置 ${configuration.name}`);
        });

      CollectorConfigurationsActions.updateConfiguration.promise(promise);
    },

    copyConfiguration(configurationId, name) {
      const url = URLUtils.qualifyUrl(`${this.sourceUrl}/configurations/${configurationId}/${name}`);
      const method = 'POST';

      const promise = fetch(method, url);

      promise
        .then((response) => {
          UserNotification.success('', `配置 "${name}" 复制成功`);
          this.refreshList();

          return response;
        }, (error) => {
          UserNotification.error(`保存配置 "${name}" 失败: ${error.message}`,
            '无法保存配置');
        });

      CollectorConfigurationsActions.copyConfiguration.promise(promise);
    },

    delete(configuration) {
      const url = URLUtils.qualifyUrl(`${this.sourceUrl}/configurations/${configuration.id}`);
      const promise = fetch('DELETE', url);

      promise
        .then((response) => {
          UserNotification.success('', `配置 "${configuration.name}" 删除成功`);
          this.refreshList();

          return response;
        }, (error) => {
          UserNotification.error(`配置删除失败: ${error.status === 400 ? error.responseMessage : error.message}`,
            `无法删除配置 ${configuration.name}`);
        });

      CollectorConfigurationsActions.delete.promise(promise);
    },

    validate(configuration) {
    // set minimum api defaults for faster validation feedback
      const payload = {
        name: ' ',
        collector_id: ' ',
        color: ' ',
        template: ' ',
      };

      lodash.merge(payload, configuration);

      const promise = fetch('POST', URLUtils.qualifyUrl(`${this.sourceUrl}/configurations/validate`), payload);

      promise
        .then(
          (response) => response,
          (error) => (
            UserNotification.error(`校验配置 "${payload.name}" 失败: ${error.message}`,
              '无法校验配置')
          ),
        );

      CollectorConfigurationsActions.validate.promise(promise);
    },

  }),
);
