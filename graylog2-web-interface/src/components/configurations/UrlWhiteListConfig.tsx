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
import * as React from 'react';
import PropTypes from 'prop-types';

import { Button, Table } from 'components/bootstrap';
import { IfPermitted } from 'components/common';
import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';
import UrlWhiteListForm from 'components/configurations/UrlWhiteListForm';
import type { WhiteListConfig } from 'stores/configurations/ConfigurationsStore';

type State = {
  config: WhiteListConfig,
  isValid: boolean,
};

type Props = {
  config: WhiteListConfig,
  updateConfig: (config: WhiteListConfig) => Promise<void>,
};

class UrlWhiteListConfig extends React.Component<Props, State> {
  private configModal: BootstrapModalForm | undefined | null;

  static propTypes = {
    config: PropTypes.object.isRequired,
    updateConfig: PropTypes.func.isRequired,
  };

  constructor(props: Props) {
    super(props);
    const { config } = this.props;

    this.state = {
      config,
      isValid: false,
    };
  }

  _summary = (): React.ReactElement<'tr'>[] => {
    const literal = 'literal';
    const { config: { entries } } = this.props;

    return entries.map((urlConfig, idx) => {
      return (
        <tr key={urlConfig.id}>
          <td>{idx + 1}</td>
          <td>{urlConfig.title}</td>
          <td>{urlConfig.value}</td>
          <td>{urlConfig.type === literal ? '完整匹配' : '正则'}</td>
        </tr>
      );
    });
  };

  _openModal = () => {
    if (this.configModal) {
      this.configModal.open();
    }
  };

  _closeModal = () => {
    if (this.configModal) {
      this.configModal.close();
    }
  };

  _saveConfig = () => {
    const { config, isValid } = this.state;
    const { updateConfig } = this.props;

    if (isValid) {
      updateConfig(config).then(() => {
        this._closeModal();
      });
    }
  };

  _update = (config: WhiteListConfig, isValid: boolean) => {
    const updatedState = { config, isValid };

    this.setState(updatedState);
  };

  _resetConfig = () => {
    const { config } = this.props;
    const updatedState = { ...this.state, config };

    this.setState(updatedState);
  };

  render() {
    const { config: { entries, disabled } } = this.props;
    const { isValid } = this.state;

    return (
      <div>
        <h2>URL白名单配置  {disabled ? <small>(禁用)</small> : <small>(启用)</small> }</h2>
        <p>
          启用后,DataInsight所发出的HTTP请求将会经过白名单校验
        </p>
        <Table striped bordered condensed className="top-margin">
          <thead>
            <tr>
              <th>#</th>
              <th>标题</th>
              <th>URL</th>
              <th>类型</th>
            </tr>
          </thead>
          <tbody>
            {this._summary()}
          </tbody>
        </Table>
        <IfPermitted permissions="urlwhitelist:write">
          <Button bsStyle="info" bsSize="xs" onClick={this._openModal}>更新</Button>
        </IfPermitted>
        <BootstrapModalForm ref={(configModal) => { this.configModal = configModal; }}
                            bsSize="lg"
                            title="更新白名单配置"
                            onSubmitForm={this._saveConfig}
                            onModalClose={this._resetConfig}
                            submitButtonDisabled={!isValid}
                            submitButtonText="保存">
          <h3>白名单地址</h3>
          <UrlWhiteListForm urls={entries} disabled={disabled} onUpdate={this._update} />
        </BootstrapModalForm>
      </div>
    );
  }
}

export default UrlWhiteListConfig;
