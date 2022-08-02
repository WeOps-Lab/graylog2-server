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
import fetch from 'logic/rest/FetchProvider';
import { singletonStore, singletonActions } from 'logic/singleton';

export const ConfigurationVariableActions = singletonActions(
  'core.ConfigurationVariable',
  () => Reflux.createActions({
    all: { asyncResult: true },
    save: { asyncResult: true },
    delete: { asyncResult: true },
    validate: { asyncResult: true },
    getConfigurations: { asyncResult: true },
  }),
);

export const ConfigurationVariableStore = singletonStore(
  'core.ConfigurationVariable',
  () => Reflux.createStore({
    listenables: [ConfigurationVariableActions],
    sourceUrl: '/sidecar/configuration_variables',

    all() {
      const promise = fetch('GET', URLUtils.qualifyUrl(this.sourceUrl));

      promise
        .catch(
          (error) => {
            UserNotification.error(`获取配置变量失败: ${error}`,
              '无法获取配置变量');
          },
        );

      ConfigurationVariableActions.all.promise(promise);
    },

    save(configurationVariable) {
      const request = {
        id: configurationVariable.id,
        name: configurationVariable.name,
        description: configurationVariable.description,
        content: configurationVariable.content,
      };

      let url = URLUtils.qualifyUrl(`${this.sourceUrl}`);
      let method;
      let action;

      if (configurationVariable.id === '') {
        method = 'POST';
        action = 'created';
      } else {
        url += `/${configurationVariable.id}`;
        method = 'PUT';
        action = 'updated';
      }

      const promise = fetch(method, url, request);

      promise
        .then(() => {
          UserNotification.success(`配置变量 "${configurationVariable.name}" 成功 ${action}`);
        }, (error) => {
          UserNotification.error(`保存变量 "${configurationVariable.name}" 失败: ${error.message}`,
            '无法保存变量');
        });

      ConfigurationVariableActions.save.promise(promise);
    },

    getConfigurations(configurationVariable) {
      const url = URLUtils.qualifyUrl(`${this.sourceUrl}/${configurationVariable.id}/configurations`);
      const promise = fetch('GET', url);

      promise.catch(
        (error) => {
          UserNotification.error(`获取配置变量失败: ${error}`);
        },
      );

      ConfigurationVariableActions.getConfigurations.promise(promise);
    },

    delete(configurationVariable) {
      const url = URLUtils.qualifyUrl(`${this.sourceUrl}/${configurationVariable.id}`);
      const promise = fetch('DELETE', url);

      promise
        .then(() => {
          UserNotification.success(`配置变量 "${configurationVariable.name}" 删除成功`);
        }, (error) => {
          UserNotification.error(`无法删除 "${configurationVariable.name}" 变量: ${error.message}`,
            '无法删除变量');
        });

      ConfigurationVariableActions.delete.promise(promise);
    },

    validate(configurationVariable) {
    // set minimum api defaults for faster validation feedback
      const payload = {
        id: ' ',
        name: ' ',
        content: ' ',
      };

      lodash.merge(payload, configurationVariable);

      const promise = fetch('POST', URLUtils.qualifyUrl(`${this.sourceUrl}/validate`), payload);

      promise.catch(
        (error) => {
          UserNotification.error(`校验变量 "${configurationVariable.name}" 失败: ${error.message}`,
            '无法校验变量');
        },
      );

      ConfigurationVariableActions.validate.promise(promise);
    },

  }),
);
