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
import React from 'react';
import PropTypes from 'prop-types';
import { PluginStore } from 'graylog-web-plugin/plugin';
import lodash from 'lodash';

import {
  OverlayTrigger,
  Icon,
  Select,
} from 'components/common';
import {
  Button,
  ButtonToolbar,
  Col,
  ControlLabel,
  FormControl,
  FormGroup,
  HelpBlock,
  InputGroup,
  Input,
  Row,
} from 'components/bootstrap';
import EventKeyHelpPopover from 'components/event-definitions/common/EventKeyHelpPopover';
import * as FormsUtils from 'util/FormsUtils';

import commonStyles from '../common/commonStyles.css';

const requiredFields = [
  'fieldName',
  'config.providers[0].type',
];

class FieldForm extends React.Component {
  static propTypes = {
    fieldName: PropTypes.string,
    config: PropTypes.object,
    currentUser: PropTypes.object.isRequired,
    keys: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  };

  static defaultProps = {
    fieldName: '',
    config: {},
  };

  constructor(props) {
    super(props);
    const keyIndex = props.keys.indexOf(props.fieldName);

    this.state = {
      fieldName: props.fieldName,
      config: { data_type: 'string', providers: [], ...props.config },
      isKey: keyIndex >= 0,
      keyPosition: keyIndex >= 0 ? keyIndex + 1 : props.keys.length + 1,
      validation: { errors: {} },
    };
  }

  getProviderPlugin = (type) => {
    if (type === undefined) {
      return {};
    }

    return PluginStore.exports('fieldValueProviders').find((edt) => edt.type === type) || {};
  };

  getConfigProviderType = (config, defaultValue) => {
    return lodash.get(config, 'providers[0].type', defaultValue);
  };

  validate = () => {
    const { isKey, keyPosition, config } = this.state;
    const errors = {};

    const providerType = this.getConfigProviderType(config);
    let pluginRequiredFields = [];

    if (providerType) {
      const providerPlugin = this.getProviderPlugin(providerType);

      pluginRequiredFields = providerPlugin.requiredFields;
    }

    requiredFields.forEach((requiredField) => {
      if (!lodash.get(this.state, requiredField)) {
        errors[requiredField] = '字段不可为空.';
      }
    });

    if (isKey && (!lodash.isNumber(keyPosition) || Number(keyPosition) < 1)) {
      errors.key_position = '字段必须为数值.';
    }

    pluginRequiredFields.forEach((requiredField) => {
      if (!lodash.get(config, `providers[0].${requiredField}`)) {
        errors[requiredField] = '字段不可为空.';
      }
    });

    const errorNumber = Object.keys(errors).length;

    if (errorNumber > 0) {
      this.setState({ validation: { errors: errors } });
    }

    return errorNumber === 0;
  };

  handleSubmit = () => {
    if (this.validate()) {
      const { fieldName: prevFieldName, onChange } = this.props;
      const { fieldName, config, isKey, keyPosition } = this.state;

      onChange(prevFieldName, fieldName, config, isKey, keyPosition - 1);
    }
  };

  handleFieldNameChange = (event) => {
    const nextFieldName = FormsUtils.getValueFromInput(event.target);

    this.setState({ fieldName: nextFieldName });
  };

  handleConfigChange = (nextConfig) => {
    this.setState({ config: nextConfig });
  };

  handleProviderTypeChange = (nextProvider) => {
    const { config } = this.state;
    const providerPlugin = this.getProviderPlugin(nextProvider);
    const defaultProviderConfig = providerPlugin.defaultConfig || {};
    const nextConfig = {
      ...config,
      providers: [{
        ...defaultProviderConfig,
        type: nextProvider,
      }],
    };

    this.handleConfigChange(nextConfig);
  };

  handleKeySortChange = (event) => {
    const nextPosition = event.target.value === '' ? '' : FormsUtils.getValueFromInput(event.target);

    this.setState({ keyPosition: nextPosition });
  };

  toggleKey = (event) => {
    const checked = FormsUtils.getValueFromInput(event.target);

    this.setState({ isKey: checked });
  };

  renderFieldValueProviderForm = () => {
    const { fieldName, config, validation } = this.state;
    const { currentUser } = this.props;

    const providerType = this.getConfigProviderType(config);

    if (!providerType) {
      return null;
    }

    const providerPlugin = this.getProviderPlugin(providerType);

    return (providerPlugin.formComponent
      ? React.createElement(providerPlugin.formComponent, {
        fieldName: fieldName,
        config: config,
        onChange: this.handleConfigChange,
        validation: validation,
        currentUser: currentUser,
      })
      : <div>所选插件不可用.</div>
    );
  };

  formatFieldValueProviders = () => {
    return PluginStore.exports('fieldValueProviders')
      .map((type) => ({ label: type.displayName, value: type.type }));
  };

  render() {
    const { fieldName: prevFieldName, onCancel } = this.props;
    const { fieldName, isKey, keyPosition, config, validation } = this.state;

    return (
      <Row>
        <Col md={7} lg={6}>
          <h2 className={commonStyles.title}>
            {prevFieldName ? `自定义字段 "${fieldName}"` : '新的自定义字段'}
          </h2>

          <Input id="field-name"
                 name="name"
                 label="名称"
                 type="text"
                 value={fieldName}
                 onChange={this.handleFieldNameChange}
                 bsStyle={validation.errors.fieldName ? 'error' : null}
                 help={validation.errors.fieldName || '字段的名称.'}
                 required />

          <FormGroup validationState={validation.errors.key_position ? 'error' : null}>
            <ControlLabel>
              使用字段作为事件键&emsp;
              <OverlayTrigger placement="right"
                              trigger={['click', 'focus']}
                              overlay={<EventKeyHelpPopover id="key-popover" />}>
                <Button bsStyle="link" bsSize="xsmall"><Icon name="question-circle" /></Button>
              </OverlayTrigger>
            </ControlLabel>
            <InputGroup>
              <InputGroup.Addon>
                <input id="is-key" name="is-key" type="checkbox" onChange={this.toggleKey} checked={isKey} />
              </InputGroup.Addon>
              <FormControl id="field-key"
                           name="key"
                           type="number"
                           value={keyPosition}
                           onChange={this.handleKeySortChange}
                           disabled={!isKey} />
            </InputGroup>
            <HelpBlock>
              {validation.errors.key_position || '指示此字段是否应为键及其顺序.'}
            </HelpBlock>
          </FormGroup>

          <FormGroup>
            <ControlLabel>字段数据类型</ControlLabel>
            <FormControl.Static>字符串</FormControl.Static>
          </FormGroup>

          <FormGroup controlId="event-field-provider"
                     validationState={validation.errors['config.providers[0].type'] ? 'error' : null}>
            <ControlLabel>设置值</ControlLabel>
            <Select name="event-field-provider"
                    ignoreAccents={false}
                    placeholder="选择数据源"
                    onChange={this.handleProviderTypeChange}
                    options={this.formatFieldValueProviders()}
                    value={this.getConfigProviderType(config, '')}
                    matchProp="label"
                    required />
            <HelpBlock>
              {validation.errors['config.providers[0].type'] || '选择此字段的数据源.'}
            </HelpBlock>
          </FormGroup>
        </Col>

        <Col md={12}>
          {this.renderFieldValueProviderForm()}
        </Col>

        <Col md={12}>
          <ButtonToolbar>
            <Button bsStyle="primary" onClick={this.handleSubmit}>完成</Button>
            <Button onClick={onCancel}>取消</Button>
          </ButtonToolbar>
        </Col>
      </Row>
    );
  }
}

export default FieldForm;
