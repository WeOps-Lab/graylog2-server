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
import MessageFormatter from 'logic/message/MessageFormatter';
import ApiRoutes from 'routing/ApiRoutes';
import * as URLUtils from 'util/URLUtils';
import UserNotification from 'util/UserNotification';
import StringUtils from 'util/StringUtils';
import { singletonStore, singletonActions } from 'logic/singleton';

export const MessagesActions = singletonActions(
  'core.Messages',
  () => Reflux.createActions({
    loadMessage: { asyncResult: true },
    fieldTerms: { asyncResult: true },
    loadRawMessage: { asyncResult: true },
  }),
);

export const MessagesStore = singletonStore(
  'core.Messages',
  () => Reflux.createStore({
    listenables: [MessagesActions],
    sourceUrl: '',

    getInitialState() {
      return {};
    },

    loadMessage(index, messageId) {
      const { url } = ApiRoutes.MessagesController.single(index.trim(), messageId.trim());
      const promise = fetch('GET', URLUtils.qualifyUrl(url))
        .then(
          (response) => MessageFormatter.formatResultMessage(response),
          (errorThrown) => {
            UserNotification.error(`加载消息失败: ${errorThrown}`,
              '无法加载消息');
          },
        );

      MessagesActions.loadMessage.promise(promise);
    },

    fieldTerms(index, string) {
      const { url } = ApiRoutes.MessagesController.analyze(index, encodeURIComponent(StringUtils.stringify(string)));
      const promise = fetch('GET', URLUtils.qualifyUrl(url))
        .then(
          (response) => response.tokens,
          (error) => {
            UserNotification.error(`加载词条失败: ${error}`,
              '无法加载词条.');
          },
        );

      MessagesActions.fieldTerms.promise(promise);
    },

    loadRawMessage(message, remoteAddress, codec, codecConfiguration) {
      const { url } = ApiRoutes.MessagesController.parse();
      const payload = {
        message: message,
        remote_address: remoteAddress,
        codec: codec,
        configuration: codecConfiguration,
      };

      const promise = fetch('POST', URLUtils.qualifyUrl(url), payload)
        .then(
          (response) => MessageFormatter.formatResultMessage(response),
          (error) => {
            if (error.additional && error.additional.status === 400) {
              UserNotification.error('请选择合适的编码器. ');

              return;
            }

            UserNotification.error(`加载原始消息失败: ${error}`,
              '无法加载原始消息');
          },
        );

      MessagesActions.loadRawMessage.promise(promise);
    },
  }),
);
