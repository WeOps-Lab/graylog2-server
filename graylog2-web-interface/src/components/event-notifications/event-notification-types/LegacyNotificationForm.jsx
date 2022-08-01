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
import lodash from 'lodash';

import { Alert, ControlLabel, FormGroup, HelpBlock } from 'components/bootstrap';
import { Select } from 'components/common';
import { ConfigurationFormField } from 'components/configurationforms';

import commonStyles from './LegacyNotificationCommonStyles.css';

class LegacyNotificationForm extends React.Component {
  static propTypes = {
    config: PropTypes.object.isRequired,
    validation: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    legacyTypes: PropTypes.object.isRequired,
  };

  static defaultConfig = {
    callback_type: '',
    configuration: {},
  };

  propagateMultiChange = (newValues) => {
    const { config, onChange } = this.props;
    const nextConfig = { ...config, ...newValues };

    onChange(nextConfig);
  };

  propagateChange = (key, value) => {
    const { config } = this.props;
    const nextConfiguration = { ...config.configuration, [key]: value };

    this.propagateMultiChange({ configuration: nextConfiguration });
  };

  formatLegacyTypes = (legacyTypes) => {
    return Object.keys(legacyTypes)
      .map((typeName) => ({ label: `回调 ${legacyTypes[typeName].name}`, value: typeName }));
  };

  getDefaultConfiguration = (legacyNotificationType) => {
    const { legacyTypes } = this.props;
    const { configuration } = legacyTypes[legacyNotificationType];
    const defaultConfiguration = {};

    Object.keys(configuration).forEach((configKey) => {
      defaultConfiguration[configKey] = configuration[configKey].default_value;
    });

    return defaultConfiguration;
  };

  handleSelectNotificationChange = (nextLegacyNotificationType) => {
    this.propagateMultiChange({
      callback_type: nextLegacyNotificationType,
      configuration: this.getDefaultConfiguration(nextLegacyNotificationType),
    });
  };

  handleFormFieldChange = (key, value) => {
    this.propagateChange(key, value);
  };

  renderNotificationForm(config, legacyType) {
    const { configuration } = legacyType;

    const configFields = Object.keys(configuration).map((configKey) => {
      const configField = configuration[configKey];
      const configValue = config.configuration[configKey];

      return (
        <ConfigurationFormField key={configKey}
                                typeName={config.callback_type}
                                configField={configField}
                                configKey={configKey}
                                configValue={configValue}
                                onChange={this.handleFormFieldChange} />
      );
    });

    return (
      <fieldset>
        {configFields}
      </fieldset>
    );
  }

  render() {
    const { config, legacyTypes, validation } = this.props;
    const callbackType = config.callback_type;
    const typeData = legacyTypes[callbackType];

    let content;

    if (typeData) {
      content = this.renderNotificationForm(config, typeData);
    } else if (callbackType) {
      content = (
        <Alert bsStyle="danger" className={commonStyles.legacyNotificationAlert}>
          未知的告警回调类型: <strong>{callbackType}</strong> 请确定已经安装对应的插件.
        </Alert>
      );
    }

    return (
      <>
        <fieldset>
          <FormGroup controlId="notification-legacy-select"
                     validationState={validation.errors.callback_type ? 'error' : null}>
            <ControlLabel>选择旧版告警回调</ControlLabel>
            <Select id="notification-legacy-select"
                    matchProp="label"
                    placeholder="选择旧版告警回调"
                    onChange={this.handleSelectNotificationChange}
                    options={this.formatLegacyTypes(legacyTypes)}
                    value={callbackType} />
            <HelpBlock>
              {lodash.get(validation, 'errors.callback_type[0]', '选择用于此事件定义的旧版告警回调.')}
            </HelpBlock>
          </FormGroup>
        </fieldset>

        <Alert bsStyle="danger" className={commonStyles.legacyNotificationAlert}>
          旧版告警回调已弃用.请尽快切换到新的通知类型!
        </Alert>

        {content}
      </>
    );
  }
}

export default LegacyNotificationForm;
