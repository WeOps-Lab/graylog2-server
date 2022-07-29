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

import { Link } from 'components/common/router';
import { Col, Label } from 'components/bootstrap';
import { EntityListItem, Timestamp } from 'components/common';
import Routes from 'routing/Routes';
import DateTime from 'logic/datetimes/DateTime';

import styles from './Alert.css';

class Alert extends React.Component {
  static propTypes = {
    alert: PropTypes.object.isRequired,
    alertCondition: PropTypes.object,
    stream: PropTypes.object.isRequired,
    conditionType: PropTypes.object.isRequired,
  };

  static defaultProps = {
    alertCondition: {},
  };

  state = {
    showAlarmCallbackHistory: false,
  };

  render() {
    const { alert, alertCondition, stream, conditionType } = this.props;

    let alertTitle;

    if (alertCondition) {
      alertTitle = (
        <span>
          <Link to={Routes.show_alert(alert.id)}>
            {alertCondition.title || '未命名的告警'}
          </Link>
          {' '}
          <small>在消息流 <em>{stream.title}</em></small>
        </span>
      );
    } else {
      alertTitle = (
        <span>
          <Link to={Routes.show_alert(alert.id)}>未知的告警</Link>
        </span>
      );
    }

    let statusBadge;

    if (!alert.is_interval || alert.resolved_at) {
      statusBadge = <Label bsStyle="success">已解决</Label>;
    } else {
      statusBadge = <Label bsStyle="danger">未解决</Label>;
    }

    let alertTime = <Timestamp dateTime={alert.triggered_at} />;

    if (alert.is_interval) {
      alertTime = (
        <span>
          在 {alertTime}触发,&nbsp;
          {alert.resolved_at
            ? <span>在<Timestamp dateTime={alert.resolved_at} /> 被解决.</span>
            : <span><strong>持续中</strong>.</span>}
        </span>
      );
    } else {
      alertTime = (
        <span>
          在 {alertTime} 触发
        </span>
      );
    }

    const content = (
      <Col md={12}>
        <dl className={`dl-horizontal ${styles.alertDescription}`}>
          <dt>原因:</dt>
          <dd>{alert.description}</dd>
          <dt>类型:</dt>
          <dd>{conditionType.name || '未知类型.这通常意味着告警条件在触发后被删除.'}</dd>
        </dl>
      </Col>
    );

    return (
      <EntityListItem key={`entry-list-${alert.id}`}
                      title={alertTitle}
                      titleSuffix={statusBadge}
                      description={alertTime}
                      contentRow={content} />
    );
  }
}

export default Alert;
