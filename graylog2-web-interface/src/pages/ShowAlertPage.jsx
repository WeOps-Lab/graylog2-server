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

import { LinkContainer } from 'components/common/router';
import { ButtonToolbar, Label, Tooltip, Button } from 'components/bootstrap';
import { DocumentTitle, OverlayElement, PageHeader, Spinner, Timestamp } from 'components/common';
import { AlertDetails } from 'components/alerts';
import DateTime from 'logic/datetimes/DateTime';
import UserNotification from 'util/UserNotification';
import Routes from 'routing/Routes';
import withParams from 'routing/withParams';
import { AlertsStore, AlertsActions } from 'stores/alerts/AlertsStore';
import { AlertConditionsStore, AlertConditionsActions } from 'stores/alertconditions/AlertConditionsStore';
import { StreamsStore } from 'stores/streams/StreamsStore';

import style from './ShowAlertPage.css';

const ShowAlertPage = createReactClass({
  displayName: 'ShowAlertPage',

  propTypes: {
    params: PropTypes.object.isRequired,
  },

  mixins: [Reflux.connect(AlertsStore), Reflux.connect(AlertConditionsStore)],

  getInitialState() {
    return {
      stream: undefined,
    };
  },

  componentDidMount() {
    this._loadData();
  },

  componentDidUpdate(prevProps, prevState) {
    if (prevState.alert !== this.state.alert) {
      this._loadAlertDetails(this.state.alert);
    }
  },

  _loadData() {
    AlertConditionsActions.available();
    AlertsActions.get(this.props.params.alertId);
  },

  _loadAlertDetails(alert) {
    StreamsStore.get(alert.stream_id, (stream) => {
      this.setState({ stream: stream });
    });

    AlertConditionsActions.get(alert.stream_id, alert.condition_id, (error) => {
      if (error.additional && error.additional.status === 404) {
        this.setState({ alertCondition: {} });
      } else {
        UserNotification.error(`获取告警条件${alert.condition_id}失败: ${error}`,
          '无法获取告警条件');
      }
    });
  },

  _isLoading() {
    return !this.state.alert || !this.state.alertCondition || !this.state.availableConditions || !this.state.stream;
  },

  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    const { alert } = this.state;
    const condition = this.state.alertCondition;
    const conditionExists = Object.keys(condition).length > 0;
    const conditionType = this.state.availableConditions[condition.type] || {};
    const { stream } = this.state;

    let statusLabel;
    let resolvedState;

    if (!alert.is_interval || alert.resolved_at) {
      statusLabel = <Label bsStyle="success">已解决</Label>;
      const resolvedAtTime = alert.resolved_at || alert.triggered_at;

      if (resolvedAtTime) {
        resolvedState = (
          <span>
            告警在 <Timestamp dateTime={resolvedAtTime} /> 被解决
          </span>
        );
      }
    } else {
      statusLabel = <Label bsStyle="danger">未解决</Label>;

      resolvedState = (
        <span>
          告警在{' '}
          <Timestamp dateTime={alert.triggered_at} />{' '}
          触发，并且还未解决
        </span>
      );
    }

    const title = (
      <span>{conditionExists ? condition.title || '无标题告警' : '未知的告警'}&nbsp;
        <small>
          在消息流 <em>{stream.title}</em>&nbsp;
          <span className={style.alertStatusLabel}>{statusLabel}</span>
        </small>
      </span>
    );

    const conditionDetailsTooltip = (
      <Tooltip id="disabled-condition-details">
        当告警触发的时候告警条件有可能被删除了，没有详细信息。
      </Tooltip>
    );

    return (
      <DocumentTitle title={`${conditionExists ? condition.title || '无标题告警' : '未知的告警'} 消息流 ${stream.title}`}>
        <div>
          <PageHeader title={title}>
            <span>
              查看告警的时间轴，包括告警过程中发送的通知和接受的消息
            </span>

            <span>
              {resolvedState}
            </span>

            <span>
              <ButtonToolbar>
                <LinkContainer to={Routes.LEGACY_ALERTS.LIST}>
                  <Button bsStyle="info">告警</Button>
                </LinkContainer>
                <OverlayElement overlay={conditionDetailsTooltip}
                                placement="top"
                                useOverlay={!condition.id}
                                trigger={['hover', 'focus']}>
                  <LinkContainer to={Routes.show_alert_condition(stream.id, condition.id)} disabled={!condition.id}>
                    <Button bsStyle="info">告警条件详情</Button>
                  </LinkContainer>
                </OverlayElement>
              </ButtonToolbar>
            </span>
          </PageHeader>

          <AlertDetails alert={alert} condition={conditionExists && condition} conditionType={conditionType} stream={stream} />
        </div>
      </DocumentTitle>
    );
  },
});

export default withParams(ShowAlertPage);
