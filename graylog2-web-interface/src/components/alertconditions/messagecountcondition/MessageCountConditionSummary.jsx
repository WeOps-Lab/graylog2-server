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

class MessageCountConditionSummary extends React.Component {
  static propTypes = {
    alertCondition: PropTypes.object.isRequired,
  };

  render() {
    const {alertCondition} = this.props;
    const {threshold} = alertCondition.parameters;
    let thresholdType = alertCondition.parameters.threshold_type.toLowerCase();
    const {time} = alertCondition.parameters;

    if (alertCondition.parameters.threshold_type.toLowerCase() == "more") {
      thresholdType = "大于";
    } else {
      thresholdType = "小于";
    }

    return (
      <span>
        在
        <Pluralize value={time} singular="最近一分钟" plural={`最近 ${time} 分钟`}/>内
        搜索到
        <Pluralize value={threshold} singular={` ${thresholdType} 一条日志消息`}
                   plural={` ${thresholdType} ${threshold} 条日志消息`}/>时触发告警。
        <GracePeriodSummary alertCondition={alertCondition}/>
        {' '}
        <BacklogSummary alertCondition={alertCondition}/>
        {' '}
        <RepeatNotificationsSummary alertCondition={alertCondition}/>
      </span>
    );
  }
}

export default MessageCountConditionSummary;
