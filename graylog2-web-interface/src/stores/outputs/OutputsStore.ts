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

import fetch from 'logic/rest/FetchProvider';
import ApiRoutes from 'routing/ApiRoutes';
import * as URLUtils from 'util/URLUtils';
import UserNotification from 'util/UserNotification';
import { singletonStore } from 'logic/singleton';

type Output = {
  id: string,
  title: string,
  type: string,
};

// eslint-disable-next-line import/prefer-default-export
export const OutputsStore = singletonStore(
  'core.Outputs',
  () => Reflux.createStore({
    OUTPUTS_URL: URLUtils.qualifyUrl(ApiRoutes.OutputsApiController.index().url),

    load(callback: (outputs: Array<Output>) => void) {
      fetch('GET', this.OUTPUTS_URL)
        .then(callback, this._failCallback);
    },
    loadForStreamId(streamId: string, callback: (outputs: Array<Output>) => void) {
      const url = URLUtils.qualifyUrl(ApiRoutes.StreamOutputsApiController.index(streamId).url);

      fetch('GET', url)
        .then(callback, this._failCallback);
    },
    loadAvailableTypes(callback: (available: any) => void) {
      const url = URLUtils.qualifyUrl(ApiRoutes.OutputsApiController.availableTypes().url);

      fetch('GET', url)
        .then(callback, this._failCallback);
    },
    loadAvailable(typeName: string, callback: (available: any) => void) {
      const url = URLUtils.qualifyUrl(ApiRoutes.OutputsApiController.availableTypes().url);

      fetch('GET', url)
        .then((resp) => {
          return resp.types[typeName];
        }, this._failCallback)
        .then(callback);
    },
    remove(outputId: string, callback: (error: any) => void) {
      const url = URLUtils.qualifyUrl(ApiRoutes.OutputsApiController.delete(outputId).url);

      fetch('DELETE', url)
        .then(callback, (error) => {
          UserNotification.error(`停止输出失败: ${error}`,
            '无法停止输出');
        });
    },
    save(output: any, callback: (output: Output) => void) {
      const failCallback = (error) => {
        UserNotification.error(`保存输出 "${output.title}" 失败: ${error}`,
          '无法保存输出');
      };

      const url = URLUtils.qualifyUrl(ApiRoutes.OutputsApiController.create().url);

      fetch('POST', url, output)
        .then(callback, failCallback);
    },
    update(output: Output, deltas: any, callback: (output: Output) => void) {
      const failCallback = (error) => {
        UserNotification.error(`更新输出 "${output.title}" 失败: ${error}`,
          '无法更新输出');
      };

      const url = URLUtils.qualifyUrl(ApiRoutes.OutputsApiController.update(output.id).url);

      fetch('PUT', url, deltas)
        .then(callback, failCallback);
    },
    _failCallback(error: string) {
      UserNotification.error(`加载输出失败: ${error}`,
        '无法加载输出');
    },
  }),
);
