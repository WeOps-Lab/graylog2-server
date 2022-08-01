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

import { BootstrapModalForm, Input, Panel, Button } from 'components/bootstrap';

import GrokPatternInput from './GrokPatternInput';

class EditPatternModal extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    pattern: PropTypes.string,
    patterns: PropTypes.array,
    create: PropTypes.bool,
    sampleData: PropTypes.string,
    savePattern: PropTypes.func.isRequired,
    testPattern: PropTypes.func.isRequired,
    validPatternName: PropTypes.func.isRequired,
  };

  static defaultProps = {
    id: '',
    name: '',
    pattern: '',
    patterns: [],
    create: false,
    sampleData: '',
  };

  constructor(props) {
    super(props);

    this.state = {
      id: props.id,
      name: props.name,
      pattern: props.pattern,
      sampleData: props.sampleData,
      test_result: '',
      test_error: undefined,
      error: false,
      error_message: '',
    };
  }

  openModal = () => {
    this.modal.open();
  };

  _onPatternChange = (newPattern) => {
    this.setState({ pattern: newPattern });
  };

  _onNameChange = (event) => {
    const { validPatternName } = this.props;
    const name = event.target.value;

    if (!validPatternName(name)) {
      this.setState({ name: name, error: true, error_message: '具有该名称的模式已存在!' });
    } else {
      this.setState({ name: name, error: false, error_message: '' });
    }
  };

  _onSampleDataChange = (event) => {
    this.setState({ sampleData: event.target.value });
  };

  _getId = (prefixIdName) => {
    const { name } = this.state;

    return name !== undefined ? prefixIdName + name : prefixIdName;
  };

  _closeModal = () => {
    this.modal.close();
  };

  _saved = () => {
    const { create } = this.props;

    this._closeModal();

    if (create) {
      this.setState({ name: '', pattern: '', sampleData: '', test_result: '' });
    }
  };

  _save = () => {
    const { savePattern } = this.props;
    const { error } = this.state;

    if (!error) {
      savePattern(this.state, this._saved);
    }
  };

  _testPattern = () => {
    const { name, pattern } = this.state;
    const { testPattern } = this.props;

    if (name === '' || pattern === '') {
      this.setState({ error: true, error_message: '要测试模式，必须给出名称和模式!' });

      return;
    }

    this.setState({ error: false, error_message: '' });

    testPattern(this.state, (response) => {
      this.setState({ test_result: JSON.stringify(response, null, 2), test_error: undefined });
    }, (errMessage) => {
      this.setState({ test_result: '', test_error: errMessage });
    });
  };

  render() {
    const { create, patterns } = this.props;
    const {
      name,
      error,
      error_message: errorMessage,
      pattern,
      test_error: testError,
      sampleData,
      test_result: testResult,
    } = this.state;

    let triggerButtonContent;

    if (create) {
      triggerButtonContent = '创建模式';
    } else {
      triggerButtonContent = <span>编辑</span>;
    }

    return (
      <span>
        <Button onClick={this.openModal}
                bsStyle={create ? 'success' : 'info'}
                bsSize={create ? undefined : 'xs'}>
          {triggerButtonContent}
        </Button>
        <BootstrapModalForm ref={(modal) => { this.modal = modal; }}
                            title={`${create ? '创建' : '编辑'} Grok ${name}`}
                            bsSize="large"
                            onSubmitForm={this._save}
                            submitButtonText="保存">
          <fieldset>
            <Input type="text"
                   id={this._getId('pattern-name')}
                   label="名称"
                   onChange={this._onNameChange}
                   value={name}
                   bsStyle={error ? 'error' : null}
                   help={error ? errorMessage : "在此名称下，模式将被存储，以后可以像这样使用：'%{THISNAME}'"}
                   autoFocus
                   required />
            <GrokPatternInput onPatternChange={this._onPatternChange}
                              pattern={pattern}
                              patterns={patterns} />
            {testError
              && (
              <Panel bsStyle="danger" header="Grok 异常">
                <code style={{ display: 'block', whiteSpace: 'pre-wrap' }}>{testError}</code>
              </Panel>
              )}
            <Input type="textarea"
                   id={this._getId('sampleData')}
                   label="样本数据"
                   help="在这里您可以添加示例数据来测试您的模式"
                   onChange={this._onSampleDataChange}
                   value={sampleData} />
            <Button bsStyle="info" onClick={this._testPattern}>使用样本数据进行测试</Button>
            <br />
            <br />
            <Input type="textarea"
                   id={this._getId('test_result')}
                   readOnly
                   rows={8}
                   help="将包含 JSON 格式的测试结果"
                   label="测试结果"
                   value={testResult} />
          </fieldset>
        </BootstrapModalForm>
      </span>
    );
  }
}

export default EditPatternModal;
