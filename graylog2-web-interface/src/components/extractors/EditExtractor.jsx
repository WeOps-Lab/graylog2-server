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

import { Col, ControlLabel, FormControl, FormGroup, Row, Button, Input } from 'components/bootstrap';
import ExtractorUtils from 'util/ExtractorUtils';
import FormUtils from 'util/FormsUtils';
import ToolsStore from 'stores/tools/ToolsStore';
import { ExtractorsActions } from 'stores/extractors/ExtractorsStore';

import EditExtractorConverters from './EditExtractorConverters';
import EditExtractorConfiguration from './EditExtractorConfiguration';
import ExtractorExampleMessage from './ExtractorExampleMessage';

class EditExtractor extends React.Component {
  static propTypes = {
    action: PropTypes.oneOf(['create', 'edit']).isRequired,
    extractor: PropTypes.object.isRequired,
    inputId: PropTypes.string.isRequired,
    exampleMessage: PropTypes.string,
    onSave: PropTypes.func.isRequired,
  };

  static defaultProps = {
    exampleMessage: undefined,
  };

  constructor(props) {
    super(props);

    this.state = {
      updatedExtractor: props.extractor,
      conditionTestResult: undefined,
      exampleMessage: props.exampleMessage,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { exampleMessage } = this.props;

    if (exampleMessage !== nextProps.exampleMessage) {
      this._updateExampleMessage(nextProps.exampleMessage);
    }
  }

  _updateExampleMessage = (nextExample) => {
    this.setState({ exampleMessage: nextExample });
  };

  // Ensures the target field only contains alphanumeric characters and underscores
  _onTargetFieldChange = (event) => {
    const { value } = event.target;
    const newValue = value.replace(/[^\w\d_]/g, '');

    if (value !== newValue) {
      this.targetField.getInputDOMNode().value = newValue;
    }

    this._onFieldChange('target_field')(event);
  };

  _onFieldChange = (key) => {
    return (event) => {
      const nextState = {};
      const { updatedExtractor } = this.state;

      updatedExtractor[key] = FormUtils.getValueFromInput(event.target);
      nextState.updatedExtractor = updatedExtractor;

      // Reset result of testing condition after a change in the input
      if (key === 'condition_value') {
        nextState.conditionTestResult = undefined;
      }

      this.setState(nextState);
    };
  };

  _onConfigurationChange = (newConfiguration) => {
    const { updatedExtractor } = this.state;

    updatedExtractor.extractor_config = newConfiguration;
    this.setState({ updatedExtractor: updatedExtractor });
  };

  _onConverterChange = (converterType, newConverter) => {
    const { updatedExtractor } = this.state;
    const previousConverter = updatedExtractor.converters.filter((converter) => converter.type === converterType)[0];

    if (previousConverter) {
      // Remove converter from the list
      const position = updatedExtractor.converters.indexOf(previousConverter);

      updatedExtractor.converters.splice(position, 1);
    }

    if (newConverter) {
      updatedExtractor.converters.push(newConverter);
    }

    this.setState({ updatedExtractor: updatedExtractor });
  };

  _testCondition = () => {
    const { exampleMessage, updatedExtractor } = this.state;
    const tester = (updatedExtractor.condition_type === 'string' ? ToolsStore.testContainsString : ToolsStore.testRegex);
    const promise = tester(updatedExtractor.condition_value, exampleMessage);

    promise.then((result) => this.setState({ conditionTestResult: result.matched }));
  };

  _tryButtonDisabled = () => {
    const { updatedExtractor, exampleMessage } = this.state;

    return (updatedExtractor.condition_value === ''
      || updatedExtractor.condition_value === undefined
      || !exampleMessage);
  };

  _getExtractorConditionControls = () => {
    const { conditionTestResult, updatedExtractor } = this.state;

    if (!updatedExtractor.condition_type
      || updatedExtractor.condition_type === 'none') {
      return <div />;
    }

    let conditionInputLabel;
    let conditionInputHelp;

    if (updatedExtractor.condition_type === 'string') {
      conditionInputLabel = '字段包含字符串';
      conditionInputHelp = '输入包含字段的字符串以便尝试提取.';
    } else {
      conditionInputLabel = '字段匹配正则表达式';
      conditionInputHelp = '输入正则表达式以提取字段信息.';
    }

    let inputStyle;

    if (conditionTestResult === true) {
      inputStyle = 'success';
      conditionInputHelp = '匹配!提取器将在这个例子上执行.';
    } else if (conditionTestResult === false) {
      inputStyle = 'error';
      conditionInputHelp = '不匹配!提取器取将不会运行.';
    }

    return (
      <div>
        <Input id="condition_value"
               label={conditionInputLabel}
               bsStyle={inputStyle}
               labelClassName="col-md-2"
               wrapperClassName="col-md-10"
               help={conditionInputHelp}>
          <Row className="row-sm">
            <Col md={11}>
              <input type="text"
                     id="condition_value"
                     className="form-control"
                     defaultValue={updatedExtractor.condition_value}
                     onChange={this._onFieldChange('condition_value')}
                     required />
            </Col>
            <Col md={1} className="text-right">
              <Button bsStyle="info"
                      onClick={this._testCondition}
                      disabled={this._tryButtonDisabled()}>
                测试
              </Button>
            </Col>
          </Row>
        </Input>
      </div>
    );
  };

  _saveExtractor = (event) => {
    const { inputId, onSave } = this.props;
    const { updatedExtractor } = this.state;

    event.preventDefault();

    ExtractorsActions.save.triggerPromise(inputId, updatedExtractor)
      .then(() => onSave());
  };

  _staticField = (label, text) => {
    return (
      <FormGroup>
        <Col componentClass={ControlLabel} md={2}>
          {label}
        </Col>
        <Col md={10}>
          <FormControl.Static>{text}</FormControl.Static>
        </Col>
      </FormGroup>
    );
  };

  render() {
    const { updatedExtractor, exampleMessage } = this.state;
    const { action } = this.props;
    const conditionTypeHelpMessage = '只从符合特定条件的消息中提取字段,这可以避免错误或者不必要的提取,还可以节省CPU资源.';

    const cursorStrategyHelpMessage = (
      <span>
        不能对<em>message</em>以及<em>source</em>这类型的标准字段进行剪切.
      </span>
    );

    const targetFieldHelpMessage = (
      <span>
        创建一个新字段来存储提取出来的值.只允许包含<b>字母,数字以及下划线</b>.例如:<em>http_response_code</em>.
      </span>
    );

    let storeAsFieldInput;

    // Grok and JSON extractors create their required fields, so no need to add an input for them
    if (updatedExtractor.type !== ExtractorUtils.ExtractorTypes.GROK && updatedExtractor.type !== ExtractorUtils.ExtractorTypes.JSON) {
      storeAsFieldInput = (
        <Input type="text"
               ref={(targetField) => { this.targetField = targetField; }}
               id="target_field"
               label="存储为字段"
               defaultValue={updatedExtractor.target_field}
               labelClassName="col-md-2"
               wrapperClassName="col-md-10"
               onChange={this._onTargetFieldChange}
               required
               help={targetFieldHelpMessage} />
      );
    }

    return (
      <div>
        <Row className="content extractor-list">
          <Col md={12}>
            <h2>示例日志消息</h2>
            <Row style={{ marginTop: 5 }}>
              <Col md={12}>
                <ExtractorExampleMessage field={updatedExtractor.source_field}
                                         example={exampleMessage}
                                         onExampleLoad={this._updateExampleMessage} />
              </Col>
            </Row>
            <h2>提取器配置</h2>
            <Row>
              <Col md={8}>
                <form className="extractor-form form-horizontal" method="POST" onSubmit={this._saveExtractor}>
                  {this._staticField('提取器类型', ExtractorUtils.getReadableExtractorTypeName(updatedExtractor.type))}
                  {this._staticField('来源字段', updatedExtractor.source_field)}

                  <EditExtractorConfiguration extractorType={updatedExtractor.type}
                                              configuration={updatedExtractor.extractor_config}
                                              onChange={this._onConfigurationChange}
                                              exampleMessage={exampleMessage} />

                  <Input id="condition-type"
                         label="条件"
                         labelClassName="col-md-2"
                         wrapperClassName="col-md-10"
                         help={conditionTypeHelpMessage}>
                    <span>
                      <div className="radio">
                        <label htmlFor="condition_type_none">
                          <input type="radio"
                                 name="condition_type"
                                 id="condition_type_none"
                                 value="none"
                                 onChange={this._onFieldChange('condition_type')}
                                 defaultChecked={!updatedExtractor.condition_type || updatedExtractor.condition_type === 'none'} />
                          总是尝试提取
                        </label>
                      </div>
                      <div className="radio">
                        <label htmlFor="condition_type_string">
                          <input type="radio"
                                 name="condition_type"
                                 id="condition_type_string"
                                 value="string"
                                 onChange={this._onFieldChange('condition_type')}
                                 defaultChecked={updatedExtractor.condition_type === 'string'} />
                          只有字段包含字符串才尝试提取
                        </label>
                      </div>
                      <div className="radio">
                        <label htmlFor="condition_type_regex">
                          <input type="radio"
                                 name="condition_type"
                                 id="condition_type_regex"
                                 value="regex"
                                 onChange={this._onFieldChange('condition_type')}
                                 defaultChecked={updatedExtractor.condition_type === 'regex'} />
                          只有当字段匹配正则表达式时提取
                        </label>
                      </div>
                    </span>
                  </Input>
                  {this._getExtractorConditionControls()}

                  {storeAsFieldInput}

                  <Input id="extraction-strategy"
                         label="提取策略"
                         labelClassName="col-md-2"
                         wrapperClassName="col-md-10"
                         help={cursorStrategyHelpMessage}>
                    <span>
                      <label className="radio-inline" htmlFor="cursor_strategy_copy">
                        <input type="radio"
                               name="cursor_strategy"
                               id="cursor_strategy_copy"
                               value="copy"
                               onChange={this._onFieldChange('cursor_strategy')}
                               defaultChecked={!updatedExtractor.cursor_strategy || updatedExtractor.cursor_strategy === 'copy'} />
                        复制
                      </label>
                      <label className="radio-inline" htmlFor="cursor_strategy_cut">
                        <input type="radio"
                               name="cursor_strategy"
                               id="cursor_strategy_cut"
                               value="cut"
                               onChange={this._onFieldChange('cursor_strategy')}
                               defaultChecked={updatedExtractor.cursor_strategy === 'cut'} />
                        剪切
                      </label>
                    </span>
                  </Input>

                  <Input type="text"
                         id="title"
                         label="提取器标题"
                         defaultValue={updatedExtractor.title}
                         labelClassName="col-md-2"
                         wrapperClassName="col-md-10"
                         onChange={this._onFieldChange('title')}
                         required
                         help="提取器的描述." />

                  <div style={{ marginBottom: 20 }}>
                    <EditExtractorConverters extractorType={updatedExtractor.type}
                                             converters={updatedExtractor.converters}
                                             onChange={this._onConverterChange} />
                  </div>

                  <Row>
                    <Col mdOffset={2} md={10}>
                      <Button type="submit" bsStyle="success">
                        {action === 'create' ? '创建提取器' : '更新提取器'}
                      </Button>
                    </Col>
                  </Row>
                </form>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    );
  }
}

export default EditExtractor;
