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
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { groupBy } from 'lodash';

import { Button } from 'components/bootstrap';
import { IfPermitted } from 'components/common';
import Spinner from 'components/common/Spinner';
import { DecoratorsActions } from 'stores/decorators/DecoratorsStore';
import type { Stream } from 'stores/streams/StreamsStore';
import { StreamsActions } from 'stores/streams/StreamsStore';
import UserNotification from 'util/UserNotification';
import DecoratorList from 'views/components/messagelist/decorators/DecoratorList';
import type { Decorator } from 'views/components/messagelist/decorators/Types';

import DecoratorsConfigUpdate from './decorators/DecoratorsConfigUpdate';
import StreamSelect, { DEFAULT_SEARCH_ID, DEFAULT_STREAM_ID } from './decorators/StreamSelect';
import DecoratorsUpdater from './decorators/DecoratorsUpdater';
import formatDecorator from './decorators/FormatDecorator';

import type BootstrapModalWrapper from '../bootstrap/BootstrapModalWrapper';

const DecoratorsConfig = () => {
  const [streams, setStreams] = useState<Array<Stream> | undefined>();
  const [currentStream, setCurrentStream] = useState(DEFAULT_STREAM_ID);
  const [decorators, setDecorators] = useState<Array<Decorator> | undefined>();
  const [types, setTypes] = useState();
  const configModal = useRef<BootstrapModalWrapper>();

  useEffect(() => { StreamsActions.listStreams().then(setStreams); }, [setStreams]);
  useEffect(() => { DecoratorsActions.available().then(setTypes); }, [setTypes]);
  useEffect(() => { DecoratorsActions.list().then(setDecorators); }, [setDecorators]);

  const openModal = useCallback(() => configModal.current && configModal.current.open(), [configModal]);
  const closeModal = useCallback(() => configModal.current && configModal.current.close(), [configModal]);

  if (!streams || !decorators || !types) {
    return <Spinner />;
  }

  const onSave = (newDecorators) => DecoratorsUpdater(newDecorators, decorators)
    .then(
      () => UserNotification.success('更新装饰器配置', '成功！'),
      (error) => UserNotification.error(`无法保存新的装饰器：${error}`, '保存装饰器失败'),
    )
    .then(DecoratorsActions.list)
    .then(setDecorators)
    .then(closeModal);

  const decoratorsGroupedByStream = groupBy(decorators, (decorator) => (decorator.stream || DEFAULT_SEARCH_ID));

  const currentDecorators = decoratorsGroupedByStream[currentStream] || [];
  const sortedDecorators = currentDecorators
    .sort((d1, d2) => d1.order - d2.order);
  const readOnlyDecoratorItems = sortedDecorators.map((decorator) => formatDecorator(decorator, currentDecorators, types));

  const streamOptions = streams.filter(({ id }) => Object.keys(decoratorsGroupedByStream).includes(id));

  return (
    <div>
      <h2>装饰器配置</h2>
      <p>选择要查看默认装饰器集的流。</p>
      <StreamSelect streams={streamOptions} onChange={setCurrentStream} value={currentStream} />
      <DecoratorList decorators={readOnlyDecoratorItems} disableDragging />
      <IfPermitted permissions="decorators:edit">
        <Button bsStyle="info" bsSize="xs" onClick={openModal}>更新</Button>
      </IfPermitted>
      <DecoratorsConfigUpdate ref={configModal}
                              streams={streams}
                              decorators={decorators}
                              onCancel={closeModal}
                              onSave={onSave}
                              types={types} />
    </div>
  );
};

DecoratorsConfig.propTypes = {};

export default DecoratorsConfig;
