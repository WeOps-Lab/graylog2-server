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
import Reflux from 'reflux';
import lodash from 'lodash';

import { Select, SourceCodeEditor } from 'components/common';
import { Button, ButtonToolbar, Col, ControlLabel, FormGroup, HelpBlock, Row, Input } from 'components/bootstrap';
import history from 'util/History';
import Routes from 'routing/Routes';
import { CollectorConfigurationsActions } from 'stores/sidecars/CollectorConfigurationsStore';
import { CollectorsActions, CollectorsStore } from 'stores/sidecars/CollectorsStore';

const CollectorForm = createReactClass({
  displayName: 'CollectorForm',

  propTypes: {
    action: PropTypes.oneOf(['create', 'edit']),
    collector: PropTypes.object,
  },

  mixins: [Reflux.connect(CollectorsStore)],

  getDefaultProps() {
    return {
      action: 'edit',
      collector: {
        default_template: '',
      },
    };
  },

  getInitialState() {
    const { collector } = this.props;

    return {
      error: false,
      validation_errors: {},
      formData: {
        id: collector.id,
        name: collector.name,
        service_type: collector.service_type,
        node_operating_system: collector.node_operating_system,
        executable_path: collector.executable_path,
        execute_parameters: collector.execute_parameters,
        validation_parameters: collector.validation_parameters,
        default_template: String(collector.default_template),
      },
    };
  },

  UNSAFE_componentWillMount() {
    this._debouncedValidateFormData = lodash.debounce(this._validateFormData, 200);
  },

  componentDidMount() {
    CollectorsActions.all();
    CollectorConfigurationsActions.all();
  },

  hasErrors() {
    const { error } = this.state;

    return error;
  },

  _save() {
    const { action } = this.props;
    const { formData } = this.state;

    if (!this.hasErrors()) {
      if (action === 'create') {
        CollectorsActions.create(formData)
          .then(() => history.push(Routes.SYSTEM.SIDECARS.CONFIGURATION));
      } else {
        CollectorsActions.update(formData);
      }
    }
  },

  _formDataUpdate(key) {
    const { formData } = this.state;

    return (nextValue) => {
      const nextFormData = lodash.cloneDeep(formData);

      nextFormData[key] = nextValue;
      this._debouncedValidateFormData(nextFormData);
      this.setState({ formData: nextFormData });
    };
  },

  _validateFormData(nextFormData) {
    if (nextFormData.name && nextFormData.node_operating_system) {
      CollectorsActions.validate(nextFormData).then((validation) => (
        this.setState({ validation_errors: validation.errors, error: validation.failed })
      ));
    }
  },

  _onNameChange(event) {
    const nextName = event.target.value;

    this._formDataUpdate('name')(nextName);
  },

  _onInputChange(key) {
    return (event) => {
      this._formDataUpdate(key)(event.target.value);
    };
  },

  _onSubmit(event) {
    event.preventDefault();
    this._save();
  },

  _onCancel() {
    history.goBack();
  },

  _formatServiceTypes() {
    const options = [];

    options.push({ value: 'exec', label: '前台执行' });
    options.push({ value: 'svc', label: 'Windows服务' });

    return options;
  },

  _formatOperatingSystems() {
    const options = [];

    options.push({ value: 'linux', label: 'Linux' });
    options.push({ value: 'windows', label: 'Windows' });

    return options;
  },

  _formatValidationMessage(fieldName, defaultText) {
    const { validation_errors: validationErrors } = this.state;

    if (validationErrors[fieldName]) {
      return <span>{validationErrors[fieldName][0]}</span>;
    }

    return <span>{defaultText}</span>;
  },

  _validationState(fieldName) {
    const { validation_errors: validationErrors } = this.state;

    if (validationErrors[fieldName]) {
      return 'error';
    }

    return null;
  },

  render() {
    const { action } = this.props;
    const { formData } = this.state;

    let validationParameters = '';
    let executeParameters = '';

    if (formData.validation_parameters) {
      validationParameters = formData.validation_parameters;
    }

    if (formData.execute_parameters) {
      executeParameters = formData.execute_parameters;
    }

    return (
      <div>
        <form onSubmit={this._onSubmit}>
          <fieldset>
            <Input type="text"
                   id="name"
                   label="名称"
                   onChange={this._onNameChange}
                   bsStyle={this._validationState('name')}
                   help={this._formatValidationMessage('name', '采集器名称')}
                   value={formData.name || ''}
                   autoFocus
                   required />

            <FormGroup controlId="service_type"
                       validationState={this._validationState('service_type')}>
              <ControlLabel>进程管理</ControlLabel>
              <Select inputId="service_type"
                      options={this._formatServiceTypes()}
                      value={formData.service_type}
                      onChange={this._formDataUpdate('service_type')}
                      placeholder="服务类型"
                      required />
              <HelpBlock>{this._formatValidationMessage('service_type', '选择此采集器要用于的服务类型.')}</HelpBlock>
            </FormGroup>

            <FormGroup controlId="node_operating_system"
                       validationState={this._validationState('node_operating_system')}>
              <ControlLabel>操作系统</ControlLabel>
              <Select inputId="node_operating_system"
                      options={this._formatOperatingSystems()}
                      value={formData.node_operating_system}
                      onChange={this._formDataUpdate('node_operating_system')}
                      placeholder="名称"
                      required />
              <HelpBlock>{this._formatValidationMessage('node_operating_system', '选择此收集器要用于的操作系统.')}</HelpBlock>
            </FormGroup>

            <Input type="text"
                   id="executablePath"
                   label="可执行路径"
                   onChange={this._onInputChange('executable_path')}
                   bsStyle={this._validationState('executable_path')}
                   help={this._formatValidationMessage('executable_path', '采集器可执行路径')}
                   value={formData.executable_path || ''}
                   required />

            <Input type="text"
                   id="executeParameters"
                   label={<span>执行参数 <small className="text-muted">(可选)</small></span>}
                   onChange={this._onInputChange('execute_parameters')}
                   help={<span>采集器的执行参数.<strong> %s 将替换为配置文件的路径.</strong></span>}
                   value={executeParameters || ''} />

            <Input type="text"
                   id="validationParameters"
                   label={<span>校验配置参数 <small className="text-muted">(可选)</small></span>}
                   onChange={this._onInputChange('validation_parameters')}
                   help={<span>校验配置文件的参数. <strong> %s 将替换为配置文件的路径.</strong></span>}
                   value={validationParameters || ''} />

            <FormGroup controlId="defaultTemplate">
              <ControlLabel><span>默认模板 <small className="text-muted">(可选)</small></span></ControlLabel>
              <SourceCodeEditor id="template"
                                value={formData.default_template || ''}
                                onChange={this._formDataUpdate('default_template')} />
              <HelpBlock>采集器默认配置模板.</HelpBlock>
            </FormGroup>
          </fieldset>

          <Row>
            <Col md={12}>
              <FormGroup>
                <ButtonToolbar>
                  <Button type="submit" bsStyle="primary" disabled={this.hasErrors()}>
                    {action === 'create' ? '创建' : '更新'}
                  </Button>
                  <Button type="button" onClick={this._onCancel}>
                    {action === 'create' ? '取消' : '返回'}
                  </Button>
                </ButtonToolbar>
              </FormGroup>
            </Col>
          </Row>
        </form>
      </div>
    );
  },
});

export default CollectorForm;
