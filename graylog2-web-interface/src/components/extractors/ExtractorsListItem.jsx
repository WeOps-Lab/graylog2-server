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
import numeral from 'numeral';

import {LinkContainer} from 'components/common/router';
import {Button, Row, Col, Well} from 'components/bootstrap';
import EntityListItem from 'components/common/EntityListItem';
import ExtractorUtils from 'util/ExtractorUtils';
import Routes from 'routing/Routes';
import {ExtractorsActions} from 'stores/extractors/ExtractorsStore';

class ExtractorsListItem extends React.Component {
  static propTypes = {
    extractor: PropTypes.object.isRequired,
    inputId: PropTypes.string.isRequired,
    nodeId: PropTypes.string.isRequired,
  };

  state = {
    showDetails: false,
  };

  _toggleDetails = () => {
    const {showDetails} = this.state;

    this.setState({showDetails: !showDetails});
  };

  _deleteExtractor = () => {
    const {extractor, inputId} = this.props;

    // eslint-disable-next-line no-alert
    if (window.confirm(`确定删除提取器 "${extractor.title}?"`)) {
      ExtractorsActions.delete.triggerPromise(inputId, extractor);
    }
  };

  _formatExtractorSubtitle = () => {
    const {extractor} = this.props;

    return (
      <span>
        尝试 {extractor.cursor_strategy === 'cut' && 'not'}
        原封不动的从
        <em>{extractor.source_field}</em>
        提取数据到<em>{extractor.target_field}</em>，{' '}
      </span>
    );
  };

  _formatCondition = () => {
    const {extractor} = this.props;

    if (extractor.condition_type === 'none') {
      return <div/>;
    }

    return (
      <div className="configuration-section">
        <h4>条件</h4>
        <ul>
          <li>
            只会当提取器{' '}
            {extractor.condition_type === 'string' ? '包含字符串' : '匹配正则表达式'}{' '}时候才会执行
            <em>{extractor.condition_value}</em>进行提取
          </li>
        </ul>
      </div>
    );
  };

  _formatActions = () => {
    const actions = [];
    const {extractor, nodeId, inputId} = this.props;

    actions.push(
      <Button key={`extractor-details-${extractor.id}`} bsStyle="info" onClick={this._toggleDetails}>
        详情
      </Button>,
    );

    actions.push(
      <LinkContainer key={`edit-extractor-${extractor.id}`}
                     to={Routes.edit_input_extractor(nodeId, inputId, extractor.id)}>
        <Button bsStyle="info">编辑</Button>
      </LinkContainer>,
    );

    actions.push(<Button key="delete-extractor-" bsStyle="danger" onClick={this._deleteExtractor}>删除</Button>);

    return actions;
  };

  _formatOptions = (options) => {
    const {extractor} = this.props;

    const attributes = Object.keys(options);

    return attributes.map((attribute) => {
      return <li key={`${attribute}-${extractor.id}`}>{attribute}: {options[attribute]}</li>;
    });
  };

  _formatConfiguration = (extractorConfig) => {
    let formattedOptions = this._formatOptions(extractorConfig);

    if (formattedOptions.length === 0) {
      formattedOptions = <li>没有配置任何参数</li>;
    }

    return (
      <div className="configuration-section">
        <h4>配置</h4>
        <ul>
          {formattedOptions}
        </ul>
      </div>
    );
  };

  _formatConverter = (key, converter) => {
    return (
      <li key={`converter-${key}`}>
        {converter.type}
        {converter.config && <ul>{this._formatOptions(converter.config)}</ul>}
      </li>
    );
  };

  _formatConverters = (converters) => {
    const converterKeys = Object.keys(converters);
    const formattedConverters = converterKeys.map((converterKey) => this._formatConverter(converterKey, converters[converterKey]));

    if (formattedConverters.length === 0) {
      return <div/>;
    }

    return (
      <div className="configuration-section">
        <h4>转换器</h4>
        <ul>
          {formattedConverters}
        </ul>
      </div>
    );
  };

  _formatTimingMetrics = (timing) => {
    return (
      <dl className="metric-def metric-timer">
        <dt>95%:</dt>
        <dd>{numeral(timing['95th_percentile']).format('0,0.[00]')}&#956;s</dd>

        <dt>98%:</dt>
        <dd>{numeral(timing['98th_percentile']).format('0,0.[00]')}&#956;s</dd>

        <dt>99%:</dt>
        <dd>{numeral(timing['99th_percentile']).format('0,0.[00]')}&#956;s</dd>

        <dt>标准差:</dt>
        <dd>{numeral(timing.std_dev).format('0,0.[00]')}&#956;s</dd>

        <dt>平均值:</dt>
        <dd>{numeral(timing.mean).format('0,0.[00]')}&#956;s</dd>

        <dt>最小值:</dt>
        <dd>{numeral(timing.min).format('0,0.[00]')}&#956;s</dd>

        <dt>最大值:</dt>
        <dd>{numeral(timing.max).format('0,0.[00]')}&#956;s</dd>
      </dl>
    );
  };

  _formatMetrics = (metrics) => {
    let totalRate;

    if (metrics.total.rate) {
      totalRate = (
        <div className="meter" style={{marginBottom: 10}}>
          {numeral(metrics.total.rate.total).format('0,0')} 次调用,{' '}
          平均:{' '}
          {numeral(metrics.total.rate.one_minute).format('0,0.[00]')},{' '}
          {numeral(metrics.total.rate.five_minute).format('0,0.[00]')},{' '}
          {numeral(metrics.total.rate.fifteen_minute).format('0,0.[00]')}.
        </div>
      );
    }

    const conditionCounts = (
      <div className="meter" style={{marginBottom: 10}}>
        {metrics.condition_hits} 命中,{' '}
        {metrics.condition_misses} 未命中
      </div>
    );

    let totalTime;

    if (metrics.total.time) {
      totalTime = this._formatTimingMetrics(metrics.total.time);
    } else {
      totalTime = '没有消息经过这里.';
    }

    let conditionTime;

    if (metrics.condition.time) {
      conditionTime = this._formatTimingMetrics(metrics.condition.time);
    } else {
      conditionTime = '没有消息经过这里.';
    }

    let executionTime;

    if (metrics.execution.time) {
      executionTime = this._formatTimingMetrics(metrics.execution.time);
    } else {
      executionTime = '没有消息经过这里.';
    }

    let convertersTime;

    if (metrics.converters.time) {
      convertersTime = this._formatTimingMetrics(metrics.converters.time);
    } else {
      convertersTime = '没有消息经过这里.';
    }

    return (
      <div>
        {totalRate}
        {conditionCounts}
        <Row>
          <Col md={6}>
            <h4 style={{display: 'inline'}}>总耗时</h4><br/>
            {totalTime}
          </Col>
          <Col md={6}>
            <h4 style={{display: 'inline'}}>条件判断时间</h4><br/>
            {conditionTime}
          </Col>
          <Col md={6}>
            <h4 style={{display: 'inline'}}>执行时间</h4><br/>
            {executionTime}
          </Col>
          <Col md={6}>
            <h4 style={{display: 'inline'}}>转换时间</h4><br/>
            {convertersTime}
          </Col>
        </Row>
      </div>
    );
  };

  _formatDetails = () => {
    const {extractor} = this.props;

    return (
      <div>
        <Col md={8}>
          <Well bsSize="small" className="configuration-well">
            {this._formatCondition()}
            {this._formatConfiguration(extractor.extractor_config)}
            {this._formatConverters(extractor.converters)}
          </Well>
        </Col>
        <Col md={4}>
          <div className="graylog-input-metrics">
            <h3>性能指标</h3>
            {this._formatMetrics(extractor.metrics)}
          </div>
        </Col>
      </div>
    );
  };

  render() {
    const {extractor} = this.props;
    const {showDetails} = this.state;

    return (
      <EntityListItem key={`entry-list-${extractor.id}`}
                      title={extractor.title}
                      titleSuffix={ExtractorUtils.getReadableExtractorTypeName(extractor.type)}
                      description={this._formatExtractorSubtitle()}
                      actions={this._formatActions()}
                      contentRow={showDetails ? this._formatDetails() : null}/>
    );
  }
}

export default ExtractorsListItem;
