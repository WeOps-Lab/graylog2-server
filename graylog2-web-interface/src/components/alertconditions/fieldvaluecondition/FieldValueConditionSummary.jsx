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

import GracePeriodSummary from 'components/alertconditions/GracePeriodSummary';
import BacklogSummary from 'components/alertconditions/BacklogSummary';
import RepeatNotificationsSummary from 'components/alertconditions/RepeatNotificationsSummary';
import {Pluralize} from 'components/common';

class FieldValueConditionSummary extends React.Component {
  static propTypes = {
    alertCondition: PropTypes.object.isRequired,
  };

  render() {
    const {alertCondition} = this.props;
    const {field} = alertCondition.parameters;
    const {threshold} = alertCondition.parameters;
    let thresholdType = alertCondition.parameters.threshold_type.toLowerCase();
    let type = alertCondition.parameters.type.toLowerCase();
    const {time} = alertCondition.parameters;

    switch (alertCondition.parameters.threshold_type.toLowerCase()) {
      case "higher":
        thresholdType = '大于';
        break;
      default:
        thresholdType = "小于";
        break;
    }

    switch (alertCondition.parameters.type.toLowerCase()) {
      case "mean":
        type = '平均值';
        break;
      case 'min':
        type = '最小值';
        break;
      case 'max':
        type = '最大值';
        break;
      case 'sum':
        type = '总和';
        break;
      default:
        type = '标准差';
        break;
    }

    return (
      <span>
        当字段 {field}
        {' '} 在
        <Pluralize value={time} singular="最近一分钟" plural={`最近 ${time} 分钟`}/>的
        {type}{thresholdType}{threshold}时触发告警。
        {' '}
        <GracePeriodSummary alertCondition={alertCondition}/>
        {' '}
        <BacklogSummary alertCondition={alertCondition}/>
        {' '}
        <RepeatNotificationsSummary alertCondition={alertCondition}/>
      </span>
    );

  }
}

export default FieldValueConditionSummary;
