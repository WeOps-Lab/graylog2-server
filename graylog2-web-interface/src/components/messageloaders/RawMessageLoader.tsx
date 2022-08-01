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
import * as Immutable from 'immutable';
import type { Subtract } from 'utility-types';

import { getValueFromInput } from 'util/FormsUtils';
import { Select } from 'components/common';
import { Col, Row, Button, Input } from 'components/bootstrap';
import { BooleanField, DropdownField, NumberField, TextField } from 'components/configurationforms';
import connect from 'stores/connect';
import type { Message } from 'views/components/messagelist/Types';
import useForwarderMessageLoaders from 'components/messageloaders/useForwarderMessageLoaders';
import AppConfig from 'util/AppConfig';
import { CodecTypesStore, CodecTypesActions } from 'stores/codecs/CodecTypesStore';
import { InputsActions, InputsStore } from 'stores/inputs/InputsStore';
import { MessagesActions } from 'stores/messages/MessagesStore';

import type { Input as InputType, CodecTypes } from './Types';

const DEFAULT_REMOTE_ADDRESS = '127.0.0.1';

type InputSelectProps = {
  inputs: Immutable.Map<string, InputType>,
  selectedInputId: string | undefined,
  onInputSelect: (selectedInputId: string) => void,
  show: boolean,
};

const ServerInputSelect = ({ inputs, selectedInputId, onInputSelect }: Subtract<InputSelectProps, {show}>) => {
  const _formatInputSelectOptions = () => {
    if (!inputs) {
      return [{ value: 'none', label: '输入加载中...', disabled: true }];
    }

    if (inputs.size === 0) {
      return [{ value: 'none', label: '没有可用的输入' }];
    }

    const formattedInputs = [];

    inputs
      .sort((inputA, inputB) => inputA.title.toLowerCase().localeCompare(inputB.title.toLowerCase()))
      .forEach((input, id) => {
        const label = `${id} / ${input.title} / ${input.name}`;

        formattedInputs.push({ value: id, label: label });
      });

    return formattedInputs;
  };

  return (
    <Input id="inputSelect"
           name="inputSelect"
           label={<>消息输入 <small>(可选)</small></>}
           help="选择应分配给已解析消息的消息输入 ID.">
      <Select inputId="inputSelect"
              name="inputSelect"
              aria-label="Message input"
              placeholder="选择输入"
              options={_formatInputSelectOptions()}
              matchProp="label"
              onChange={onInputSelect}
              value={selectedInputId} />
    </Input>
  );
};

const ForwarderInputSelect = ({ onInputSelect }: Pick<InputSelectProps, 'onInputSelect'>) => {
  const { ForwarderInputDropdown } = useForwarderMessageLoaders();

  return (
    <>
      <ForwarderInputDropdown onLoadMessage={onInputSelect}
                              label="转发器输入选择（可选）"
                              autoLoadMessage />
      <p className="description">从下面的列表中选择一个输入配置文件，然后选择一个然后选择一个输入.</p>
    </>
  );
};

const InputSelect = ({ inputs, selectedInputId, onInputSelect, show }: InputSelectProps) => {
  const { ForwarderInputDropdown } = useForwarderMessageLoaders();
  const [selectedInputType, setSelectedInputType] = useState<'server' | 'forwarder' | undefined>();

  if (!show) {
    return null;
  }

  if (AppConfig.isCloud()) {
    return <ForwarderInputSelect onInputSelect={onInputSelect} />;
  }

  return ForwarderInputDropdown ? (
    <fieldset>
      <legend>输入选择（可选）</legend>
      <Input id="inputTypeSelect"
             type="select"
             label="选择输入类型（可选）"
             help="选择要从中加载消息的输入类型."
             value={selectedInputType ?? 'placeholder'}
             onChange={(e) => setSelectedInputType(e.target.value)}>
        <option value="placeholder" disabled>选择输入类型</option>
        <option value="server">服务器输入</option>
        <option value="forwarder">转发器输入</option>
      </Input>

      {selectedInputType === 'server' && (
        <ServerInputSelect inputs={inputs} selectedInputId={selectedInputId} onInputSelect={onInputSelect} />
      )}
      {selectedInputType === 'forwarder' && (
        <ForwarderInputSelect onInputSelect={onInputSelect} />
      )}
    </fieldset>
  ) : (
    <ServerInputSelect inputs={inputs} selectedInputId={selectedInputId} onInputSelect={onInputSelect} />
  );
};

type OptionsType = {
  message: string,
  remoteAddress: string,
  codec: string,
  codecConfiguration: {
    [key: string]: string,
  },
  inputId?: string,
};

type Props = {
  inputs?: Immutable.Map<string, InputType>,
  codecTypes: CodecTypes,
  onMessageLoaded: (message: Message | undefined, option: OptionsType) => void,
  inputIdSelector?: boolean,
};

const RawMessageLoader = ({ onMessageLoaded, inputIdSelector, codecTypes, inputs }: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [remoteAddress, setRemoteAddress] = useState<string>(DEFAULT_REMOTE_ADDRESS);
  const [codec, setCodec] = useState<string>('');
  const [codecConfiguration, setCodecConfiguration] = useState({});
  const [inputId, setInputId] = useState<string | typeof undefined>();

  useEffect(() => {
    CodecTypesActions.list();
  }, []);

  useEffect(() => {
    if (inputIdSelector) {
      InputsActions.list();
    }
  }, [inputIdSelector]);

  const _loadMessage = (event: React.SyntheticEvent) => {
    event.preventDefault();

    setLoading(true);
    const promise = MessagesActions.loadRawMessage(message, remoteAddress, codec, codecConfiguration);

    promise.then((loadedMessage) => {
      onMessageLoaded(
        loadedMessage,
        {
          message: message,
          remoteAddress: remoteAddress,
          codec: codec,
          codecConfiguration: codecConfiguration,
          inputId: inputId,
        },
      );
    });

    promise.finally(() => setLoading(false));
  };

  const _formatSelectOptions = () => {
    if (!codecTypes) {
      return [{ value: 'none', label: '加载编解码器类型...', disabled: true }];
    }

    const codecTypesIds = Object.keys(codecTypes);

    if (codecTypesIds.length === 0) {
      return [{ value: 'none', label: '没有可用的编解码器' }];
    }

    return codecTypesIds
      .filter((id) => id !== 'random-http-msg') // Skip Random HTTP codec, as nobody wants to enter a raw random message.
      .map((id) => {
        const { name } = codecTypes[id];

        // Add id as label on codecs not having a descriptor name
        return { value: id, label: name === '' ? id : name };
      })
      .sort((codecA, codecB) => codecA.label.toLowerCase().localeCompare(codecB.label.toLowerCase()));
  };

  const _onCodecSelect = (selectedCodec: string) => {
    setCodec(selectedCodec);
    setCodecConfiguration({});
  };

  const _onInputSelect = (selectedInput: string) => {
    setInputId(selectedInput);
  };

  const _onMessageChange = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    setMessage(getValueFromInput(event.target));
  };

  const _onRemoteAddressChange = (event: React.SyntheticEvent<HTMLSelectElement>) => {
    setRemoteAddress(getValueFromInput(event.target));
  };

  const _onCodecConfigurationChange = (field: string, value: string) => {
    const newConfiguration = { ...codecConfiguration, [field]: value };
    setCodecConfiguration(newConfiguration);
  };

  const _formatConfigField = (key: string, configField) => {
    const value = codecConfiguration[key];
    const typeName = 'RawMessageLoader';
    const elementKey = `${typeName}-${key}`;

    switch (configField.type) {
      case 'text':
        return (
          <TextField key={elementKey}
                     typeName={typeName}
                     title={key}
                     field={configField}
                     value={value}
                     onChange={_onCodecConfigurationChange} />
        );
      case 'number':
        return (
          <NumberField key={elementKey}
                       typeName={typeName}
                       title={key}
                       field={configField}
                       value={value}
                       onChange={_onCodecConfigurationChange} />
        );
      case 'boolean':
        return (
          <BooleanField key={elementKey}
                        typeName={typeName}
                        title={key}
                        field={configField}
                        value={value}
                        onChange={_onCodecConfigurationChange} />
        );
      case 'dropdown':
        return (
          <DropdownField key={elementKey}
                         typeName={typeName}
                         title={key}
                         field={configField}
                         value={value}
                         onChange={_onCodecConfigurationChange} />
        );
      default:
        return null;
    }
  };

  const _isSubmitDisabled = !message || !codec || loading;

  let codecConfigurationOptions;

  if (codecTypes && codec) {
    const currentCodecConfiguration = codecTypes[codec].requested_configuration;

    codecConfigurationOptions = Object.keys(currentCodecConfiguration)
      .sort((keyA, keyB) => currentCodecConfiguration[keyA].is_optional - currentCodecConfiguration[keyB].is_optional)
      .map((key) => _formatConfigField(key, currentCodecConfiguration[key]));
  }

  return (
    <Row>
      <Col md={7}>
        <form onSubmit={_loadMessage}>
          <fieldset>
            <Input id="message"
                   name="message"
                   type="textarea"
                   label="原始消息"
                   value={message}
                   onChange={_onMessageChange}
                   rows={3}
                   required />
            <Input id="remoteAddress"
                   name="remoteAddress"
                   type="text"
                   label={<span>源 IP 地址<small>（可选）</small></span>}
                   help={`用作消息源的远程IP地址。 DataInsight 默认使用 ${DEFAULT_REMOTE_ADDRESS}。`}
                   value={remoteAddress}
                   onChange={_onRemoteAddressChange} />
          </fieldset>
          <InputSelect inputs={inputs}
                       selectedInputId={inputId}
                       onInputSelect={_onInputSelect}
                       show={inputIdSelector} />
          <fieldset>
            <legend>Codec configuration</legend>
            <Input id="codec"
                   name="codec"
                   label="消息编解码器"
                   help="选择应该用于解码消息的编解码器。"
                   required>
              <Select id="codec"
                      aria-label="Message codec"
                      placeholder="选择编解码器"
                      options={_formatSelectOptions()}
                      matchProp="label"
                      onChange={_onCodecSelect}
                      value={codec} />
            </Input>
            {codecConfigurationOptions}
          </fieldset>
          <Button type="submit" bsStyle="info" disabled={_isSubmitDisabled}>
            {loading ? '加载中...' : '加载消息'}
          </Button>
        </form>
      </Col>
    </Row>
  );
};

RawMessageLoader.propTypes = {
  onMessageLoaded: PropTypes.func.isRequired,
  inputIdSelector: PropTypes.bool,
  codecTypes: PropTypes.object,
  inputs: PropTypes.object,
};

RawMessageLoader.defaultProps = {
  inputIdSelector: false,
  codecTypes: undefined,
  inputs: undefined,
};

export default connect(
  // @ts-ignore
  RawMessageLoader,
  { inputs: InputsStore, codecTypes: CodecTypesStore },
  // @ts-ignore
  ({ inputs: { inputs }, codecTypes: { codecTypes } }) => ({ inputs: (inputs ? Immutable.Map(InputsStore.inputsAsMap(inputs)) : undefined), codecTypes }),
);
