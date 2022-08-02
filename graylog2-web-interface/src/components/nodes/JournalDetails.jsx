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
// eslint-disable-next-line no-restricted-imports
import createReactClass from 'create-react-class';
import Reflux from 'reflux';
import numeral from 'numeral';
import moment from 'moment';
moment.locale('zh-cn');
import {} from 'moment-duration-format';
import styled from 'styled-components';

import { Link } from 'components/common/router';
import { Row, Col, Alert } from 'components/bootstrap';
import { Spinner, RelativeTime, Icon } from 'components/common';
import ProgressBar, { Bar } from 'components/common/ProgressBar';
import MetricsExtractor from 'logic/metrics/MetricsExtractor';
import NumberUtils from 'util/NumberUtils';
import Routes from 'routing/Routes';
import { JournalStore } from 'stores/journal/JournalStore';
import { MetricsActions, MetricsStore } from 'stores/metrics/MetricsStore';

const JournalUsageProgressBar = styled(ProgressBar)`
  margin-bottom: 5px;
  margin-top: 10px;

  ${Bar} {
    min-width: 3em;
  }
`;

const JournalDetails = createReactClass({
  displayName: 'JournalDetails',

  propTypes: {
    nodeId: PropTypes.string.isRequired,
  },

  mixins: [Reflux.connect(MetricsStore)],

  getInitialState() {
    return {
      journalInformation: undefined,
    };
  },

  componentDidMount() {
    const { nodeId } = this.props;

    JournalStore.get(nodeId).then((journalInformation) => {
      this.setState({ journalInformation: journalInformation }, this._listenToMetrics);
    });
  },

  componentWillUnmount() {
    const { nodeId } = this.props;

    if (this.metricNames) {
      Object.keys(this.metricNames).forEach((metricShortName) => MetricsActions.remove(nodeId, this.metricNames[metricShortName]));
    }
  },

  _listenToMetrics() {
    const { nodeId } = this.props;
    const { journalInformation } = this.state;

    // only listen for updates if the journal is actually turned on
    if (journalInformation.enabled) {
      this.metricNames = {
        append: 'org.graylog2.journal.append.1-sec-rate',
        read: 'org.graylog2.journal.read.1-sec-rate',
        segments: 'org.graylog2.journal.segments',
        entriesUncommitted: 'org.graylog2.journal.entries-uncommitted',
        utilizationRatio: 'org.graylog2.journal.utilization-ratio',
        oldestSegment: 'org.graylog2.journal.oldest-segment',
      };

      Object.keys(this.metricNames).forEach((metricShortName) => MetricsActions.add(nodeId, this.metricNames[metricShortName]));
    }
  },

  _isLoading() {
    const { journalInformation, metrics } = this.state;

    return !(metrics && journalInformation);
  },

  render() {
    if (this._isLoading()) {
      return <Spinner text="加载队列性能指标中..." />;
    }

    const { nodeId } = this.props;
    const { metrics: metricsState } = this.state;
    const nodeMetrics = metricsState[nodeId];
    const { journalInformation } = this.state;

    if (!journalInformation.enabled) {
      return (
        <Alert bsStyle="warning">
          <Icon name="exclamation-triangle" />&nbsp; 磁盘缓存不可用.
        </Alert>
      );
    }

    const metrics = this.metricNames ? MetricsExtractor.getValuesForNode(nodeMetrics, this.metricNames) : {};

    if (Object.keys(metrics).length === 0) {
      return (
        <Alert bsStyle="warning">
          <Icon name="exclamation-triangle" />&nbsp; 队列性能指标不可用.
        </Alert>
      );
    }

    const oldestSegment = moment(metrics.oldestSegment);
    let overcommittedWarning;

    if (metrics.utilizationRatio >= 1) {
      overcommittedWarning = (
        <span>
          <strong>警告!</strong> 队列使用已经达到了最大值.
          {' '}<Link to={Routes.SYSTEM.OVERVIEW}>点击这里</Link> 获取更多的消息.<br />
        </span>
      );
    }

    return (
      <Row className="row-sm">
        <Col md={6}>
          <h3>配置</h3>
          <dl className="system-journal">
            <dt>路径:</dt>
            <dd>{journalInformation.journal_config.directory}</dd>
            <dt>最早的条目:</dt>
            <dd><RelativeTime dateTime={oldestSegment} /></dd>
            <dt>最大长度:</dt>
            <dd>{NumberUtils.formatBytes(journalInformation.journal_config.max_size)}</dd>
            <dt>最大周期:</dt>
            <dd>{moment.duration(journalInformation.journal_config.max_age).format('d [days] h [hours] m [minutes]')}</dd>
            <dt>刷入规则:</dt>
            <dd>
              每 {numeral(journalInformation.journal_config.flush_interval).format('0,0')} 条消息
              {' '}or {moment.duration(journalInformation.journal_config.flush_age).format('h [hours] m [minutes] s [seconds]')}
            </dd>
          </dl>
        </Col>
        <Col md={6}>
          <h3>使用率</h3>

          <JournalUsageProgressBar bars={[{
            value: metrics.utilizationRatio * 100,
            label: NumberUtils.formatPercentage(metrics.utilizationRatio),
          }]} />

          {overcommittedWarning}

          <strong>{numeral(metrics.entriesUncommitted).format('0,0')} 条未处理的消息</strong>
          {' '}目前在队列的第 {metrics.segments} 段.<br />
          <strong>{numeral(metrics.append).format('0,0')} 消息</strong>
          {' '}在最近一秒被追加,{' '}
          <strong>{numeral(metrics.read).format('0,0')} 消息</strong> 在最近一秒被消费.
        </Col>
      </Row>
    );
  },
});

export default JournalDetails;
