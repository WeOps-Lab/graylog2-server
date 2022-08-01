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
import numeral from 'numeral';

import { Pluralize, Spinner } from 'components/common';
import MetricsExtractor from 'logic/metrics/MetricsExtractor';
import { MetricsActions, MetricsStore } from 'stores/metrics/MetricsStore';

const JournalState = createReactClass({
  displayName: 'JournalState',

  propTypes: {
    nodeId: PropTypes.string.isRequired,
  },

  mixins: [Reflux.connect(MetricsStore)],

  UNSAFE_componentWillMount() {
    this.metricNames = {
      append: 'org.graylog2.journal.append.1-sec-rate',
      read: 'org.graylog2.journal.read.1-sec-rate',
      segments: 'org.graylog2.journal.segments',
      entriesUncommitted: 'org.graylog2.journal.entries-uncommitted',
    };

    Object.keys(this.metricNames).forEach((metricShortName) => MetricsActions.add(this.props.nodeId, this.metricNames[metricShortName]));
  },

  componentWillUnmount() {
    Object.keys(this.metricNames).forEach((metricShortName) => MetricsActions.remove(this.props.nodeId, this.metricNames[metricShortName]));
  },

  _isLoading() {
    return !this.state.metrics;
  },

  render() {
    if (this._isLoading()) {
      return <Spinner text="加载队列性能指标中..."/>;
    }

    const { nodeId } = this.props;
    const nodeMetrics = this.state.metrics[nodeId];
    const metrics = MetricsExtractor.getValuesForNode(nodeMetrics, this.metricNames);

    if (Object.keys(metrics).length === 0) {
      return <span>队列性能指标不可用.</span>;
    }

    return (
      <span>
        此节点在{metrics.segments}个段落中包含<strong>{numeral(metrics.entriesUncommitted).format('0,0')}条</strong>未处理的消息
        {' '}。{' '}
        新增<strong>{numeral(metrics.append).format('0,0')}条</strong>日志消息,
        最后一秒读取的消息数为<strong>{numeral(metrics.read).format('0,0')}条</strong>.
      </span>
    );
  },
});

export default JournalState;
