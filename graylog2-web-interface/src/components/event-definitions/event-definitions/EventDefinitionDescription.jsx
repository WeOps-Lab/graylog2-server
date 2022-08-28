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
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
moment.locale('zh-cn');
import {} from 'moment-duration-format';
import lodash from 'lodash';
import styled, { css } from 'styled-components';

import { Button, Col, Row } from 'components/bootstrap';
import { Icon, Pluralize, Timestamp } from 'components/common';
import { EventDefinitionsActions } from 'stores/event-definitions/EventDefinitionsStore';

const DetailsList = styled.dl`
`;

const DetailTitle = styled.dt`
  float: left;
  clear: left;
`;

const DetailValue = styled.dd(({ theme }) => css`
  margin-left: 180px;
  word-wrap: break-word;

  &:not(:last-child) {
    border-bottom: 1px solid ${theme.colors.variant.lightest.default};
    margin-bottom: 5px;
    padding-bottom: 5px;
  }
`);

class EventDefinitionDescription extends React.Component {
  static propTypes = {
    definition: PropTypes.object.isRequired,
    context: PropTypes.object,
  };

  static defaultProps = {
    context: {},
  };

  static renderSchedulingInformation = (definition) => {
    let schedulingInformation = '未执行.';

    if (definition.config.search_within_ms && definition.config.execute_every_ms) {
      const executeEveryFormatted = moment.duration(definition.config.execute_every_ms)
        .format('d [天] h [小时] m [分钟] s [秒]', { trim: 'all', usePlural: false });
      const searchWithinFormatted = moment.duration(definition.config.search_within_ms)
        .format('d [天] h [小时] m [分钟] s [秒]]', { trim: 'all' });

      schedulingInformation = `每 ${executeEveryFormatted} 自动执行, 检索最近 ${searchWithinFormatted} 的消息.`;
    }

    return schedulingInformation;
  };

  static renderNotificationsInformation = (definition) => {
    let notificationsInformation = <span> <b>未</b> 触发任何通知.</span>;

    if (definition.notifications.length > 0) {
      notificationsInformation = (
        <span>
          触发 {definition.notifications.length}{' '}
          <Pluralize singular="通知" plural="通知" value={definition.notifications.length} />.
        </span>
      );
    }

    return notificationsInformation;
  };

  static clearNotifications = (definition) => {
    return () => {
      // eslint-disable-next-line no-alert
      if (window.confirm(`你确定要清除 "${definition.title}" 的排队通知吗？`)) {
        EventDefinitionsActions.clearNotificationQueue(definition);
      }
    };
  };

  constructor() {
    super();

    this.state = {
      showDetails: false,
    };
  }

  renderDetails = (definition, context) => {
    const { showDetails } = this.state;

    if (!showDetails) {
      return null;
    }

    const scheduleCtx = lodash.get(context, `scheduler.${definition.id}`, null);

    if (!scheduleCtx.is_scheduled) {
      return (<p>事件未启动自动检查,没有可用的详细信息.</p>);
    }

    let timerange = null;

    if (lodash.get(scheduleCtx, 'data.type', null) === 'event-processor-execution-v1') {
      const from = scheduleCtx.data.timerange_from;
      const to = scheduleCtx.data.timerange_to;

      timerange = (
        <>
          <DetailTitle>下一个时间范围:</DetailTitle>
          <DetailValue><Timestamp dateTime={from} /> <Icon name="arrow-circle-right" /> <Timestamp dateTime={to} /></DetailValue>
        </>
      );
    }

    return (
      <Row>
        <Col md={6}>
          <DetailsList>
            <DetailTitle>状态:</DetailTitle>
            <DetailValue>{scheduleCtx.status}</DetailValue>
            {scheduleCtx.triggered_at && (
              <>
                <DetailTitle>最后执行时间:</DetailTitle>
                <DetailValue><Timestamp dateTime={scheduleCtx.triggered_at} /></DetailValue>
              </>
            )}
            {scheduleCtx.next_time && (
              <>
                <DetailTitle>下一次执行时间:</DetailTitle>
                <DetailValue><Timestamp dateTime={scheduleCtx.next_time} /></DetailValue>
              </>
            )}
            {timerange}
            <DetailTitle>排队通知:</DetailTitle>
            <DetailValue>{scheduleCtx.queued_notifications}
              {scheduleCtx.queued_notifications > 0 && (
                <Button bsStyle="link" bsSize="xsmall" onClick={EventDefinitionDescription.clearNotifications(definition)}>
                  清除
                </Button>
              )}
            </DetailValue>
          </DetailsList>
        </Col>
      </Row>
    );
  };

  handleDetailsToggle = () => {
    const { showDetails } = this.state;

    this.setState({ showDetails: !showDetails });
  };

  render() {
    const { definition, context } = this.props;
    const { showDetails } = this.state;

    return (
      <>
        <p>{definition.description}</p>
        <p>
          {EventDefinitionDescription.renderSchedulingInformation(definition)} {EventDefinitionDescription.renderNotificationsInformation(definition)}
          <Button bsStyle="link" bsSize="xsmall" onClick={this.handleDetailsToggle}>
            {showDetails ? '隐藏' : '显示'} 详情
          </Button>
        </p>
        {this.renderDetails(definition, context)}
      </>
    );
  }
}

export default EventDefinitionDescription;
