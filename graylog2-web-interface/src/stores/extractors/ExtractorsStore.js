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
import Promise from 'bluebird';

import ApiRoutes from 'routing/ApiRoutes';
import fetch from 'logic/rest/FetchProvider';
import ExtractorUtils from 'util/ExtractorUtils';
import * as URLUtils from 'util/URLUtils';
import UserNotification from 'util/UserNotification';
import { singletonStore, singletonActions } from 'logic/singleton';

export const ExtractorsActions = singletonActions(
  'core.Extractors',
  () => Reflux.createActions({
    list: { asyncResult: true },
    get: { asyncResult: true },
    create: { asyncResult: true },
    save: { asyncResult: true },
    update: { asyncResult: true },
    delete: { asyncResult: true },
    order: { asyncResult: true },
    import: {},
  }),
);

function getExtractorDTO(extractor) {
  const converters = {};

  extractor.converters.forEach((converter) => {
    converters[converter.type] = converter.config;
  });

  const conditionValue = extractor.condition_type && extractor.condition_type !== 'none' ? extractor.condition_value : '';

  return {
    title: extractor.title,
    cut_or_copy: extractor.cursor_strategy || 'copy',
    source_field: extractor.source_field,
    target_field: extractor.target_field,
    extractor_type: extractor.type || extractor.extractor_type, // "extractor_type" needed for imports
    extractor_config: extractor.extractor_config,
    converters: converters,
    condition_type: extractor.condition_type || 'none',
    condition_value: conditionValue,
    order: extractor.order,
  };
}

export const ExtractorsStore = singletonStore(
  'core.Extractors',
  () => Reflux.createStore({
    listenables: [ExtractorsActions],
    sourceUrl: '/system/inputs/',
    extractors: undefined,
    extractor: undefined,

    init() {
      this.trigger({ extractors: this.extractors, extractor: this.extractor });
    },

    list(inputId) {
      const promise = fetch('GET', URLUtils.qualifyUrl(URLUtils.concatURLPath(this.sourceUrl, inputId, 'extractors')));

      promise.then((response) => {
        this.extractors = response.extractors;
        this.trigger({ extractors: this.extractors });
      });

      ExtractorsActions.list.promise(promise);
    },

    // Creates an basic extractor object that we can use to create new extractors.
    new(type, field) {
      if (ExtractorUtils.EXTRACTOR_TYPES.indexOf(type) === -1) {
        throw new Error(`不合法的提取器类型: ${type}`);
      }

      return {
        type: type,
        source_field: field,
        converters: [],
        extractor_config: {},
        target_field: '',
      };
    },

    get(inputId, extractorId) {
      const promise = fetch('GET', URLUtils.qualifyUrl(URLUtils.concatURLPath(this.sourceUrl, inputId, 'extractors', extractorId)));

      promise.then((response) => {
        this.extractor = response;
        this.trigger({ extractor: this.extractor });
      });

      ExtractorsActions.get.promise(promise);
    },

    save(inputId, extractor) {
      let promise;

      if (extractor.id) {
        promise = this.update(inputId, extractor, true);
      } else {
        promise = this.create(inputId, extractor, true);
      }

      ExtractorsActions.save.promise(promise);
    },

    _silentExtractorCreate(inputId, extractor) {
      const url = URLUtils.qualifyUrl(ApiRoutes.ExtractorsController.create(inputId).url);

      return fetch('POST', url, getExtractorDTO(extractor));
    },

    create(inputId, extractor, calledFromMethod) {
      const promise = this._silentExtractorCreate(inputId, extractor);

      promise
        .then(() => {
          UserNotification.success(`提取器 ${extractor.title} 创建成功`);

          if (this.extractor) {
            ExtractorsActions.get.triggerPromise(inputId, extractor.id);
          }
        })
        .catch((error) => {
          UserNotification.error(`提取器创建失败: ${error}`,
            '无法创建提取器');
        });

      if (!calledFromMethod) {
        ExtractorsActions.create.promise(promise);
      }

      return promise;
    },

    update(inputId, extractor, calledFromMethod) {
      const url = URLUtils.qualifyUrl(ApiRoutes.ExtractorsController.update(inputId, extractor.id).url);

      const promise = fetch('PUT', url, getExtractorDTO(extractor));

      promise
        .then(() => {
          UserNotification.success(`提取器 "${extractor.title}" 更新成功`);

          if (this.extractor) {
            ExtractorsActions.get.triggerPromise(inputId, extractor.id);
          }
        })
        .catch((error) => {
          UserNotification.error(`提取器更新失败: ${error}`,
            '无法更新提取器');
        });

      if (!calledFromMethod) {
        ExtractorsActions.update.promise(promise);
      }

      return promise;
    },

    delete(inputId, extractor) {
      const url = URLUtils.qualifyUrl(ApiRoutes.ExtractorsController.delete(inputId, extractor.id).url);

      const promise = fetch('DELETE', url);

      promise
        .then(() => {
          UserNotification.success(`提取器 "${extractor.title}" 删除成功`);

          if (this.extractors) {
            ExtractorsActions.list.triggerPromise(inputId);
          }
        })
        .catch((error) => {
          UserNotification.error(`删除提取器失败: ${error}`,
            `无法删除提取器 ${extractor.title}`);
        });

      ExtractorsActions.delete.promise(promise);
    },

    order(inputId, orderedExtractors) {
      const url = URLUtils.qualifyUrl(ApiRoutes.ExtractorsController.order(inputId).url);
      const orderedExtractorsMap = {};

      orderedExtractors.forEach((extractor, idx) => orderedExtractorsMap[idx] = extractor.id);

      const promise = fetch('POST', url, { order: orderedExtractorsMap });

      promise.then(() => {
        UserNotification.success('提取器位置更新成功');

        if (this.extractors) {
          ExtractorsActions.list.triggerPromise(inputId);
        }
      });

      promise.catch((error) => {
        UserNotification.error(`更新提取器位置失败: ${error}`,
          '更新提取器位置失败');
      });

      ExtractorsActions.order.promise(promise);
    },

    import(inputId, extractors) {
      let successfulImports = 0;
      let failedImports = 0;
      const promises = [];

      extractors.forEach((extractor) => {
        const promise = this._silentExtractorCreate(inputId, extractor);

        promise
          .then(() => successfulImports++)
          .catch(() => failedImports++);

        promises.push(promise);
      });

      Promise.settle(promises).then(() => {
        if (failedImports === 0) {
          UserNotification.success(`导入结果: ${successfulImports} 提取器成功被导入.`,
            '导入成功');
        } else {
          UserNotification.warning(`导入结果: ${successfulImports} 提取器成功被导入, ${failedImports} 导入失败.`,
            '导入成功');
        }
      });
    },
  }),
);
