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
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import type * as Immutable from 'immutable';
import styled from 'styled-components';

import { Row, Col, Input } from 'components/bootstrap';
import AppConfig from 'util/AppConfig';
import InputDropdown from 'components/inputs/InputDropdown';
import UserNotification from 'util/UserNotification';
import type { Message } from 'views/components/messagelist/Types';
import useForwarderMessageLoaders from 'components/messageloaders/useForwarderMessageLoaders';
import { UniversalSearchStore } from 'stores/search/UniversalSearchStore';

import type { Input as InputType } from './Types';

const LoaderContainer = styled.div`
  margin-top: 5px;
`;

const Description = styled.p`
  margin-bottom: 0.5em;
`;

const StyledSelect = styled(Input)`
  width: 200px;
`;

type ServerInputSelectProps = {
  inputs: Immutable.Map<string, InputType>,
  onChange: (inputId: string) => void,
  selectedInputId: string | undefined,
  isLoading: boolean,
};

const ServerInputSelect = ({ selectedInputId, inputs, onChange, isLoading }: ServerInputSelectProps) => {
  return (
    <fieldset>
      <Description>
        {selectedInputId
          ? '单击“加载消息”以加载此输入在过去一小时内收到的最新消息。'
          : '从下面的列表中选择一个输入，然后单击“加载消息”以加载该输入在过去一小时内收到的最新消息。'}
      </Description>
      <InputDropdown inputs={inputs}
                     preselectedInputId={selectedInputId}
                     onLoadMessage={onChange}
                     title={isLoading ? '加载中...' : '加载消息'}
                     disabled={isLoading} />
    </fieldset>
  );
};

type ForwaderInputSelectProps = {
  onChange: (inputId: string) => void,
  selectedInputId: string | undefined,
  isLoading: boolean,
};

const ForwarderInputSelect = ({ selectedInputId, onChange, isLoading }: ForwaderInputSelectProps) => {
  const { ForwarderInputDropdown } = useForwarderMessageLoaders();

  return (
    <fieldset>
      <Description>
        从下面的列表中选择一个输入配置文件，然后选择一个然后选择一个输入并单击
        在“加载消息”上加载此输入在过去一小时内收到的最新消息。
      </Description>
      <Row>
        <Col md={8}>
          <ForwarderInputDropdown onLoadMessage={onChange}
                                  title={isLoading ? '加载中...' : '加载消息'}
                                  preselectedInputId={selectedInputId}
                                  loadButtonDisabled={isLoading} />
        </Col>
      </Row>
    </fieldset>
  );
};

type Props = {
  inputs?: Immutable.Map<string, InputType>,
  onMessageLoaded: (message?: Message) => void,
  selectedInputId?: string,
};

const RecentMessageLoader = ({ inputs, onMessageLoaded, selectedInputId }: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { ForwarderInputDropdown } = useForwarderMessageLoaders();

  const [selectedInputType, setSelectedInputType] = useState<'forwarder' | 'server'>(ForwarderInputDropdown ? undefined : 'server');
  const isCloud = AppConfig.isCloud();

  useEffect(() => {
    if (selectedInputId && inputs) {
      setSelectedInputType(inputs?.get(selectedInputId) ? 'server' : 'forwarder');
    }
  }, [inputs, selectedInputId]);

  const onClick = (inputId: string) => {
    const input = inputs && inputs.get(inputId);

    if (selectedInputType === 'server' && !input) {
      UserNotification.error(`选择的输入无效: ${inputId}`,
        `无法从无效输入加载消息 ${inputId}`);

      return;
    }

    setLoading(true);
    const promise = UniversalSearchStore.search('relative', `gl2_source_input:${inputId} OR gl2_source_radio_input:${inputId}`, { range: 3600 }, undefined, 1, undefined, undefined, undefined, false);

    promise.then((response) => {
      if (response.total_results > 0) {
        onMessageLoaded(response.messages[0]);
      } else {
        UserNotification.error('输入未返回最近的消息.');
        onMessageLoaded(undefined);
      }
    });

    promise.finally(() => setLoading(false));
  };

  if (isCloud) {
    return (
      <LoaderContainer>
        <ForwarderInputSelect selectedInputId={selectedInputId} onChange={onClick} isLoading={loading} />
      </LoaderContainer>
    );
  }

  return (
    <LoaderContainer>
      {ForwarderInputDropdown
        ? (
          <>
            <fieldset>
              <Description>
                选择要从中加载消息的输入类型。
              </Description>
              <StyledSelect id="inputTypeSelect"
                            aria-label="input type select"
                            type="select"
                            value={selectedInputType ?? 'placeholder'}
                            disabled={!!selectedInputId}
                            onChange={(e) => setSelectedInputType(e.target.value)}>
                <option value="placeholder" disabled>选择输入类型</option>
                <option value="server">服务器输入</option>
                <option value="forwarder">转发器输入</option>
              </StyledSelect>
            </fieldset>

            {selectedInputType === 'server' && (
              <ServerInputSelect selectedInputId={selectedInputId}
                                 inputs={inputs}
                                 onChange={onClick}
                                 isLoading={loading} />
            )}
            {selectedInputType === 'forwarder' && (
              <ForwarderInputSelect selectedInputId={selectedInputId} onChange={onClick} isLoading={loading} />
            )}
          </>
        ) : (
          <ServerInputSelect selectedInputId={selectedInputId} inputs={inputs} onChange={onClick} isLoading={loading} />
        )}
    </LoaderContainer>
  );
};

RecentMessageLoader.propTypes = {
  inputs: PropTypes.object,
  onMessageLoaded: PropTypes.func.isRequired,
  selectedInputId: PropTypes.string,
};

RecentMessageLoader.defaultProps = {
  inputs: undefined,
  selectedInputId: undefined,
};

export default RecentMessageLoader;
