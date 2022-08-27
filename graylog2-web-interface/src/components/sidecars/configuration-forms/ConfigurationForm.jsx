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

import { ColorPickerPopover, Select, SourceCodeEditor } from 'components/common';
import { Button, ButtonToolbar, Col, ControlLabel, FormControl, FormGroup, HelpBlock, Row, Input } from 'components/bootstrap';
import history from 'util/History';
import Routes from 'routing/Routes';
import ColorLabel from 'components/sidecars/common/ColorLabel';
import { CollectorConfigurationsActions } from 'stores/sidecars/CollectorConfigurationsStore';
import { CollectorsActions, CollectorsStore } from 'stores/sidecars/CollectorsStore';

import SourceViewModal from './SourceViewModal';
import ImportsViewModal from './ImportsViewModal';

const ConfigurationForm = createReactClass({
  displayName: 'ConfigurationForm',

  propTypes: {
    action: PropTypes.oneOf(['create', 'edit']),
    configuration: PropTypes.object,
    configurationSidecars: PropTypes.object,
  },

  mixins: [Reflux.connect(CollectorsStore)],

  getDefaultProps() {
    return {
      action: 'edit',
      configuration: {
        color: '#FFFFFF',
        template: '',
      },
      configurationSidecars: {},
    };
  },

  getInitialState() {
    const { configuration } = this.props;

    return {
      error: false,
      validation_errors: {},
      formData: {
        id: configuration.id,
        name: configuration.name,
        color: configuration.color,
        collector_id: configuration.collector_id,
        template: configuration.template || '',
      },
    };
  },

  UNSAFE_componentWillMount() {
    this._debouncedValidateFormData = lodash.debounce(this._validateFormData, 200);
  },

  componentDidMount() {
    CollectorsActions.all();
  },

  defaultTemplates: {},

  _isTemplateSet(template) {
    return template !== undefined && template !== '';
  },

  _hasErrors() {
    const { error, formData } = this.state;

    return error || !this._isTemplateSet(formData.template);
  },

  _validateFormData(nextFormData, checkForRequiredFields) {
    CollectorConfigurationsActions.validate(nextFormData).then((validation) => {
      const nextValidation = lodash.clone(validation);

      if (checkForRequiredFields && !this._isTemplateSet(nextFormData.template)) {
        nextValidation.errors.template = ['请填写必要的配置信息.'];
        nextValidation.failed = true;
      }

      this.setState({ validation_errors: nextValidation.errors, error: nextValidation.failed });
    });
  },

  _save() {
    const { action } = this.props;
    const { formData } = this.state;

    if (this._hasErrors()) {
      // Ensure we display an error on the template field, as this is not validated by the browser
      this._validateFormData(formData, true);

      return;
    }

    if (action === 'create') {
      CollectorConfigurationsActions.createConfiguration(formData)
        .then(() => history.push(Routes.SYSTEM.SIDECARS.CONFIGURATION));
    } else {
      CollectorConfigurationsActions.updateConfiguration(formData);
    }
  },

  _formDataUpdate(key) {
    const { formData } = this.state;

    return (nextValue, _, hideCallback) => {
      const nextFormData = lodash.cloneDeep(formData);

      nextFormData[key] = nextValue;
      this._debouncedValidateFormData(nextFormData, false);
      this.setState({ formData: nextFormData }, hideCallback);
    };
  },

  replaceConfigurationVariableName(oldname, newname) {
    const { formData } = this.state;

    if (oldname === '' || oldname === newname) {
      return;
    }

    // replaceAll without having to use a Regex
    const updatedTemplate = formData.template.split(`\${user.${oldname}}`).join(`\${user.${newname}}`);

    this._onTemplateChange(updatedTemplate);
  },

  _onNameChange(event) {
    const nextName = event.target.value;

    this._formDataUpdate('name')(nextName);
  },

  _getCollectorDefaultTemplate(collectorId) {
    const storedTemplate = this.defaultTemplates[collectorId];

    if (storedTemplate !== undefined) {
      return new Promise((resolve) => resolve(storedTemplate));
    }

    return CollectorsActions.getCollector(collectorId).then((collector) => {
      this.defaultTemplates[collectorId] = collector.default_template;

      return collector.default_template;
    });
  },

  _onCollectorChange(nextId) {
    const { formData } = this.state;

    // Start loading the request to get the default template, so it is available asap.
    const defaultTemplatePromise = this._getCollectorDefaultTemplate(nextId);

    const nextFormData = lodash.cloneDeep(formData);

    nextFormData.collector_id = nextId;

    // eslint-disable-next-line no-alert
    if (!nextFormData.template || window.confirm('是否要为所选配置使用默认模板?')) {
      // Wait for the promise to resolve and then update the whole formData state
      defaultTemplatePromise.then((defaultTemplate) => {
        this._onTemplateChange(defaultTemplate);
        nextFormData.template = defaultTemplate;
      });
    }

    this.setState({ formData: nextFormData });
  },

  _onTemplateImport(nextTemplate) {
    const { formData } = this.state;

    const nextFormData = lodash.cloneDeep(formData);

    // eslint-disable-next-line no-alert
    if (!nextFormData.template || window.confirm('是否要用此配置覆盖当前配置?')) {
      this._onTemplateChange(nextTemplate);
    }
  },

  _onTemplateChange(nextTemplate) {
    this._formDataUpdate('template')(nextTemplate);
  },

  _onSubmit(event) {
    event.preventDefault();
    this._save();
  },

  _onCancel() {
    history.goBack();
  },

  _onShowSource() {
    this.previewModal.open();
  },

  _onShowImports() {
    this.uploadsModal.open();
  },

  _formatCollector(collector) {
    return collector ? `${collector.name} on ${lodash.upperFirst(collector.node_operating_system)}` : '未知采集器';
  },

  _formatCollectorOptions() {
    const { collectors } = this.state;

    const options = [];

    if (collectors) {
      collectors.forEach((collector) => {
        options.push({ value: collector.id, label: this._formatCollector(collector) });
      });
    } else {
      options.push({ value: 'none', label: '加载采集器列表中...', disable: true });
    }

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

  _renderCollectorTypeField(collectorId, collectors, configurationSidecars) {
    const isConfigurationInUse = configurationSidecars.sidecar_ids && configurationSidecars.sidecar_ids.length > 0;

    if (isConfigurationInUse) {
      const collector = collectors ? collectors.find((c) => c.id === collectorId) : undefined;

      return (
        <span>
          <FormControl.Static>{this._formatCollector(collector)}</FormControl.Static>
          <HelpBlock bsClass="warning">
            <b>注意:</b> 配置正在使用时,日志采集器无法更改或克隆配置到另一个收集器中进行测试.
          </HelpBlock>
        </span>
      );
    }

    return (
      <span>
        <Select inputId="collector_id"
                options={this._formatCollectorOptions()}
                value={collectorId}
                onChange={this._onCollectorChange}
                placeholder="采集器"
                required />
        <HelpBlock>选择此配置适用的收集器.</HelpBlock>
      </span>
    );
  },

  render() {
    const { collectors, formData } = this.state;
    const { action, configurationSidecars } = this.props;

    return (
      <div>
        <form onSubmit={this._onSubmit}>
          <fieldset>
            <Input type="text"
                   id="name"
                   label="名称"
                   onChange={this._onNameChange}
                   bsStyle={this._validationState('name')}
                   help={this._formatValidationMessage('name', '必填,此配置的名称')}
                   value={formData.name || ''}
                   autoFocus
                   required />

            <FormGroup controlId="color">
              <ControlLabel>配置颜色</ControlLabel>
              <div>
                <ColorLabel color={formData.color} />
                <div style={{ display: 'inline-block', marginLeft: 15 }}>
                  <ColorPickerPopover id="color"
                                      placement="right"
                                      color={formData.color}
                                      triggerNode={<Button bsSize="xsmall">选择颜色</Button>}
                                      onChange={this._formDataUpdate('color')} />
                </div>
              </div>
              <HelpBlock>选择用于此配置的颜色.</HelpBlock>
            </FormGroup>

            <FormGroup controlId="collector_id">
              <ControlLabel>采集器</ControlLabel>
              {this._renderCollectorTypeField(formData.collector_id, collectors, configurationSidecars)}
            </FormGroup>

            <FormGroup controlId="template"
                       validationState={this._validationState('template')}>
              <ControlLabel>配置</ControlLabel>
              <SourceCodeEditor id="template"
                                height={400}
                                value={formData.template || ''}
                                onChange={this._onTemplateChange} />
              <Button className="pull-right"
                      bsStyle="link"
                      bsSize="sm"
                      onClick={this._onShowSource}>
                预览
              </Button>
              <Button className="pull-right"
                      bsStyle="link"
                      bsSize="sm"
                      onClick={this._onShowImports}>
                迁移
              </Button>
              <HelpBlock>
                {this._formatValidationMessage('template', '必填,采集器的配置.')}
              </HelpBlock>
            </FormGroup>
          </fieldset>

          <Row>
            <Col md={12}>
              <FormGroup>
                <ButtonToolbar>
                  <Button type="submit" bsStyle="primary" disabled={this._hasErrors()}>
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
        <SourceViewModal ref={(c) => { this.previewModal = c; }}
                         templateString={formData.template} />
        <ImportsViewModal ref={(c) => { this.uploadsModal = c; }}
                          onApply={this._onTemplateImport} />
      </div>
    );
  },
});

export default ConfigurationForm;
