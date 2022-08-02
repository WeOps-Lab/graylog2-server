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

import * as URLUtils from 'util/URLUtils';
import fetch from 'logic/rest/FetchProvider';
import UserNotification from 'util/UserNotification';
import { singletonStore, singletonActions } from 'logic/singleton';
import { InputStaticFieldsStore } from 'stores/inputs/InputStaticFieldsStore';

export const InputsActions = singletonActions(
  'core.Inputs',
  () => Reflux.createActions({
    list: { asyncResult: true },
    get: { asyncResult: true },
    getOptional: { asyncResult: true },
    create: { asyncResult: true },
    delete: { asyncResult: true },
    update: { asyncResult: true },
  }),
);

export const InputsStore = singletonStore(
  'core.Inputs',
  () => Reflux.createStore({
    listenables: [InputsActions],
    sourceUrl: '/system/inputs',
    inputs: undefined,
    input: undefined,

    init() {
      this.trigger(this._state());
      this.listenTo(InputStaticFieldsStore, this.list);
    },

    getInitialState() {
      return this._state();
    },

    _state() {
      return { inputs: this.inputs, input: this.input };
    },

    list() {
      const promise = fetch('GET', URLUtils.qualifyUrl(this.sourceUrl));

      promise
        .then(
          (response) => {
            this.inputs = response.inputs;
            this.trigger(this._state());

            return this.inputs;
          },
          (error) => {
            UserNotification.error(`获取数据接收失败: ${error}`,
              '无法获取数据接收');
          },
        );

      InputsActions.list.promise(promise);
    },

    get(inputId) {
      return this.getOptional(inputId, true);
    },

    getOptional(inputId, showError) {
      const promise = fetch('GET', URLUtils.qualifyUrl(`${this.sourceUrl}/${inputId}`));

      promise
        .then(
          (response) => {
            this.input = response;
            this.trigger(this._state());

            return this.input;
          },
          (error) => {
            if (showError) {
              UserNotification.error(`获取数据接收 ${inputId} 失败: ${error}`,
                '无法获取数据接收');
            } else {
              this.trigger(this._state());
            }
          },
        );

      InputsActions.get.promise(promise);
    },

    create(input) {
      const promise = fetch('POST', URLUtils.qualifyUrl(this.sourceUrl), input);

      promise
        .then(
          () => {
            UserNotification.success(`数据接收 '${input.title}' 启动成功`);
            InputsActions.list();
          },
          (error) => {
            UserNotification.error(`数据接收 '${input.title}' 启动失败: ${error}`,
              '无法启动数据接收');
          },
        );

      InputsActions.create.promise(promise);
    },

    delete(input) {
      const inputId = input.id;
      const inputTitle = input.title;

      const promise = fetch('DELETE', URLUtils.qualifyUrl(`${this.sourceUrl}/${inputId}`));

      promise
        .then(
          () => {
            UserNotification.success(`接收器 '${inputTitle}' 删除成功`);
            InputsActions.list();
          },
          (error) => {
            UserNotification.error(`接收器 '${inputTitle}' 删除失败: ${error}`,
              '无法删除接收器');
          },
        );

      InputsActions.delete.promise(promise);
    },

    update(id, input) {
      const promise = fetch('PUT', URLUtils.qualifyUrl(`${this.sourceUrl}/${id}`), input);

      promise
        .then(
          () => {
            UserNotification.success(`接收器 '${input.title}' 更新成功`);
            InputsActions.list();
          },
          (error) => {
            UserNotification.error(`接收器 '${input.title}' 更新失败: ${error}`,
              '无法更新接收器');
          },
        );

      InputsActions.update.promise(promise);
    },
  }),
);

InputsStore.inputsAsMap = (inputsList) => {
  const inputsMap = {};

  inputsList.forEach((input) => {
    inputsMap[input.id] = input;
  });

  return inputsMap;
};
