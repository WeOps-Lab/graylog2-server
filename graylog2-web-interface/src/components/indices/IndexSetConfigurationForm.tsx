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
import moment from 'moment';

moment.locale('zh-cn');
import {Formik, Form, Field} from 'formik';
import styled from 'styled-components';
import {PluginStore} from 'graylog-web-plugin/plugin';

import {FormikFormGroup, FormikInput, Spinner, TimeUnitInput} from 'components/common';
import HideOnCloud from 'util/conditional/HideOnCloud';
import {LinkContainer} from 'components/common/router';
import {Col, Row, Button, Input} from 'components/bootstrap';
import IndexMaintenanceStrategiesConfiguration from 'components/indices/IndexMaintenanceStrategiesConfiguration';
import 'components/indices/rotation';
import 'components/indices/retention';
import type {IndexSet} from 'stores/indices/IndexSetsStore';

import type {RetentionStrategyContext} from './Types';

type Props = {
  indexSet: IndexSet,
  rotationStrategies: Array<any>,
  retentionStrategies: Array<any>,
  retentionStrategiesContext: RetentionStrategyContext,
  create: boolean,
  onUpdate: (indexSet: IndexSet) => void,
  cancelLink: string,
};

type Unit = 'seconds' | 'minutes';

type State = {
  indexSet: IndexSet,
  fieldTypeRefreshIntervalUnit: Unit,
};
const StyledButton = styled(Button)`
  margin-right:10px;
`;

const _validateIndexPrefix = (value) => {
  let error;

  if (value.length === 0) {
    error = '不合法的索引前缀:不能为空';
  } else if (value.indexOf('_') === 0 || value.indexOf('-') === 0 || value.indexOf('+') === 0) {
    error = '不合法的索引前缀:必须以小写或数字开头';
  } else if (value.toLocaleLowerCase() !== value) {
    error = '不合法的索引前缀:必须为小写字符';
  } else if (!value.match(/^[a-z0-9][a-z0-9_\-+]*$/)) {
    error = '不合法的索引前缀:只能包含小写字符, 数字, \'_\', \'-\' 和 \'+\'';
  }

  return error;
};

const _getRotationConfigState = (strategy: string, data: string) => {
  return {rotation_strategy_class: strategy, rotation_strategy: data};
};

const _getRetentionConfigState = (strategy: string, data: string) => {
  return {retention_strategy_class: strategy, retention_strategy: data};
};

class IndexSetConfigurationForm extends React.Component<Props, State> {
  static propTypes = {
    indexSet: PropTypes.object.isRequired,
    rotationStrategies: PropTypes.array.isRequired,
    retentionStrategies: PropTypes.array.isRequired,
    retentionStrategiesContext: PropTypes.shape({
      max_index_retention_period: PropTypes.string,
    }).isRequired,
    create: PropTypes.bool,
    onUpdate: PropTypes.func.isRequired,
    cancelLink: PropTypes.string.isRequired,
  };

  static defaultProps = {
    create: false,
  };

  constructor(props: Props) {
    super(props);
    const {indexSet} = this.props;

    this.state = {
      indexSet: indexSet,
      fieldTypeRefreshIntervalUnit: 'seconds',
    };
  }

  _saveConfiguration = (values) => {
    const {onUpdate} = this.props;

    onUpdate(values);
  };

  render() {
    const {indexSet, fieldTypeRefreshIntervalUnit} = this.state;
    const {
      rotationStrategies,
      retentionStrategies,
      create,
      cancelLink,
      indexSet: {
        rotation_strategy: indexSetRotationStrategy,
        rotation_strategy_class: indexSetRotationStrategyClass,
        retention_strategy: indexSetRetentionStrategy,
        retention_strategy_class: IndexSetRetentionStrategyClass,
      },
      retentionStrategiesContext,
    } = this.props;
    let rotationConfig;

    if (rotationStrategies) {
      // The component expects a different structure - legacy
      const activeConfig = {
        config: indexSetRotationStrategy,
        strategy: indexSetRotationStrategyClass,
      };

      rotationConfig = (
        <IndexMaintenanceStrategiesConfiguration title="索引轮转规则配置"
                                                 key="rotation"
                                                 description="DataInsight使用多个索引存储消息,在这里可以配置轮转策略."
                                                 selectPlaceholder="选择索引轮转规则"
                                                 pluginExports={PluginStore.exports('indexRotationConfig')}
                                                 strategies={rotationStrategies}
                                                 activeConfig={activeConfig}
                                                 getState={_getRotationConfigState}/>
      );
    } else {
      rotationConfig = (<Spinner/>);
    }

    let retentionConfig;

    if (retentionStrategies) {
      // The component expects a different structure - legacy
      const activeConfig = {
        config: indexSetRetentionStrategy,
        strategy: IndexSetRetentionStrategyClass,
      };

      retentionConfig = (
        <IndexMaintenanceStrategiesConfiguration title="索引操作配置"
                                                 key="retention"
                                                 description="DataInsight有多种索引策略可供配置."
                                                 selectPlaceholder="选择索引操作策略"
                                                 pluginExports={PluginStore.exports('indexRetentionConfig')}
                                                 strategies={retentionStrategies}
                                                 retentionStrategiesContext={retentionStrategiesContext}
                                                 activeConfig={activeConfig}
                                                 getState={_getRetentionConfigState}/>
      );
    } else {
      retentionConfig = (<Spinner/>);
    }

    let readOnlyconfig;

    if (create) {
      const indexPrefixHelp = (
        <span>
          ElasticSearch中只能有一个 <strong>唯一</strong> 的前缀
          前缀只能以数字、小写字母开头，并且只能包含字符，数字， '_'， '-' 和 '+'
        </span>
      );

      readOnlyconfig = (
        <span>
          <FormikFormGroup type="text"
                           label="索引前缀"
                           name="index_prefix"
                           help={indexPrefixHelp}
                           validate={_validateIndexPrefix}
                           required/>
          <FormikFormGroup type="text"
                           label="分词器"
                           name="index_analyzer"
                           help="Elasticsearch分析分词器."
                           required/>
        </span>
      );
    }

    return (
      <Row>
        <Col md={8}>
          <Formik onSubmit={this._saveConfiguration}
                  initialValues={indexSet}>
            {({isValid, setFieldValue}) => (
              <Form>
                <Row>
                  <Col md={12}>
                    <FormikFormGroup type="text"
                                     label="标题"
                                     name="title"
                                     help="索引集的标题."
                                     required/>
                    <FormikFormGroup type="text"
                                     label="描述"
                                     name="description"
                                     help="索引集的描述."
                                     required/>
                    {readOnlyconfig}
                    <HideOnCloud>
                      <FormikFormGroup type="number"
                                       label="索引分片"
                                       name="shards"
                                       help="Elasticsearch分片数."
                                       required/>
                      <FormikFormGroup type="number"
                                       label="索引副本"
                                       name="replicas"
                                       help="Elasticsearch副本数."
                                       required/>
                      <FormikFormGroup type="number"
                                       label="最大段数量"
                                       name="index_optimization_max_num_segments"
                                       minLength={1}
                                       help="ElasticSearch强制合并的段数量."
                                       required/>
                      <Input id="roles-selector-input"
                             labelClassName="col-sm-3"
                             wrapperClassName="col-sm-9"
                             label="轮转后索引优化">
                        <FormikInput type="checkbox"
                                     id="index_optimization_disabled"
                                     label="轮转索引后禁用"
                                     name="index_optimization_disabled"
                                     help="轮转索引后禁用该索引."/>
                      </Input>
                    </HideOnCloud>
                    <Field name="field_type_refresh_interval">
                      {({field: {name, value, onChange}}) => {
                        const _onFieldTypeRefreshIntervalChange = (intervalValue: number, unit: Unit) => {
                          onChange(name, moment.duration(intervalValue, unit).asMilliseconds());
                          setFieldValue(name, moment.duration(intervalValue, unit).asMilliseconds());
                          this.setState({fieldTypeRefreshIntervalUnit: unit});
                        };

                        return (
                          <Input id="roles-selector-input"
                                 labelClassName="col-sm-3"
                                 wrapperClassName="col-sm-9"
                                 label="字段类型刷新间隔">
                            <TimeUnitInput id="field-type-refresh-interval"
                                           type="number"
                                           help="多久刷新活跃索引的字段类型."
                                           value={moment.duration(value, 'milliseconds').as(fieldTypeRefreshIntervalUnit)}
                                           unit={fieldTypeRefreshIntervalUnit.toUpperCase()}
                                           units={['SECONDS', 'MINUTES']}
                                           required
                                           update={_onFieldTypeRefreshIntervalChange}/>
                          </Input>
                        );
                      }}
                    </Field>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    {indexSet.writable && rotationConfig}
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    {indexSet.writable && retentionConfig}
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <StyledButton type="submit" bsStyle="primary" disabled={!isValid}
                                  style={{marginRight: 10}}>保存</StyledButton>
                    <LinkContainer to={cancelLink}>
                      <Button bsStyle="default">取消</Button>
                    </LinkContainer>
                  </Col>
                </Row>

              </Form>
            )}
          </Formik>
        </Col>
      </Row>
    );
  }
}

export default IndexSetConfigurationForm;
