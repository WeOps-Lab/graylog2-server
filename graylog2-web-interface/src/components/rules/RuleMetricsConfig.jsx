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

import {Spinner} from 'components/common';
import {Alert, BootstrapModalForm, Input} from 'components/bootstrap';
import * as FormsUtils from 'util/FormsUtils';

export default class RuleMetricsConfig extends React.Component {
  static propTypes = {
    config: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onClose: PropTypes.func,
  };

  static defaultProps = {
    config: undefined,
    onClose: () => {
    },
  };

  constructor(props) {
    super(props);

    this.state = {
      nextConfig: props.config,
    };
  }

  saveConfiguration = () => {
    const {onChange} = this.props;
    const {nextConfig} = this.state;

    onChange(nextConfig).then(this.closeModal);
  };

  openModal = () => {
    this.modal.open();
  };

  closeModal = () => {
    this.modal.close();
  };

  propagateChange = (key, value) => {
    const {config} = this.props;
    const nextConfig = lodash.cloneDeep(config);

    nextConfig[key] = value;
    this.setState({nextConfig});
  };

  handleChange = (event) => {
    const {name} = event.target;

    this.propagateChange(name, FormsUtils.getValueFromInput(event.target));
  };

  render() {
    const {config, onClose} = this.props;
    const {nextConfig} = this.state;

    if (!config) {
      return <p><Spinner text="加载度量配置中..."/></p>;
    }

    return (
      <BootstrapModalForm ref={(modal) => {
        this.modal = modal;
      }}
                          title="配置度量规则"
                          onSubmitForm={this.saveConfiguration}
                          onModalClose={onClose}
                          show
                          submitButtonText="保存">
        <Alert bsStyle="warning">
          规则度量只应该在调试性能的情况下启用
        </Alert>
        <fieldset>
          <Input type="radio"
                 id="metrics-enabled"
                 name="metrics_enabled"
                 value="true"
                 label="启用规则度量"
                 onChange={this.handleChange}
                 checked={nextConfig.metrics_enabled}/>

          <Input type="radio"
                 id="metrics-disabled"
                 name="metrics_enabled"
                 value="false"
                 label="禁用规则度量"
                 onChange={this.handleChange}
                 checked={!nextConfig.metrics_enabled}/>
        </fieldset>
        <p>
          当启用系统度量时,性能度量计时器会被执行两次
        </p>
        <strong>规则执行计时器</strong>
        <p>
          规则执行计时器会记录规则执行的时间
        </p>
        <strong>规则执行计时器</strong>
        <p>
          当启用系统度量时,性能度量计时器会被执行两次
        </p>
      </BootstrapModalForm>
    );
  }
}
