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

import { Spinner, Timestamp } from 'components/common';
import { sortByDate } from 'util/SortUtils';
import { AlarmCallbackHistoryStore } from 'stores/alarmcallbacks/AlarmCallbackHistoryStore';
import { AlertNotificationsStore } from 'stores/alertnotifications/AlertNotificationsStore';

import style from './AlertTimeline.css';

const AlertTimeline = createReactClass({
  displayName: 'AlertTimeline',

  propTypes: {
    alert: PropTypes.object.isRequired,
    stream: PropTypes.object.isRequired,
    condition: PropTypes.object,
    conditionType: PropTypes.object,
  },

  mixins: [Reflux.connect(AlertNotificationsStore), Reflux.connect(AlarmCallbackHistoryStore)],

  _isLoading() {
    return !this.state.histories || !this.state.availableNotifications;
  },

  _historiesTimeline(lastEventTime) {
    const formattedHistories = [];

    if (this.state.histories.length === 0) {
      return [
        <dt key="history-title"><Timestamp dateTime={lastEventTime} /></dt>,
        <dd key="history-desc">没有触发任何告警通知</dd>,
      ];
    }

    this.state.histories
      .sort((h1, h2) => sortByDate(h1.created_at, h2.created_at))
      .forEach((history) => {
        const configuration = history.alarmcallbackconfiguration;
        const type = this.state.availableNotifications[configuration.type];
        let title;

        if (type) {
          title = <span><em>{configuration.title || '未命名的告警通知'}</em> ({type.name})</span>;
        } else {
          title = <span><em>未知的告警通知</em> <small>({configuration.type})</small></span>;
        }

        formattedHistories.push(
          <dt key={`${history.id}-title`}><Timestamp dateTime={history.created_at} /></dt>,
          (<dd key={`${history.id}-desc`}>
            Graylog {history.result.type === 'error' ?  '无法发送' : '发送'} {title} 通知
          </dd>),
        );
      });

    return formattedHistories;
  },

  _resolutionTimeline() {
    const formattedResolution = [];

    if (!this.props.alert.is_interval) {
      // Old alert without a resolution_at field
      formattedResolution.push(
        <dt key="resolution-title"><Timestamp dateTime={this.props.alert.triggered_at} /></dt>,
        <dd key="resolution-desc">这个告警不支持标记为已解决,当系统检测已解决的时候,会自动标记为已解决.</dd>,
      );
    } else if (this.props.alert.resolved_at) {
      formattedResolution.push(
        <dt key="resolution-title"><Timestamp dateTime={this.props.alert.resolved_at} /></dt>,
        <dd key="resolution-desc">当告警条件不满足的时候,标记告警为已解决</dd>,
      );
    } else {
      const conditionParameters = this.props.alert.condition_parameters || {};
      const repeatNotifications = conditionParameters.repeat_notifications || false;
      const notificationsText = (repeatNotifications
        ? '告警方式配置为重复通知,DataInsight会在告警解决之前不断的发出通知.'
        : '告警方式配置为不重复通知,仅会在告警已解决后再次触发时发出新通知');

      formattedResolution.push(
        <dt key="notifications-title"><Timestamp dateTime={new Date()} /></dt>,
        <dd key="notifications-desc">{notificationsText}</dd>,
        <dt key="resolution-title"><Timestamp dateTime={new Date()} /></dt>,
        <dd key="resolution-desc">告警条件依然满足, <strong>告警未解决</strong></dd>,
      );
    }

    return formattedResolution;
  },

  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    const { alert } = this.props;
    const conditionExists = this.props.condition && Object.keys(this.props.condition).length > 0;
    const condition = this.props.condition || {};
    const type = this.props.conditionType;
    const triggeredAtTimestamp = <Timestamp dateTime={alert.triggered_at} />;

    const title = (
      <span>
        <em>{conditionExists ? condition.title || '无标题的告警条件' : '未知的告警条件'}</em>{' '}
        ({type.name || condition.type || '未知的告警条件类型'})
      </span>
    );

    return (
      <dl className={`dl-horizontal ${style.alertTimeline}`}>
        <dt>{triggeredAtTimestamp}</dt>
        <dd>DataInsight在消息流  <em>{this.props.stream.title}</em> 中检查告警条件 {title}</dd>
        <dt>{triggeredAtTimestamp}</dt>
        <dd>{alert.description}</dd>
        <dt>{triggeredAtTimestamp}</dt>
        <dd>DataInsight触发了告警 {title} 并发出了告警通知</dd>
        {this._historiesTimeline(alert.triggered_at)}
        {this._resolutionTimeline()}
      </dl>
    );
  },
});

export default AlertTimeline;
