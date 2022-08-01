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
import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';

import { Button, BootstrapModalForm, Input } from 'components/bootstrap';
import { IfPermitted, ISODurationInput } from 'components/common';
import ObjectUtils from 'util/ObjectUtils';
import ISODurationUtils from 'util/ISODurationUtils';
import FormUtils from 'util/FormsUtils';
import StringUtils from 'util/StringUtils';

const SidecarConfig = createReactClass({
  displayName: 'SidecarConfig',

  propTypes: {
    config: PropTypes.shape({
      sidecar_expiration_threshold: PropTypes.string,
      sidecar_inactive_threshold: PropTypes.string,
      sidecar_update_interval: PropTypes.string,
      sidecar_send_status: PropTypes.bool,
      sidecar_configuration_override: PropTypes.bool,
    }),
    updateConfig: PropTypes.func.isRequired,
  },

  getDefaultProps() {
    return {
      config: {
        sidecar_expiration_threshold: 'P14D',
        sidecar_inactive_threshold: 'PT1M',
        sidecar_update_interval: 'PT30S',
        sidecar_send_status: true,
        sidecar_configuration_override: false,
      },
    };
  },

  getInitialState() {
    return {
      config: ObjectUtils.clone(this.props.config),
    };
  },

  UNSAFE_componentWillReceiveProps(newProps) {
    this.setState({ config: ObjectUtils.clone(newProps.config) });
  },

  _openModal() {
    this.refs.configModal.open();
  },

  _closeModal() {
    this.refs.configModal.close();
  },

  _resetConfig() {
    // Reset to initial state when the modal is closed without saving.
    this.setState(this.getInitialState());
  },

  _saveConfig() {
    this.props.updateConfig(this.state.config).then(() => {
      this._closeModal();
    });
  },

  _onUpdate(field) {
    return (value) => {
      const update = ObjectUtils.clone(this.state.config);

      if (typeof value === 'object') {
        update[field] = FormUtils.getValueFromInput(value.target);
      } else {
        update[field] = value;
      }

      this.setState({ config: update });
    };
  },

  _inactiveThresholdValidator(milliseconds) {
    return milliseconds >= 1000;
  },

  _expirationThresholdValidator(milliseconds) {
    return milliseconds >= 60 * 1000;
  },

  _updateIntervalValidator(milliseconds) {
    const inactiveMilliseconds = this._durationMilliseconds(this.state.config.sidecar_inactive_threshold);
    const expirationMilliseconds = this._durationMilliseconds(this.state.config.sidecar_expiration_threshold);

    return milliseconds >= 1000 && milliseconds < inactiveMilliseconds && milliseconds < expirationMilliseconds;
  },

  _durationMilliseconds(duration) {
    return ISODurationUtils.isValidDuration(duration, (milliseconds) => { return milliseconds; });
  },

  render() {
    return (
      <div>
        <h2>客户端系统</h2>

        <dl className="deflist">
          <dt>非活跃阈值:</dt>
          <dd>{this.state.config.sidecar_inactive_threshold}</dd>
          <dt>过期阈值:</dt>
          <dd>{this.state.config.sidecar_expiration_threshold}</dd>
          <dt>更新间隔:</dt>
          <dd>{this.state.config.sidecar_update_interval}</dd>
          <dt>发送状态:</dt>
          <dd>{StringUtils.capitalizeFirstLetter(this.state.config.sidecar_send_status.toString())}</dd>
          <dt>覆盖配置:</dt>
          <dd>{StringUtils.capitalizeFirstLetter(this.state.config.sidecar_configuration_override.toString())}</dd>
        </dl>

        <IfPermitted permissions="clusterconfigentry:edit">
          <Button bsStyle="info" bsSize="xs" onClick={this._openModal}>更新</Button>
        </IfPermitted>

        <BootstrapModalForm ref="configModal"
                            title="更新客户端系统配置"
                            onSubmitForm={this._saveConfig}
                            onModalClose={this._resetConfig}
                            submitButtonText="保存">
          <fieldset>
            <ISODurationInput id="inactive-threshold-field"
                              duration={this.state.config.sidecar_inactive_threshold}
                              update={this._onUpdate('sidecar_inactive_threshold')}
                              label="非活跃阈值(ISO8601格式)"
                              help="在客户端被标记为非活跃状态之后的非活跃时间."
                              validator={this._inactiveThresholdValidator}
                              errorText="不合法(最少1秒)"
                              required />

            <ISODurationInput id="sidecar-expiration-field"
                              duration={this.state.config.sidecar_expiration_threshold}
                              update={this._onUpdate('sidecar_expiration_threshold')}
                              label="过期阈值(ISO8601格式)"
                              help="从数据库中清除非活跃客户端的时间."
                              validator={this._expirationThresholdValidator}
                              errorText="不合法(最少1分钟)"
                              required />
            <ISODurationInput id="sidecar-update-field"
                              duration={this.state.config.sidecar_update_interval}
                              update={this._onUpdate('sidecar_update_interval')}
                              label="更新间隔(ISO8601格式)"
                              help="客户端更新间隔."
                              validator={this._updateIntervalValidator}
                              errorText="不合法(最少1秒)"
                              required />
          </fieldset>
          <Input type="checkbox"
                 id="send-status-updates-checkbox"
                 label="发送状态更新"
                 checked={this.state.config.sidecar_send_status}
                 onChange={this._onUpdate('sidecar_send_status')}
                 help="发送客户端状态和主机指标" />
          <Input type="checkbox"
                 id="override-sidecar-config-checkbox"
                 label="覆盖客户端配置"
                 checked={this.state.config.sidecar_configuration_override}
                 onChange={this._onUpdate('sidecar_configuration_override')}
                 help="覆盖所有客户端的配置文件设置" />
        </BootstrapModalForm>
      </div>
    );
  },
});

export default SidecarConfig;
